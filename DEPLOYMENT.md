# MentorDesk Deployment Guide

## ⚠️ CRITICAL: Database Configuration

**DO NOT use SQLite in production!** Render's filesystem is ephemeral, meaning:
- SQLite database gets wiped on every deployment
- User data will be lost
- File restarts cause data loss

**SOLUTION: You MUST use PostgreSQL on Render**

## Deploying to Render with PostgreSQL

### Step 1: Create PostgreSQL Database First

1. Go to Render Dashboard → "New +" → "PostgreSQL"
2. Configure:
   - **Name**: `mentordesk-db`
   - **Database**: `mentordesk`
   - **User**: `mentordesk`
   - **Region**: Same as your web service
   - **Plan**: Free (or paid for more resources)
3. Click "Create Database"
4. **IMPORTANT**: Wait for database to be created before proceeding

### Step 2: Create Web Service

1. Go to Render Dashboard → "New +" → "Web Service"
2. Connect your GitHub repository `ParthBhut69/MentorDesk`
4. Configure as follows:

**Build Settings:**
- **Name**: mentordesk
- **Environment**: Node
- **Build Command**: 
  ```bash
  npm install && npm run build && cd server && npm install && npx knex migrate:latest && npx knex seed:run
  ```
- **Start Command**: 
  ```bash
  cd server && npm start
  ```

**Environment Variables:**
Add these in Render dashboard:
- `NODE_ENV` = `production`
- `PORT` = `10000`
- `JWT_SECRET` = (Generate a random string)
- `GOOGLE_CLIENT_ID` = (Your Google OAuth Client ID)
- `VITE_API_URL` = (Leave empty or set to your Render URL)

#### 2. Important Notes

- **Database**: Currently using SQLite which works for development but may have limitations on Render
  - For production, consider upgrading to PostgreSQL
  - SQLite file will be stored in the service filesystem

- **Static Files**: Backend serves the built React app from `/dist` directory

- **API Calls**: Frontend makes same-origin requests (no CORS needed) since both are served from same domain

- **Client-Side Routing**: The catch-all route in `app.js` handles React Router paths

#### 3. Post-Deployment

1. **Test the Application**:
   - Visit your Render URL
   - Try logging in with seeded users:
     - `admin@mentordesk.com` / `password123`
     - `expert@mentordesk.com` / `password123`
     - `user@mentordesk.com` / `password123`

2. **Configure Google OAuth**:
   - Add your Render URL to Google Cloud Console OAuth settings
   - Authorized JavaScript origins: `https://your-app-name.onrender.com`
   - Authorized redirect URIs: `https://your-app-name.onrender.com`

#### 4. Upgrading to PostgreSQL (Recommended for Production)

If you want to use PostgreSQL on Render:

1. Create a PostgreSQL database in Render
2. Update `render.yaml` to include database configuration
3. Update `server/knexfile.js` to use PostgreSQL in production
4. Redeploy

### Troubleshooting

**Issue: User data disappears after deployment or restart**
- **Cause**: Using SQLite in production (Render's filesystem is ephemeral)
- **Solution**: 
  1. Create a PostgreSQL database in Render
  2. Update `DATABASE_URL` environment variable 
  3. Redeploy (migrations will run automatically)
  4. **Note**: Existing SQLite data will be lost. This is expected.

**Issue**: "Cannot GET /"
- **Solution**: Make sure build completed successfully and `/dist` folder exists

**Issue**: API calls failing
- **Solution**: Check that VITE_API_URL is either empty or set to your Render URL

**Issue**: Routes not working
- **Solution**: Verify the catch-all route in `server/app.js` is configured

**Issue**: Database not persisting
- **Solution**: SQLite file may be reset on redeploys. Upgrade to PostgreSQL for persistence.
