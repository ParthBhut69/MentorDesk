# Admin Panel Setup Guide

## Making a User an Admin

To access the admin panel, you need to set a user's role to 'admin' in the database.

### Option 1: Using SQLite Command Line

1. Navigate to the server directory:
```bash
cd server
```

2. Open the SQLite database:
```bash
sqlite3 dev.sqlite3
```

3. View all users:
```sql
SELECT id, name, email, role FROM users;
```

4. Set a user as admin (replace `1` with the actual user ID):
```sql
UPDATE users SET role = 'admin' WHERE id = 1;
```

5. Verify the change:
```sql
SELECT id, name, email, role FROM users;
```

6. Exit SQLite:
```sql
.exit
```

### Option 2: Using a Database GUI Tool

1. Download and install [DB Browser for SQLite](https://sqlitebrowser.org/)
2. Open `server/dev.sqlite3`
3. Go to the "Browse Data" tab
4. Select the `users` table
5. Find your user and change the `role` column from `user` to `admin`
6. Click "Write Changes"

## Accessing the Admin Panel

1. **Login** with the admin user credentials
2. You'll see an **"Admin Panel"** link in the navbar
3. Click it to access the admin dashboard

## Admin Features

### Dashboard (`/admin`)
- View platform statistics
- Total users, active users, questions, and answers
- Recent activity metrics
- Quick action buttons

### User Management (`/admin/users`)
- View all users in a searchable table
- See user statistics (post count, join date, status)
- **Actions**:
  - View user details
  - Activate/Deactivate users
  - Delete users
- Search by name or email

### User Details (`/admin/users/:id`)
- Complete user profile information
- All questions posted by the user
- All answers given by the user
- User activity statistics

## Security

- All admin routes are protected by JWT authentication
- Only users with `role = 'admin'` can access admin endpoints
- Non-admin users are automatically redirected

## API Endpoints

All admin endpoints require an `Authorization: Bearer <token>` header:

- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/users` - List all users with post counts
- `GET /api/admin/users/:id` - Get specific user details
- `PUT /api/admin/users/:id` - Update user (role, status)
- `DELETE /api/admin/users/:id` - Delete user
