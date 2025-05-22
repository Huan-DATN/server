import { Prisma, PrismaClient } from ".prisma/client";
import axios from "axios";
import envConfig from "../config";
import { EntityError } from "../utils/errors";

interface User {
  id: number;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface ChatHistoryDto {
  search?: string;
  fromDate?: Date;
  toDate?: Date;
  sort?: "ASC" | "DESC";
}

interface ChatRenameDto {
  newTitle: string;
}

interface ChatSendDto {
  prompt: string;
  conversationId?: string;
}

// For the message schema
interface MessageData {
  type: string;
  content: string;
}

interface MessageJson {
  title?: string;
  data?: MessageData;
  lastActive?: string; // Store as ISO string instead of Date object
}

// Define interfaces for the custom schema field names
interface SessionIdGroup {
  session_id: string;
}

class ChatService {
  private prisma: PrismaClient;
  private apiUrl: string;

  constructor() {
    this.prisma = new PrismaClient();
    this.apiUrl = envConfig.CHATBOT_URL;
  }

  async getMessageStream(user: User, chatSendDto: ChatSendDto) {
    // Validate input parameters
    if (!chatSendDto || !chatSendDto.prompt) {
      throw new EntityError([
        {
          field: "prompt",
          message: "Prompt is required",
        },
      ]);
    }

    let conversation;
    const { prompt, conversationId } = chatSendDto;

    if (!conversationId) {
      conversation = await this.createConversation(user, chatSendDto);
    } else {
      conversation = await this.findOne(user.id, conversationId);

      // Update last active time in the message JSON
      await this.prisma.chatMessageHistory.update({
        where: {
          id: conversation.id,
        },
        data: {
          message: {
            ...(conversation.message as any),
            lastActive: new Date().toISOString(),
          } as Prisma.InputJsonValue,
        },
      });
    }

    try {
      // Since we don't have Redis in this Express app, we'll handle the response differently
      // This would normally need to be adapted with a proper streaming solution
      const response = await this.generateResponse(
        prompt,
        conversation.session_id,
      );

      return {
        message: response,
        conversation: {
          id: conversation.id,
          title: (conversation.message as any)?.title || "New conversation",
        },
      };
    } catch (error) {
      throw new EntityError([
        {
          field: "getMessageStream",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      ]);
    }
  }

  async getConversationById(
    user: User,
    conversationId: string,
    pagination: PaginationQuery,
  ) {
    try {
      const page = Number(pagination.page) || 1;
      const limit = Number(pagination.limit) || 10;
      const skip = (page - 1) * limit;

      // First, verify that the user has access to this conversation
      const userChat = await this.prisma.userChat.findFirst({
        where: {
          userId: user.id,
          ChatMessageHistory: {
            session_id: conversationId,
          },
        },
      });

      if (!userChat) {
        throw new EntityError([
          {
            field: "conversationId",
            message: "Conversation not found or access denied",
          },
        ]);
      }

      // Get all messages for this conversation
      const messages = await this.prisma.chatMessageHistory.findMany({
        where: {
          session_id: conversationId,
        },
        orderBy: {
          createdAt: "desc", // lowercase for Prisma enum
        },
        skip,
        take: limit,
      });

      if (messages.length === 0) {
        throw new EntityError([
          {
            field: "conversationId",
            message: "Conversation not found",
          },
        ]);
      }

      const total = await this.prisma.chatMessageHistory.count({
        where: {
          session_id: conversationId,
          UserChat: {
            some: {
              userId: user.id,
            },
          },
        },
      });

      // Format messages to extract content and role safely
      const result = messages.map((item) => {
        const messageObj = item.message as any;
        return {
          content: messageObj?.data?.content || "",
          role: messageObj?.data?.type || "system",
          id: item.id,
          createdAt: item.createdAt,
        };
      });

      return {
        items: result,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      if (error instanceof EntityError) throw error;
      throw new EntityError([
        {
          field: "getConversationById",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      ]);
    }
  }

  private async createConversation(user: User, chatSendDto: ChatSendDto) {
    if (!chatSendDto || !chatSendDto.prompt) {
      throw new EntityError([
        {
          field: "prompt",
          message: "Prompt is required",
        },
      ]);
    }

    const { prompt } = chatSendDto;
    // Generate title from prompt safely
    const title =
      prompt && prompt.length > 50
        ? prompt.slice(0, 50)
        : prompt || "New conversation";
    const sessionId = `session-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}`;

    try {
      // Create a new chat message history entry
      const newConversation = await this.prisma.chatMessageHistory.create({
        data: {
          session_id: sessionId,
          message: {
            title,
            data: {
              type: "system",
              content: "Conversation started",
            },
            lastActive: new Date().toISOString(), // Store as ISO string instead of Date object
          } as Prisma.InputJsonValue,
          // Connect this message to the user through UserChat
          UserChat: {
            create: {
              userId: user.id,
            },
          },
        },
        include: {
          UserChat: true,
        },
      });

      return {
        ...newConversation,
        session_id: sessionId,
      };
    } catch (error) {
      throw new EntityError([
        {
          field: "createConversation",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      ]);
    }
  }

  async getChatHistory(
    user: User,
    chatHistoryDto: ChatHistoryDto,
    pagination: PaginationQuery,
  ) {
    const { search, fromDate, toDate, sort } = chatHistoryDto;
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    try {
      // Get all chat sessions that the user has access to through UserChat
      const userChatSessions = await this.prisma.userChat.findMany({
        where: {
          userId: user.id,
        },
        include: {
          ChatMessageHistory: true,
        },
        orderBy: {
          createdAt: sort === "ASC" ? "asc" : "desc",
        },
        skip,
        take: limit,
      });

      // Group by session_id and get the first message of each conversation
      const conversations = [];
      const sessionIds = new Set();

      for (const userChat of userChatSessions) {
        const chatHistory = userChat.ChatMessageHistory;
        if (!sessionIds.has(chatHistory.session_id)) {
          sessionIds.add(chatHistory.session_id);

          // Apply search filter if provided
          const messageObj = chatHistory.message as any;
          const title = messageObj?.title || "Untitled conversation";

          if (search && !title.toLowerCase().includes(search.toLowerCase())) {
            continue;
          }

          // Apply date filters
          if (
            fromDate &&
            new Date(chatHistory.createdAt) < new Date(fromDate)
          ) {
            continue;
          }

          if (toDate && new Date(chatHistory.createdAt) > new Date(toDate)) {
            continue;
          }

          // Count messages in this conversation
          const messageCount = await this.prisma.chatMessageHistory.count({
            where: {
              session_id: chatHistory.session_id,
              UserChat: {
                some: {
                  userId: user.id,
                },
              },
            },
          });

          conversations.push({
            id: chatHistory.session_id,
            title,
            lastActive: messageObj?.lastActive || chatHistory.createdAt,
            createdAt: chatHistory.createdAt,
            messageCount,
          });
        }
      }

      // Get total count of unique conversations for pagination
      const totalUserChats = await this.prisma.userChat.findMany({
        where: {
          userId: user.id,
        },
        include: {
          ChatMessageHistory: true,
        },
      });

      const uniqueSessionIds = new Set();
      totalUserChats.forEach((chat) => {
        uniqueSessionIds.add(chat.ChatMessageHistory.session_id);
      });

      return {
        items: conversations,
        meta: {
          total: uniqueSessionIds.size,
          page,
          limit,
          totalPages: Math.ceil(uniqueSessionIds.size / limit),
        },
      };
    } catch (error) {
      throw new EntityError([
        {
          field: "getChatHistory",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      ]);
    }
  }

  async renameChat(
    user: User,
    conversationId: string,
    chatRename: ChatRenameDto,
  ) {
    const { newTitle } = chatRename;

    try {
      // Find the conversation and verify user access
      const userChat = await this.prisma.userChat.findFirst({
        where: {
          userId: user.id,
          ChatMessageHistory: {
            session_id: conversationId,
          },
        },
        include: {
          ChatMessageHistory: true,
        },
      });

      if (!userChat) {
        throw new EntityError([
          {
            field: "conversation",
            message: "Conversation not found or access denied",
          },
        ]);
      }

      const conversation = userChat.ChatMessageHistory;
      const messageObj = conversation.message as any;

      // Update the message JSON to include the new title
      const updatedConversation = await this.prisma.chatMessageHistory.update({
        where: {
          id: conversation.id,
        },
        data: {
          message: {
            ...messageObj,
            title: newTitle,
          } as Prisma.InputJsonValue,
        },
      });

      return {
        id: conversationId,
        title: newTitle,
      };
    } catch (error) {
      if (error instanceof EntityError) throw error;
      throw new EntityError([
        {
          field: "renameChat",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      ]);
    }
  }

  async deleteChat(user: User, conversationId: string) {
    try {
      // Find all UserChat records for this user and conversation
      const userChats = await this.prisma.userChat.findMany({
        where: {
          userId: user.id,
          ChatMessageHistory: {
            session_id: conversationId,
          },
        },
      });

      if (userChats.length === 0) {
        throw new EntityError([
          {
            field: "conversation",
            message: "Conversation not found or access denied",
          },
        ]);
      }

      // Delete the UserChat connections first
      for (const userChat of userChats) {
        await this.prisma.userChat.delete({
          where: {
            id: userChat.id,
          },
        });
      }

      // Now delete the messages
      await this.prisma.chatMessageHistory.deleteMany({
        where: {
          session_id: conversationId,
          UserChat: {
            none: {}, // Only delete if no UserChat connections remain
          },
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof EntityError) throw error;
      throw new EntityError([
        {
          field: "deleteChat",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      ]);
    }
  }

  private async findOne(userId: number, conversationId: string) {
    // Find the conversation through UserChat to verify access
    const userChat = await this.prisma.userChat.findFirst({
      where: {
        userId: userId,
        ChatMessageHistory: {
          session_id: conversationId,
        },
      },
      include: {
        ChatMessageHistory: true,
      },
    });

    if (!userChat) {
      throw new EntityError([
        {
          field: "conversation",
          message: "Conversation not found or access denied",
        },
      ]);
    }

    return userChat.ChatMessageHistory;
  }

  private async generateResponse(
    message: string,
    session_id = "Generate-Title",
  ) {
    try {
      console.log(
        `Calling AI API with session_id: ${session_id}, message: ${message.substring(
          0,
          50,
        )}...`,
      );

      const response = await axios.post(`${this.apiUrl}/api/chat`, {
        message,
        session_id,
      });

      console.log(`AI API response received for session: ${session_id}`);
      return response.data.response.content;
    } catch (error) {
      console.error("Error calling AI API:", error);

      // More detailed error handling
      if (axios.isAxiosError(error)) {
        const statusCode = error.response?.status;
        const responseData = error.response?.data;
        console.error(`API Error (${statusCode}):`, responseData);

        throw new EntityError([
          {
            field: "generateResponse",
            message: `API Error (${statusCode}): ${
              responseData?.message || error.message || "Unknown error"
            }`,
          },
        ]);
      }

      throw new EntityError([
        {
          field: "generateResponse",
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      ]);
    }
  }
}

export default ChatService;
