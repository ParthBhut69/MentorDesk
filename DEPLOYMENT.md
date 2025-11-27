# MentorDesk Deployment Guide

This guide will help you deploy MentorDesk to production using popular hosting platforms.

## Table of Contents
1. [Recommended Hosting Options](#recommended-hosting-options)
2. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Database Setup](#database-setup)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Steps](#post-deployment-steps)

---

## Recommended Hosting Options

### Frontend (React)
- **Vercel** (Recommended) - Free tier, automatic deployments
- **Netlify** - Free tier, easy setup
- **GitHub Pages** - Free, static hosting

### Backend (Node.js/Express)
- **Render** (Recommended) - Free tier, PostgreSQL included
- **Railway** - Free tier, easy setup
- **Heroku** - Paid plans only now
- **DigitalOcean App Platform** - $5/month

### Database
- **PostgreSQL on Render** - Free tier (recommended for production)
- **SQLite** - Keep for development only

---

## Frontend Deployment (Vercel)

### Step 1: Prepare Frontend for Production

1. **Update API URL for production**

Create `.env.production` in the root directory:
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

2. **Update all API calls to use environment variable**

Create `src/config/api.ts`:
```typescript
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
```

Then update all fetch calls from:
```typescript
fetch('http://localhost:3000/api/...')
```
to:
```typescript
import { API_URL } from '../config/api';
fetch(`${API_URL}/api/...`)
```

3. **Build the frontend**
```bash
npm run build
```

### Step 2: Deploy to Vercel

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy**
```bash
vercel --prod
```

**OR use Vercel Dashboard:**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Vite
5. Add environment variable: `VITE_API_URL`
6. Click "Deploy"

---

## Backend Deployment (Render)

### Step 1: Prepare Backend for Production

1. **Switch from SQLite to PostgreSQL**

Install PostgreSQL driver:
```bash
cd server
npm install pg
```

2. **Update `knexfile.js`**
```javascript
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true
  },
  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
```

3. **Update `db/db.js`**
```javascript
const knex = require('knex');
const config = require('../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

module.exports = db;
```

4. **Add start script to `package.json`**
```json
{
  "scripts": {
    "start": "node app.js",
    "dev": "nodemon app.js"
  }
}
```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)**
2. Sign up/Login with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Configure:
   - **Name**: mentordesk-api
   - **Environment**: Node
   - **Build Command**: `cd server && npm install && npx knex migrate:latest`
   - **Start Command**: `cd server && npm start`
   - **Instance Type**: Free

6. **Add Environment Variables**:
   - `NODE_ENV` = `production`
   - `JWT_SECRET` = (generate a random string)
   - `PORT` = `3000`

7. Click "Create Web Service"

### Step 3: Add PostgreSQL Database

1. In Render Dashboard, click "New +" → "PostgreSQL"
2. Name it `mentordesk-db`
3. Select Free tier
4. Click "Create Database"
5. Copy the "Internal Database URL"
6. Go back to your Web Service
7. Add environment variable:
   - `DATABASE_URL` = (paste the Internal Database URL)

---

## Environment Variables

### Frontend (.env.production)
```env
VITE_API_URL=https://your-backend-url.onrender.com
```

### Backend (Render Environment Variables)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
DATABASE_URL=postgresql://user:password@host:5432/database
```

---

## Post-Deployment Steps

### 1. Update CORS Settings

Update `server/app.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

### 2. Run Database Migrations

Render will run migrations automatically on deploy. To run manually:
```bash
# In Render dashboard, go to Shell tab
npx knex migrate:latest
```

### 3. Create Admin User

After deployment, create an admin user:
1. Register a new user on your live site
2. In Render dashboard, go to Shell tab
3. Run:
```bash
node makeAdmin.js
```

### 4. Test Your Application

1. Visit your Vercel URL
2. Register a new account
3. Post a question
4. Login as admin
5. Access admin panel

---

## Alternative: Deploy Both on Render

You can deploy both frontend and backend on Render:

### Frontend on Render
1. Create new "Static Site"
2. Build Command: `npm run build`
3. Publish Directory: `dist`

### Backend on Render
(Same as above)

---

## Quick Deploy Checklist

- [ ] Update API URLs to use environment variables
- [ ] Switch to PostgreSQL in production
- [ ] Set up environment variables
- [ ] Deploy backend to Render
- [ ] Create PostgreSQL database
- [ ] Run migrations
- [ ] Deploy frontend to Vercel
- [ ] Update CORS settings
- [ ] Create admin user
- [ ] Test all features

---

## Troubleshooting

### Frontend can't connect to backend
- Check CORS settings
- Verify API_URL environment variable
- Check browser console for errors

### Database connection errors
- Verify DATABASE_URL is correct
- Check if migrations ran successfully
- Ensure PostgreSQL database is running

### 500 Server Errors
- Check Render logs
- Verify all environment variables are set
- Check database connection

---

## Cost Estimate

**Free Tier (Recommended for starting):**
- Vercel Frontend: Free
- Render Backend: Free
- Render PostgreSQL: Free
- **Total: $0/month**

**Limitations:**
- Render free tier sleeps after 15 minutes of inactivity
- PostgreSQL free tier has 1GB storage limit
- 750 hours/month on Render

**Paid Tier (For production traffic):**
- Vercel Pro: $20/month
- Render Starter: $7/month
- PostgreSQL: $7/month
- **Total: ~$34/month**

---

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Render Docs: https://render.com/docs
- Knex Migrations: http://knexjs.org/guide/migrations.html

Good luck with your deployment! 🚀
