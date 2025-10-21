// API request and response types

// User related types
export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    uuid: string;
    username: string;
    name: string;
  };
  message?: string;
}

// Post related types
export interface CreatePostRequest {
  title: string;
  content: string;
}

export interface Post {
  post_uuid: string;
  title: string;
  content: string;
  time_create: number;
  user_uuid: string;
  username?: string;
  user_name?: string;
}

export interface PostResponse {
  success: boolean;
  post?: Post;
  posts?: Post[];
  message?: string;
}

// Comment related types
export interface CreateCommentRequest {
  content: string;
  post_uuid: string;
}

export interface Comment {
  comment_id: string;
  content: string;
  user_uuid: string;
  post_uuid: string;
  username?: string;
  user_name?: string;
}

export interface CommentResponse {
  success: boolean;
  comment?: Comment;
  comments?: Comment[];
  message?: string;
}

// Generic error response
export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
}

