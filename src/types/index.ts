import type {
  Post,
  User,
  Category,
  District,
  Connection,
  Message,
  PostType,
  PostStatus,
  UrgencyLevel,
  ConnectionStatus,
} from "@/generated/prisma/client";

// ─── API Response ────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// ─── Post Types ──────────────────────────────────────────

export interface CreatePostInput {
  type: PostType;
  description: string;
  categoryId: string;
  districtId: string;
  urgency?: UrgencyLevel;
}

export interface UpdatePostInput {
  description?: string;
  categoryId?: string;
  districtId?: string;
  urgency?: UrgencyLevel;
  status?: PostStatus;
}

export interface PostFilters {
  type?: PostType;
  status?: PostStatus;
  categoryId?: string;
  districtId?: string;
  urgency?: UrgencyLevel;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PostWithRelations extends Post {
  user: Pick<User, "id" | "name" | "image" | "averageRating">;
  category: Category;
  district: District;
  _count?: {
    connections: number;
  };
}

// ─── Connection Types ────────────────────────────────────

export interface CreateConnectionInput {
  postId: string;
}

export interface UpdateConnectionInput {
  status?: ConnectionStatus;
  proofImageUrl?: string;
  proofNote?: string;
  giverRating?: number;
  requesterRating?: number;
  giverReview?: string;
  requesterReview?: string;
}

export interface ConnectionWithRelations extends Connection {
  post: Post & { category: Category };
  giver: Pick<User, "id" | "name" | "image">;
  requester: Pick<User, "id" | "name" | "image">;
  _count?: {
    messages: number;
  };
}

// ─── Message Types ───────────────────────────────────────

export interface CreateMessageInput {
  connectionId: string;
  content: string;
}

export interface MessageWithSender extends Message {
  sender: Pick<User, "id" | "name" | "image">;
}

// ─── Re-export Prisma types for convenience ──────────────

export type {
  User,
  Post,
  Category,
  District,
  Connection,
  Message,
  PostType,
  PostStatus,
  UrgencyLevel,
  ConnectionStatus,
};
