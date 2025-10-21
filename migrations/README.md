# Database Migrations

This folder contains SQL migration files for the XSS Lab D1 database.

## Database Schema

### Users Table
Stores user account information.

| Column | Type | Description |
|--------|------|-------------|
| uuid | TEXT (PK) | Unique user identifier |
| username | TEXT (UNIQUE) | User's login username |
| password | TEXT | Hashed password |
| name | TEXT | User's display name |
| time_create | INTEGER | Unix timestamp of account creation |
| last_login | INTEGER | Unix timestamp of last login |

### Posts Table
Stores user-created posts/articles.

| Column | Type | Description |
|--------|------|-------------|
| post_uuid | TEXT (PK) | Unique post identifier |
| title | TEXT | Post title |
| content | TEXT | Post content |
| time_create | INTEGER | Unix timestamp of post creation |
| user_uuid | TEXT (FK) | Reference to users.uuid |

### Comments Table
Stores comments on posts.

| Column | Type | Description |
|--------|------|-------------|
| comment_id | TEXT (PK) | Unique comment identifier |
| content | TEXT | Comment content |
| user_uuid | TEXT (FK) | Reference to users.uuid |
| post_uuid | TEXT (FK) | Reference to posts.post_uuid |

## Running Migrations

### Local Development
```bash
# Apply migrations to local D1 database
npm run seedLocalD1
# or
wrangler d1 migrations apply DB --local
```

### Production
```bash
# Apply migrations to remote D1 database
wrangler d1 migrations apply DB --remote
# or
npm run predeploy
```

## Creating New Migrations

1. Create a new file in this folder with the naming pattern: `000X_description.sql`
2. Write your SQL migration code
3. Run the migration using the commands above

## Notes

- Migration files are executed in alphabetical order
- Use `IF NOT EXISTS` clauses to make migrations idempotent
- Always test migrations locally before applying to production
- The `0002_seed_data.sql` file is optional and for development/testing only

