-- Migration: Seed sample data (optional)
-- Created: 2025-10-21
-- This file is for development/testing purposes

-- Sample users
INSERT OR IGNORE INTO users (uuid, username, password, name, time_create, last_login) 
VALUES 
    ('user-001', 'admin', 'hashed_password_here', 'Administrator', strftime('%s', 'now'), NULL),
    ('user-002', 'testuser', 'hashed_password_here', 'Test User', strftime('%s', 'now'), NULL);

-- Sample posts
INSERT OR IGNORE INTO posts (post_uuid, title, content, time_create, user_uuid)
VALUES
    ('post-001', 'Welcome to XSS Lab', 'This is a sample post for testing XSS vulnerabilities.', strftime('%s', 'now'), 'user-001'),
    ('post-002', 'Getting Started', 'Learn how to use this platform safely.', strftime('%s', 'now'), 'user-001');

-- Sample comments
INSERT OR IGNORE INTO comments (comment_id, content, user_uuid, post_uuid)
VALUES
    ('comment-001', 'Great post!', 'user-002', 'post-001'),
    ('comment-002', 'Thanks for sharing.', 'user-002', 'post-002');

