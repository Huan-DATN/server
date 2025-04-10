import { z } from "zod";

// Enums
export const RoleEnum = z.enum(["BUYER", "SELLER", "ADMIN"]);
export const OrderStatusTypeEnum = z.enum([
  "PENDING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]);

// User
export const UserSchema = z.object({
  id: z.number().int(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  email: z.string().email(),
  shopName: z.string().nullable().optional(),
  password: z.string(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  role: RoleEnum.default("BUYER"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Session
export const SessionSchema = z.object({
  token: z.string(),
  userId: z.number().int(),
  expiresAt: z.date(),
  createdAt: z.date(),
});

// CartItem
export const CartItemSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  productId: z.number().int(),
  quantity: z.number().int(),
  createdAt: z.date(),
  updatedAt: z.date(),

  product: z
    .object({
      id: z.number().int(),
      name: z.string(),
      price: z.number(),
      description: z.string().nullable().optional(),
    })
    .optional(),
});

// Product
export const ProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  userId: z.number().int(),
  quantity: z.number().int(),
  image: z.string().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  groupProductId: z.number().int(),
  categoryId: z.number().int(),
  isActive: z.boolean().default(true),
  groupProduct: z
    .object({
      id: z.number().int(),
      name: z.string(),
      image: z.string().nullable().optional(),
      isActive: z.boolean().default(true),
    })
    .optional(),
  category: z.object({
    id: z.number().int(),
    name: z.string(),
    isActive: z.boolean().default(true),
  }),
});

// OrderDetail
export const OrderDetailSchema = z.object({
  id: z.number().int(),
  userId: z.number().int(),
  addressLine: z.string(),
  phone: z.string(),
  total: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),

  shop: z.object({
    id: z.number().int(),
    shopName: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
  }),
});

// OrderItem
export const OrderItemSchema = z.object({
  id: z.number().int(),
  orderId: z.number().int(),
  productId: z.number().int(),
  quantity: z.number().int(),
  unitPrice: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),

  product: z
    .object({
      id: z.number().int(),
      name: z.string(),
      price: z.number(),
      description: z.string().nullable().optional(),
    })
    .optional(),
});

// Category
export const CategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// GroupProduct
export const GroupProductSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  image: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Status
export const StatusSchema = z.object({
  id: z.number().int(),
  type: OrderStatusTypeEnum,
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// OrderStatus
export const OrderStatusSchema = z.object({
  id: z.number().int(),
  orderId: z.number().int(),
  statusId: z.number().int(),
  createdAt: z.date(),
});
