-- Migration: Create initial database schema
-- Created: 2025-10-21

-- Table: users
-- Stores user account information
CREATE TABLE IF NOT EXISTS users (
    uuid TEXT PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    time_create INTEGER NOT NULL,
    last_login INTEGER
);

-- Table: posts
-- Stores user posts/articles
CREATE TABLE IF NOT EXISTS posts (
    post_uuid TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    time_create INTEGER NOT NULL,
    user_uuid TEXT NOT NULL,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE
);

-- Table: comments
-- Stores comments on posts
CREATE TABLE IF NOT EXISTS comments (
    comment_id TEXT PRIMARY KEY,
    content TEXT NOT NULL,
    user_uuid TEXT NOT NULL,
    post_uuid TEXT NOT NULL,
    FOREIGN KEY (user_uuid) REFERENCES users(uuid) ON DELETE CASCADE,
    FOREIGN KEY (post_uuid) REFERENCES posts(post_uuid) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_posts_user_uuid ON posts(user_uuid);
CREATE INDEX IF NOT EXISTS idx_posts_time_create ON posts(time_create DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_uuid ON comments(post_uuid);
CREATE INDEX IF NOT EXISTS idx_comments_user_uuid ON comments(user_uuid);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

