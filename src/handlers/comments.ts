// Comments handlers (create, get)
import { generateUUID } from '../utils/crypto';
import { successResponse, errorResponse, unauthorized } from '../utils/response';
import { validateCreateComment, formatValidationErrors } from '../utils/validation';
import type { CreateCommentRequest, CommentResponse, Comment } from '../types/api';
import type { JWTPayload } from '../utils/jwt';

// Create a new comment
export async function handleCreateComment(request: Request, env: Env, user: JWTPayload | null): Promise<Response> {
  try {
    if (!user) {
      return unauthorized('You must be logged in to comment');
    }

    const body = await request.json() as CreateCommentRequest;
    const { content, post_uuid } = body;

    // Validate input
    const validation = validateCreateComment({ content, post_uuid });
    if (!validation.valid) {
      return errorResponse(formatValidationErrors(validation));
    }

    // Check if post exists
    const post = await env.DB.prepare(
      'SELECT post_uuid FROM posts WHERE post_uuid = ?'
    ).bind(post_uuid).first();

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    // Generate UUID and create comment
    const commentId = generateUUID();

    await env.DB.prepare(
      'INSERT INTO comments (comment_id, content, user_uuid, post_uuid) VALUES (?, ?, ?, ?)'
    ).bind(commentId, content, user.uuid, post_uuid).run();

    // Get the created comment with user info
    const comment = await env.DB.prepare(`
      SELECT c.*, u.username, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_uuid = u.uuid
      WHERE c.comment_id = ?
    `).bind(commentId).first() as any;

    const response: CommentResponse = {
      success: true,
      comment: comment as Comment
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error('Create comment error:', error);
    return errorResponse('Failed to create comment', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Get comments for a post
export async function handleGetComments(request: Request, env: Env, postUuid: string): Promise<Response> {
  try {
    // Check if post exists
    const post = await env.DB.prepare(
      'SELECT post_uuid FROM posts WHERE post_uuid = ?'
    ).bind(postUuid).first();

    if (!post) {
      return errorResponse('Post not found', 404);
    }

    const { results } = await env.DB.prepare(`
      SELECT c.*, u.username, u.name as user_name
      FROM comments c
      JOIN users u ON c.user_uuid = u.uuid
      WHERE c.post_uuid = ?
      ORDER BY c.comment_id ASC
    `).bind(postUuid).all();

    const response: CommentResponse = {
      success: true,
      comments: results as Comment[]
    };

    return successResponse(response);
  } catch (error) {
    console.error('Get comments error:', error);
    return errorResponse('Failed to get comments', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

// Get all comments by a user
export async function handleGetUserComments(request: Request, env: Env, user: JWTPayload | null): Promise<Response> {
  try {
    if (!user) {
      return unauthorized('You must be logged in to view your comments');
    }

    const { results } = await env.DB.prepare(`
      SELECT c.*, u.username, u.name as user_name, p.title as post_title
      FROM comments c
      JOIN users u ON c.user_uuid = u.uuid
      JOIN posts p ON c.post_uuid = p.post_uuid
      WHERE c.user_uuid = ?
      ORDER BY c.comment_id DESC
    `).bind(user.uuid).all();

    const response: CommentResponse = {
      success: true,
      comments: results as Comment[]
    };

    return successResponse(response);
  } catch (error) {
    console.error('Get user comments error:', error);
    return errorResponse('Failed to get your comments', 500, error instanceof Error ? error.message : 'Unknown error');
  }
}

