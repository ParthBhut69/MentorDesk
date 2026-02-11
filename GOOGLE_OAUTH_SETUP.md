<<<<<<< HEAD
# Google OAuth Setup Guide for MentorDesk

This guide will help you set up Google Sign-In (OAuth 2.0) for both development and production environments.

---

## 📋 Prerequisites

- Google Account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Node.js and npm installed

---

## 🔧 Part 1: Google Cloud Console Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter project name: `MentorDesk` (or your preferred name)
5. Click **"Create"**

### Step 2: Enable Google+ API (Optional but Recommended)

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google+ API"** or **"People API"**
3. Click on it and click **"Enable"**

### Step 3: Configure OAuth Consent Screen

1. Go to **"APIs & Services"** > **"OAuth consent screen"**
2. Select **"External"** (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required fields:
   - **App name**: `MentorDesk`
   - **User support email**: Your email
   - **Developer contact email**: Your email
5. Click **"Save and Continue"**
6. **Scopes**: Click **"Add or Remove Scopes"**
   - Add: `email`, `profile`, `openid` (these are usually pre-selected)
   - Click **"Update"** then **"Save and Continue"**
7. **Test users** (for development):
   - Click **"Add Users"**
   - Add your Google account email(s) that you'll use for testing
   - Click **"Save and Continue"**
8. Review and click **"Back to Dashboard"**

> **Note**: Your app will be in "Testing" mode. Only test users can sign in. To make it public, you'll need to publish the app (see Production section).

### Step 4: Create OAuth 2.0 Client ID

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth 2.0 Client ID"**
3. **Application type**: Select **"Web application"**
4. **Name**: `MentorDesk Web Client` (or your preferred name)
5. **Authorized JavaScript origins**:
   - Click **"Add URI"**
   - Add: `http://localhost:5173` (Vite dev server)
   - Click **"Add URI"** again
   - Add: `http://localhost:3000` (Backend server, optional)
6. **Authorized redirect URIs**:
   - Click **"Add URI"**
   - Add: `http://localhost:5173`
   - Click **"Add URI"** again
   - Add: `http://localhost:3000`
7. Click **"Create"**
8. **IMPORTANT**: Copy your **Client ID** and **Client Secret**
   - Client ID format: `xxxxxxxxx-xxxxxxxx.apps.googleusercontent.com`
   - Client Secret format: `GOCSPX-xxxxxxxxxxxxx`
   - Save these securely!

---

## 🔐 Part 2: Environment Configuration

### Backend Configuration

1. Navigate to the `server` directory
2. Create a `.env` file (if it doesn't exist):
   ```bash
   cd server
   touch .env  # On Windows: type nul > .env
   ```
3. Add the following to `server/.env`:
   ```env
   PORT=3000
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

   # Email Configuration (for OTP and notifications)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=MentorDesk <noreply@mentordesk.com>

   # Google OAuth Configuration
   GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-actual-client-secret-here
   ```
4. Replace `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` with your actual values from Step 4

### Frontend Configuration

1. Navigate to the project root directory
2. Open or create `.env.development`:
   ```bash
   # From project root
   touch .env.development  # On Windows: type nul > .env.development
   ```
3. Add the following to `.env.development`:
   ```env
   VITE_API_URL=http://localhost:3000
   VITE_GOOGLE_CLIENT_ID=your-actual-client-id-here.apps.googleusercontent.com
   ```
4. Replace `VITE_GOOGLE_CLIENT_ID` with the **same Client ID** from backend

> **CRITICAL**: The `GOOGLE_CLIENT_ID` in backend and `VITE_GOOGLE_CLIENT_ID` in frontend **MUST be identical**!

---

## ✅ Part 3: Validation

### Validate Backend Configuration

```bash
cd server
node scripts/validate_google_config.js
```

Expected output: `✅ All checks passed!`

### Validate Frontend Configuration

```bash
# From project root
node scripts/validate_frontend_env.js
```

Expected output: `✅ All checks passed!`

---

## 🚀 Part 4: Testing

### Start the Application

1. **Start Backend**:
   ```bash
   cd server
   npm install  # First time only
   npm start
   ```
   Expected: `Server running on port 3000`

2. **Start Frontend** (in a new terminal):
   ```bash
   # From project root
   npm install  # First time only
   npm run dev
   ```
   Expected: `Local: http://localhost:5173/`

### Test Google Sign-In

1. Open browser and navigate to: `http://localhost:5173/login`
2. Click **"Sign in with Google"** button
3. Select your Google account (must be a test user if app is in Testing mode)
4. Grant permissions
5. You should be redirected to the home page and logged in

### Check Browser Console

Open DevTools (F12) and check the Console tab. You should see:
```
[GoogleAuth] Authentication initiated
[GoogleAuth] Credential received: Yes
[GoogleAuth] API URL: http://localhost:3000
[GoogleAuth] Server response status: 200
[GoogleAuth] Login successful, redirecting...
```

### Check Backend Logs

In the terminal running the backend, you should see:
```
[2026-01-14T...] [GoogleAuth] Request received
[2026-01-14T...] [GoogleAuth] GOOGLE_CLIENT_ID configured: 775076359358-f6j13hh...
[2026-01-14T...] [GoogleAuth] Verifying ID token...
[2026-01-14T...] [GoogleAuth] Token verified successfully for email: user@example.com
[2026-01-14T...] [GoogleAuth] ✅ Authentication successful for user: 1
```

---

## 🐛 Troubleshooting

### Error: "Google OAuth is not configured on the server"

**Cause**: `GOOGLE_CLIENT_ID` is missing from `server/.env`

**Fix**:
1. Ensure `server/.env` exists
2. Add `GOOGLE_CLIENT_ID=your-client-id-here`
3. Restart the backend server

### Error: "Invalid or expired Google token"

**Possible Causes**:
1. Client ID mismatch between frontend and backend
2. Client ID doesn't match the one in Google Cloud Console
3. Token expired (rare, usually happens if system clock is wrong)

**Fix**:
1. Verify `VITE_GOOGLE_CLIENT_ID` in `.env.development` matches `GOOGLE_CLIENT_ID` in `server/.env`
2. Verify both match the Client ID from Google Cloud Console
3. Clear browser cache and try again

### Error: "redirect_uri_mismatch"

**Cause**: The redirect URI is not authorized in Google Cloud Console

**Fix**:
1. Go to Google Cloud Console > Credentials > Your OAuth Client
2. Under **Authorized redirect URIs**, ensure you have:
   - `http://localhost:5173`
   - `http://localhost:3000`
3. Save and wait 5 minutes for changes to propagate
4. Try again

### Error: "Access blocked: This app's request is invalid"

**Cause**: OAuth consent screen is not properly configured

**Fix**:
1. Go to Google Cloud Console > OAuth consent screen
2. Ensure app name, support email, and developer email are filled
3. Ensure your Google account is added as a test user (if app is in Testing mode)
4. Save and try again

### Google Sign-In Button Doesn't Appear

**Possible Causes**:
1. `VITE_GOOGLE_CLIENT_ID` is not set
2. Frontend dev server not restarted after adding env variable

**Fix**:
1. Check `.env.development` has `VITE_GOOGLE_CLIENT_ID`
2. Restart Vite dev server: Stop (Ctrl+C) and run `npm run dev` again
3. Hard refresh browser (Ctrl+Shift+R)

### Error: "Unable to connect to server"

**Cause**: Backend server is not running or wrong API URL

**Fix**:
1. Ensure backend is running: `cd server && npm start`
2. Check `VITE_API_URL` in `.env.development` is `http://localhost:3000`
3. Check browser console for network errors

---

## 🌐 Production Deployment

### Google Cloud Console Changes

1. **Add Production URLs** to OAuth Client:
   - Go to Credentials > Your OAuth Client > Edit
   - **Authorized JavaScript origins**:
     - Add: `https://yourdomain.com`
   - **Authorized redirect URIs**:
     - Add: `https://yourdomain.com`
   - Save

2. **Publish OAuth Consent Screen**:
   - Go to OAuth consent screen
   - Click **"Publish App"**
   - Follow verification process (may require domain verification)

### Environment Variables (Production)

**Backend** (`server/.env` or hosting platform env vars):
```env
PORT=3000
JWT_SECRET=use-a-very-strong-random-secret-here
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret
DATABASE_URL=postgresql://user:pass@host:port/db  # If using PostgreSQL
```

**Frontend** (build-time environment variables):
```env
VITE_API_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Security Checklist

- [ ] HTTPS enabled on production domain
- [ ] `JWT_SECRET` changed from default value
- [ ] `GOOGLE_CLIENT_SECRET` kept secure (never exposed to frontend)
- [ ] CORS configured to only allow your production domain
- [ ] Rate limiting enabled on `/api/auth/*` endpoints
- [ ] OAuth consent screen published and verified
- [ ] Test users removed (app is public)

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Sign-In for Web](https://developers.google.com/identity/sign-in/web)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)

---

## 🆘 Still Having Issues?

1. Run validation scripts:
   ```bash
   node server/scripts/validate_google_config.js
   node scripts/validate_frontend_env.js
   ```

2. Check browser console (F12) for detailed error messages

3. Check backend terminal logs for `[GoogleAuth]` messages

4. Verify all test users are added in Google Cloud Console (if app is in Testing mode)

5. Try using an incognito/private browser window to rule out cache issues

---

**Last Updated**: January 2026
=======
# Google OAuth Setup Instructions

To enable Google OAuth, you need to:

1. **Get Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Set Application type to "Web application"
   - Add authorized JavaScript origins: `http://localhost:5173`
   - Add authorized redirect URIs: `http://localhost:5173`
   - Copy your Client ID

2. **Update the Code**:
   - Open `src/pages/auth/LoginPage.tsx`
   - Replace `YOUR_GOOGLE_CLIENT_ID` with your actual Google Client ID
   - Do the same in `RegisterPage.tsx`

3. **Environment Variable (Recommended)**:
   - Create `.env` file in project root
   - Add: `VITE_GOOGLE_CLIENT_ID=your_client_id_here`
   - Update code to use: `import.meta.env.VITE_GOOGLE_CLIENT_ID`

The Google OAuth is now fully integrated and will work once you add your credentials!
>>>>>>> 33adee00930a83695ade63f74cc84e6502792cbb
