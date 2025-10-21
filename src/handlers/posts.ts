// Posts handlers (create, get, search)
import { generateUUID } from '../utils/crypto';
import { successResponse, errorResponse, unauthorized } from '../utils/response';
import { validateCreatePost, validateSearchQuery, formatValidationErrors } from '../utils/validation';
import type { CreatePostRequest, PostResponse, Post } from '../types/api';
import type { JWTPayload } from '../utils/jwt';

// Create a new post
export async function handleCreatePost(request: Request, env: Env, user: JWTPayload | null): Promise<Response> {
  try {
    if (!user) {
      return unauthorized('You must be logged in to create a post');
    }

    const body = await request.json() as CreatePostRequest;
    const { title, content } = body;

    // Validate input
    const validation = validateCreatePost({ title, content });
    if (!validation.valid) {
      return errorResponse(formatValidationErrors(validation));
    }

    // Generate UUID and create post
    const postUuid = generateUUID();
    const timeCreate = Math.floor(Date.now() / 1000);

    await env.DB.prepare(
      'INSERT INTO posts (post_uuid, title, content, time_create, user_uuid) VALUES (?, ?, ?, ?, ?)'
    ).bind(postUuid, title, content, timeCreate, user.uuid).run();

    // Get the created post with user info
    const post = await env.DB.prepare(`
      SELECT p.*, u.username, u.name as user_name
      FROM posts p
      JOIN users u ON p.user_uuid = u.uuid
      WHERE p.post_uuid = ?
    `).bind(postUuid).first() as any;

    const response: PostResponse = {
      success: true,
      post: post as Post
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error('Create post error:', error);
    return errorResponse('Failed to create post', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Get all posts (public feed)
export async function handleGetPosts(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const { results } = await env.DB.prepare(`
      SELECT p.*, u.username, u.name as user_name
      FROM posts p
      JOIN users u ON p.user_uuid = u.uuid
      ORDER BY p.time_create DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    const response: PostResponse = {
      success: true,
      posts: results as Post[]
    };

    return successResponse(response);
  } catch (error) {
    console.error('Get posts error:', error);
    return errorResponse('Failed to get posts', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Get user's own posts
export async function handleGetMyPosts(request: Request, env: Env, user: JWTPayload | null): Promise<Response> {
  try {
    if (!user) {
      return unauthorized('You must be logged in to view your posts');
    }

    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const { results } = await env.DB.prepare(`
      SELECT p.*, u.username, u.name as user_name
      FROM posts p
      JOIN users u ON p.user_uuid = u.uuid
      WHERE p.user_uuid = ?
      ORDER BY p.time_create DESC
      LIMIT ? OFFSET ?
    `).bind(user.uuid, limit, offset).all();

    const response: PostResponse = {
      success: true,
      posts: results as Post[]
    };

    return successResponse(response);
  } catch (error) {
    console.error('Get my posts error:', error);
    return errorResponse('Failed to get your posts', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Search posts by title or content
export async function handleSearchPosts(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    // Validate search query
    const validation = validateSearchQuery(query);
    if (!validation.valid) {
      return errorResponse(formatValidationErrors(validation));
    }

    const searchPattern = `%${query}%`;

    const { results } = await env.DB.prepare(`
      SELECT p.*, u.username, u.name as user_name
      FROM posts p
      JOIN users u ON p.user_uuid = u.uuid
      WHERE p.title LIKE ? OR p.content LIKE ?
      ORDER BY p.time_create DESC
      LIMIT ? OFFSET ?
    `).bind(searchPattern, searchPattern, limit, offset).all();

    const response: PostResponse = {
      success: true,
      posts: results as Post[]
    };

    return successResponse(response);
  } catch (error) {
    console.error('Search posts error:', error);
    return errorResponse('Failed to search posts', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Get a single post by UUID
export async function handleGetPost(request: Request, env: Env, postUuid: string): Promise<Response> {
  try {
    const post = await env.DB.prepare(`
      SELECT p.*, u.username, u.name as user_name
      FROM posts p
      JOIN users u ON p.user_uuid = u.uuid
      WHERE p.post_uuid = ?
    `).bind(postUuid).first() as any;

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    const response: PostResponse = {
      success: true,
      post: post as Post
    };

    return successResponse(response);
  } catch (error) {
    console.error('Get post error:', error);
    return errorResponse('Failed to get post', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Delete all posts (NO AUTH REQUIRED - FOR XSS LAB TESTING)
export async function handleDeleteAllPosts(request: Request, env: Env): Promise<Response> {
  try {
    // Get count before deletion for response
    const countResult = await env.DB.prepare('SELECT COUNT(*) as count FROM posts').first() as any;
    const deletedCount = countResult?.count || 0;

    // Delete all posts
    await env.DB.prepare('DELETE FROM posts').run();

    // Also delete all comments since posts are gone
    await env.DB.prepare('DELETE FROM comments').run();

    const response = {
      success: true,
      message: `Successfully deleted all posts and comments`,
      deleted_posts: deletedCount,
      deleted_comments: 'all'
    };

    return successResponse(response);
  } catch (error) {
    console.error('Delete all posts error:', error);
    return errorResponse('Failed to delete all posts', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

