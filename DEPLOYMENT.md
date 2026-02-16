# MentorDesk Deployment Guide

## 🚀 Recommended Method: Render Blueprint (Easiest)

This project includes a `render.yaml` file that automates the deployment of both the Web Service and the PostgreSQL Database.

### Step 1: Connect to Render
1.  Push your latest code to GitHub.
2.  Log in to the [Render Dashboard](https://dashboard.render.com/).
3.  Click the **"New +"** button and select **"Blueprint"**.
4.  Connect your GitHub repository `ParthBhut69/MentorDesk`.

### Step 2: Configure Blueprint
1.  Give your service a name (e.g., `mentordesk`).
2.  Render will detect the `render.yaml` file.
3.  **Review the resources**:
    -   `mentordesk` (Web Service)
    -   `mentordesk-db` (PostgreSQL Database)
4.  **Environment Variables**:
    -   Render will prompt you for `GOOGLE_CLIENT_ID` and `VITE_GOOGLE_CLIENT_ID`. Enter your Google OAuth Client ID for both.
    -   `JWT_SECRET` will be auto-generated.
    -   `DATABASE_URL` will be auto-linked.
5.  Click **"Apply"**.

### Step 3: Wait for Deployment
Render will now:
1.  Create the database.
2.  Build your frontend (`npm install && npm run build`).
3.  Build your backend (`cd server && npm install`).
4.  Run database migrations (`npx knex migrate:latest`).
5.  Start the server.

---

## 🛠️ Method 2: Manual Deployment

If you prefer to set up services manually:

### Step 1: Create PostgreSQL Database
1.  Go to Render Dashboard → **"New +"** → **"PostgreSQL"**.
2.  **Name**: `mentordesk-db`
3.  **Database**: `mentordesk`
4.  **User**: `mentordesk`
5.  **Region**: Select the region closest to you (e.g., Singapore, Oregon).
6.  **Plan**: Free.
7.  Click **"Create Database"**.
8.  **Copy the "Internal Database URL"** once created.

### Step 2: Create Web Service
1.  Go to Render Dashboard → **"New +"** → **"Web Service"**.
2.  Connect your repository.
3.  **Settings**:
    -   **Name**: `mentordesk`
    -   **Runtime**: Node
    -   **Build Command**:
        npm install --include=dev && npm run build && cd server && npm install && npx knex migrate:latest && npx knex seed:run
    -   **Start Command**:
        ```bash
        cd server && NODE_ENV=production npm start
        ```
4.  **Environment Variables** (Add these):
    -   `NODE_ENV`: `production`
    -   `DATABASE_URL`: 'postgresql://mentordesk:4d9d0my58HmSVUj7l00pJqfqDzxOzz61@dpg-d69l8nvgi27c73cik6c0-a/mentordesk'
    -   `JWT_SECRET`: (Generate a secure random string)
    -   `GOOGLE_CLIENT_ID`: 775076359358-86jqrmiqdljhm3q83jpei7vbroi5sfa6.apps.googleusercontent.com
    -   `VITE_GOOGLE_CLIENT_ID`: 775076359358-86jqrmiqdljhm3q83jpei7vbroi5sfa6.apps.googleusercontent.com
    -   `PORT`: `10000`

### Step 3: Deploy
Click **"Create Web Service"**.

---

## ✅ Post-Deployment Verification

1.  **Visit your URL**: Go to `https://mentordesk.onrender.com` (or your specific URL).
2.  **Test Registration**: Sign up a new user to verify the database connection.
3.  **Google OAuth**:
    -   Go to [Google Cloud Console](https://console.cloud.google.com/).
    -   Update **Authorized JavaScript origins** to `https://<your-app>.onrender.com`.
    -   Update **Authorized redirect URIs** to `https://<your-app>.onrender.com`.
4.  **Logs**: Check the "Logs" tab in Render if you encounter any issues.

## ⚠️ Important Note on Free Tier
Render's **Free Tier** services spin down after 15 minutes of inactivity. The first request after a spin-down may take up to 30-50 seconds. This is normal behavior for the free plan.
