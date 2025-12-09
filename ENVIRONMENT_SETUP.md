# Environment Setup Guide

Complete guide for setting up environment variables for MentorDesk development and production.

---

## 🎯 Overview

MentorDesk requires proper environment configuration for:
- API connectivity (frontend to backend)
- Google OAuth authentication
- Email services (OTP and notifications)
- Database configuration
- Security settings

---

## 📁 Required Environment Files

### Frontend Environment Files

#### `.env` (Development - Project Root)
```bash
# Development Environment Configuration
# Frontend connects to local backend during development

VITE_API_URL=http://localhost:3000

# Google OAuth Client ID (same as backend)
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

#### `.env.production` (Production - Project Root)
```bash
# Production Environment Configuration
# Frontend connects to production backend

VITE_API_URL=https://your-backend-url.com

# Google OAuth Client ID (production credentials)
VITE_GOOGLE_CLIENT_ID=your-production-google-client-id
```

### Backend Environment Files

#### `server/.env` (Backend Configuration)
```bash
# Server Configuration
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here

# Email Configuration (for OTP and notifications)
# For development, OTP codes are logged to console
# For production, configure SMTP settings below
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=MentorDesk <noreply@mentordesk.com>
```

---

## 🔧 Step-by-Step Setup

### Step 1: Google OAuth Configuration

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Create a new project or select existing one

2. **Enable Google+ API**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

3. **Create OAuth 2.0 Credentials**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: **Web application**

4. **Configure Authorized Origins**
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

5. **Configure Redirect URIs**
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`

6. **Copy Client ID**
   - Copy the generated Client ID
   - Add to both frontend and backend `.env` files

### Step 2: Email Configuration (Optional for Development)

#### For Development (Gmail with App Password):

1. **Enable 2-Step Verification**
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Generate App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password

3. **Update server/.env**
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=xxxx-xxxx-xxxx-xxxx  # 16-char app password
   EMAIL_FROM=MentorDesk <noreply@mentordesk.com>
   ```

#### For Production (SendGrid/AWS SES):

**SendGrid:**
```bash
npm install @sendgrid/mail
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your-sendgrid-api-key
```

**AWS SES:**
```bash
npm install @aws-sdk/client-ses
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
```

### Step 3: JWT Secret

**Generate a secure JWT secret:**
```bash
# On Linux/Mac:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

Add to `server/.env`:
```bash
JWT_SECRET=your_generated_secret_here
```

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`  
Backend API will be available at: `http://localhost:3000`

### Production Mode

**Build frontend:**
```bash
npm run build
```

**Start backend (serves both API and frontend):**
```bash
cd server
NODE_ENV=production npm start
```

Application will be available at: `http://localhost:3000`

---

## ✅ Verification

### Check Environment Variables are Loading

**Frontend:**
```javascript
// In browser console
console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
```

**Backend:**
```javascript
// In server/app.js, add temporarily:
console.log('PORT:', process.env.PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Missing');
```

### Test Google OAuth

1. Navigate to `http://localhost:5173/login`
2. Click "Continue with Google" button
3. Google popup should appear
4. If error: Check console for missing `GOOGLE_CLIENT_ID`

---

## 🐛 Troubleshooting

### Google OAuth Not Working

**Problem:** "Google OAuth not configured properly" error

**Solutions:**
1. Verify `GOOGLE_CLIENT_ID` is set in **both** frontend and backend `.env`
2. Check Google Cloud Console authorized origins match your URL
3. Ensure Google+ API is enabled
4. Clear browser cache and try again

### API Connection Failed

**Problem:** "Unable to connect to server" error

**Solutions:**
1. Check backend is running on port 3000
2. Verify `VITE_API_URL` in frontend `.env` is correct
3. Check for CORS errors in browser console
4. Ensure backend and frontend are running simultaneously in development

### Email Not Sending

**Problem:** OTP emails not received

**Solutions:**
1. In development, OTP is logged to server console - check there first
2. Verify Gmail App Password is correct (16 characters with no spaces)
3. Check spam folder
4. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are set correctly

---

## 🔒 Security Best Practices

✅ **Never commit `.env` files to version control**
- Add to `.gitignore`: `*.env`
- Use `.env.example` as template

✅ **Use different Google OAuth credentials for development and production**

✅ **Rotate JWT secrets regularly in production**

✅ **Use environment-specific secrets**
- Different JWT secrets for dev/staging/production
- Different database credentials per environment

✅ **Validate all environment variables on startup**

---

## 📋 Environment Variables Checklist

### Frontend (.env)
- [ ] `VITE_API_URL` - Correct backend URL
- [ ] `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID

### Backend (server/.env)
- [ ] `PORT` - Server port (default: 3000)
- [ ] `NODE_ENV` - Environment (development/production)
- [ ] `JWT_SECRET` - Secure random string (min 32 characters)
- [ ] `GOOGLE_CLIENT_ID` - Matches frontend Client ID
- [ ] `EMAIL_HOST` - SMTP host (if using email)
- [ ] `EMAIL_PORT` - SMTP port (if using email)
- [ ] `EMAIL_USER` - Email account (if using email)
- [ ] `EMAIL_PASSWORD` - Email password (if using email)
- [ ] `EMAIL_FROM` - From address (if using email)

---

## 📝 Example .env.example Files

Create these template files for your team:

**Frontend `.env.example`:**
```bash
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

**Backend `server/.env.example`:**
```bash
PORT=3000
NODE_ENV=development
JWT_SECRET=change_this_to_a_secure_random_string
GOOGLE_CLIENT_ID=your-google-client-id-here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=MentorDesk <noreply@example.com>
```

---

**Questions or Issues?**

Refer to:
- [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) - Full auth documentation
- [BUG_REPORT.md](./bug_report.md) - Known issues and solutions
- Google Cloud Console Documentation
