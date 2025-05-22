import express from "express";
import SSE from "express-sse";
import checkLoggedInMiddleware from "../middlewares/auth.middleware";
import ChatService from "../services/chat-service";
import { BaseController } from "./abstractions/base-controller";

export default class ChatController extends BaseController {
  public path = "/chat";
  private chatService: ChatService;
  private sseConnections: Map<string, SSE>;

  constructor() {
    super();
    this.chatService = new ChatService();
    this.sseConnections = new Map();
    this.initializeRoutes();
  }

  public initializeRoutes() {
    // Send message and get stream
    this.router.post(
      `${this.path}/stream`,
      checkLoggedInMiddleware,
      this.streamMessage,
    );

    // Get conversation by id
    this.router.get(
      `${this.path}/:conversationId`,
      checkLoggedInMiddleware,
      this.getConversationById,
    );

    // Get chat history
    this.router.get(
      `${this.path}`,
      checkLoggedInMiddleware,
      this.getChatHistory,
    );

    // Rename chat
    this.router.patch(
      `${this.path}/:conversationId`,
      checkLoggedInMiddleware,
      this.renameChat,
    );

    // Delete chat
    this.router.delete(
      `${this.path}/:conversationId`,
      checkLoggedInMiddleware,
      this.deleteChat,
    );
  }

  // Send message with SSE support
  streamMessage = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const { prompt, conversationId } = request.body;

      // Validate request body
      if (!prompt) {
        return response.status(400).json({
          message: "Bad request",
          errors: [{ field: "prompt", message: "Prompt is required" }],
        });
      }

      // Set headers for SSE
      response.setHeader("Content-Type", "text/event-stream");
      response.setHeader("Cache-Control", "no-cache");
      response.setHeader("Connection", "keep-alive");
      response.setHeader("X-Accel-Buffering", "no");

      // Create a unique connection ID for this user session
      const connectionId = `${userId}-${Date.now()}`;
      const sse = new SSE();

      // Store the SSE connection
      this.sseConnections.set(connectionId, sse);

      // Initialize SSE for this request/response
      sse.init(request, response);

      // Start process in the background
      (async () => {
        try {
          // Get message stream from service
          const conversation = await this.chatService.getMessageStream(
            { id: userId },
            {
              prompt: prompt.trim(),
              conversationId: conversationId || undefined,
            },
          );

          // Send initial message
          if (conversation.message) {
            sse.send({
              type: "message",
              data: conversation.message,
            });
          }

          // Send conversation metadata
          if (conversation.conversation) {
            sse.send({
              type: "metadata",
              data: conversation.conversation,
            });
          }

          // Complete the stream
          sse.send({
            type: "done",
            data: { complete: true },
          });

          // Close the connection
          setTimeout(() => {
            this.sseConnections.delete(connectionId);
          }, 1000);
        } catch (error) {
          console.error("Streaming error:", error);

          // Send error
          sse.send({
            type: "error",
            data: {
              message: error instanceof Error ? error.message : "Unknown error",
            },
          });

          // Close the connection
          this.sseConnections.delete(connectionId);
        }
      })();
    } catch (error) {
      console.error("General error:", error);
      next(error);
    }
  };

  // Get conversation by ID
  getConversationById = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const { conversationId } = request.params;
      const pagination = request.query;

      const result = await this.chatService.getConversationById(
        { id: userId },
        conversationId,
        pagination,
      );

      return response.send({
        message: "Conversation fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Get chat history
  getChatHistory = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const chatHistoryDto = {
        search: request.query.search as string | undefined,
        fromDate: request.query.fromDate
          ? new Date(request.query.fromDate as string)
          : undefined,
        toDate: request.query.toDate
          ? new Date(request.query.toDate as string)
          : undefined,
        sort: request.query.sort as "ASC" | "DESC" | undefined,
      };
      const pagination = {
        page: request.query.page as string | undefined,
        limit: request.query.limit as string | undefined,
      };

      const result = await this.chatService.getChatHistory(
        { id: userId },
        chatHistoryDto,
        pagination,
      );

      return response.send({
        message: "Chat history fetched successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Rename chat
  renameChat = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const { conversationId } = request.params;
      const chatRename = {
        newTitle: request.body.name || request.body.newTitle,
      };

      const result = await this.chatService.renameChat(
        { id: userId },
        conversationId,
        chatRename,
      );

      return response.send({
        message: "Chat renamed successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  // Delete chat
  deleteChat = async (
    request: express.Request,
    response: express.Response,
    next: express.NextFunction,
  ) => {
    try {
      const userId = Number(request.headers.userId as string);
      const { conversationId } = request.params;

      const result = await this.chatService.deleteChat(
        { id: userId },
        conversationId,
      );

      return response.send({
        message: "Chat deleted successfully",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };
}
