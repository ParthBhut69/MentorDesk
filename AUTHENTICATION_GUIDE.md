# MentorDesk Authentication Guide

Complete guide for the authentication system including Email OTP, TOTP 2FA, and Google OAuth.

---

## 🎯 Overview

MentorDesk now supports **three authentication methods**:

1. **Normal Login** - Email + Password
2. **OTP Login** - Email + Password + Email OTP (6-digit code)
3. **Google OAuth** - Sign in with Google account

Additionally, users can enable **TOTP 2FA** (authenticator app) for enhanced security.

---

## 🚀 Quick Setup

### 1. Install Dependencies

#### Backend
```bash
cd server
npm install
```

New dependencies added:
- `nodemailer` - Email sending service
- `google-auth-library` - Server-side Google token verification

#### Frontend
No new dependencies needed. Existing packages:
- `@react-oauth/google` - Google OAuth integration

### 2. Run Database Migration

```bash
cd server
npm run migrate
```

This creates the `otp_codes` table and adds `otp_enabled` column to users.

### 3. Configure Environment Variables

#### Backend (.env)

Create or update `server/.env`:

```bash
# Server
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this

# Email Configuration (for OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=MentorDesk <noreply@mentordesk.com>

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here
```

#### Frontend (.env)

Create `/.env` in project root:

```bash
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here
```

### 4. Email Service Setup

#### Option A: Gmail (Development)

1. Enable 2-Step Verification in your Google Account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the 16-character password
3. Use in `.env`:
   ```
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

#### Option B: SendGrid (Production)

```bash
npm install @sendgrid/mail
```

Update `server/services/emailService.js` to use SendGrid API.

#### Option C: AWS SES (Production)

```bash
npm install @aws-sdk/client-ses
```

Update `server/services/emailService.js` to use AWS SES.

### 5. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Application type: **Web application**
6. Authorized JavaScript origins:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
7. Authorized redirect URIs:
   - `http://localhost:5173` (development)
   - `https://yourdomain.com` (production)
8. Copy the **Client ID**
9. Add to both `.env` files (backend and frontend)

---

## 📡 API Documentation

### Authentication Endpoints

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "avatarUrl": null,
  "token": "jwt-token-here"
}
```

#### 2. Normal Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (No 2FA):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "avatarUrl": null,
  "token": "jwt-token-here"
}
```

**Response (2FA Enabled):**
```json
{
  "requiresTwoFactor": true,
  "userId": 1,
  "tempToken": "temporary-jwt-token"
}
```

#### 3. Send OTP
```http
POST /api/auth/otp/send
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "userId": 1,
  "expiresIn": 300
}
```

**Development Mode Response:**
```json
{
  "success": true,
  "message": "OTP generated (check console in development mode)",
  "userId": 1,
  "expiresIn": 300,
  "developmentOTP": "123456"
}
```

#### 4. Verify OTP
```http
POST /api/auth/otp/verify
Content-Type: application/json

{
  "userId": 1,
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "avatarUrl": null,
  "token": "jwt-token-here"
}
```

**Error Responses:**
```json
{
  "message": "Invalid OTP. 2 attempt(s) remaining."
}
```
```json
{
  "message": "OTP has expired. Please request a new one."
}
```
```json
{
  "message": "Too many failed attempts. Please request a new OTP."
}
```

#### 5. Resend OTP
```http
POST /api/auth/otp/resend
Content-Type: application/json

{
  "userId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "New OTP sent to your email",
  "expiresIn": 300
}
```

**Rate Limited Response:**
```json
{
  "message": "Please wait before requesting a new OTP",
  "retryAfter": 60
}
```

#### 6. Google OAuth Login
```http
POST /api/auth/google
Content-Type: application/json

{
  "credential": "google-jwt-credential-token"
}
```

**Response (Success):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "avatarUrl": "https://lh3.googleusercontent.com/...",
  "token": "jwt-token-here"
}
```

**Response (2FA Required):**
```json
{
  "requiresTwoFactor": true,
  "userId": 1,
  "tempToken": "temporary-jwt-token"
}
```

#### 7. Verify TOTP 2FA Code
```http
POST /api/auth/2fa/verify
Content-Type: application/json

{
  "userId": 1,
  "code": "123456",
  "isBackupCode": false
}
```

**Response:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "avatarUrl": null,
  "token": "jwt-token-here"
}
```

---

## 🎨 Frontend Integration

### Login Flow Examples

#### 1. Normal Login
```typescript
const handleLogin = async () => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  
  if (data.requiresTwoFactor) {
    // Show TOTP input
    showTOTPInput(data.userId, data.tempToken);
  } else {
    // Login successful
    localStorage.setItem('token', data.token);
    navigate('/');
  }
};
```

#### 2. OTP Login
```typescript
// Step 1: Send OTP
const handleSendOTP = async () => {
  const response = await fetch(`${API_URL}/api/auth/otp/send`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  
  const data = await response.json();
  if (data.success) {
    setUserId(data.userId);
    setShowOTPInput(true);
  }
};

// Step 2: Verify OTP
const handleVerifyOTP = async (otp: string) => {
  const response = await fetch(`${API_URL}/api/auth/otp/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, otp })
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.token);
    navigate('/');
  }
};
```

#### 3. Google OAuth
```tsx
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

function LoginPage() {
  const handleGoogleSuccess = async (credentialResponse) => {
    const response = await fetch(`${API_URL}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: credentialResponse.credential })
    });
    
    const data = await response.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      navigate('/');
    }
  };

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <GoogleLogin
        onSuccess={handleGoogleSuccess}
        onError={() => console.error('Login Failed')}
      />
    </GoogleOAuthProvider>
  );
}
```

---

## 🧪 Testing Guide

### 1. Test Normal Login

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test OTP Login

```bash
# Send OTP
curl -X POST http://localhost:3000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Check console for OTP in development mode
# Then verify OTP
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "otp": "123456"
  }'
```

### 3. Test Google OAuth

1. Open browser to `http://localhost:5173/login`
2. Click "Continue with Google"
3. Complete Google sign-in
4. Verify redirect to home page
5. Check localStorage for token

### 4. Test OTP Expiry

1. Send OTP
2. Wait 5 minutes
3. Try to verify - should get "OTP has expired" error

### 5. Test OTP Retry Limit

1. Send OTP
2. Enter wrong OTP 3 times
3. Should get "Too many failed attempts" error

### 6. Test OTP Resend

1. Send OTP
2. Wait 1 minute
3. Click "Resend OTP"
4. Should receive new OTP

---

## ⚠️ Common Mistakes to Avoid

### 1. Email Configuration

❌ **Wrong:**
```env
EMAIL_PASSWORD=your-gmail-password
```

✅ **Correct:**
```env
EMAIL_PASSWORD=your-16-char-app-password
```

**Why:** Gmail requires App Passwords when 2FA is enabled.

### 2. Google Client ID

❌ **Wrong:**
```env
# Only in backend .env
GOOGLE_CLIENT_ID=xxx
```

✅ **Correct:**
```env
# Backend: server/.env
GOOGLE_CLIENT_ID=xxx

# Frontend: .env (project root)
VITE_GOOGLE_CLIENT_ID=xxx
```

**Why:** Frontend needs the Client ID to initialize Google OAuth.

### 3. OTP Verification

❌ **Wrong:**
```javascript
// Sending OTP hash to frontend
developmentOTP: otpHash
```

✅ **Correct:**
```javascript
// Only send plain OTP in development
developmentOTP: process.env.NODE_ENV === 'development' ? otp : undefined
```

**Why:** Never expose hashed values or OTPs in production.

### 4. Token Storage

❌ **Wrong:**
```javascript
// Storing sensitive data in localStorage
localStorage.setItem('password', password);
```

✅ **Correct:**
```javascript
// Only store token and non-sensitive user data
localStorage.setItem('token', token);
localStorage.setItem('user', JSON.stringify({ id, name, email, role }));
```

**Why:** Never store passwords or sensitive data in localStorage.

### 5. Error Handling

❌ **Wrong:**
```javascript
catch (error) {
  console.log(error);
}
```

✅ **Correct:**
```javascript
catch (error) {
  console.error('Login error:', error);
  setError('Something went wrong. Please try again.');
}
```

**Why:** Always show user-friendly error messages.

---

## 🔒 Security Best Practices

### 1. OTP Security
- ✅ OTPs are hashed with bcrypt before storage
- ✅ OTPs expire after 5 minutes
- ✅ Maximum 3 verification attempts
- ✅ Rate limiting on resend (60 seconds)
- ✅ Automatic cleanup of expired OTPs

### 2. Google OAuth Security
- ✅ Server-side token verification
- ✅ Validates token audience (Client ID)
- ✅ Checks token expiry
- ✅ Prevents token replay attacks

### 3. JWT Security
- ✅ Tokens expire after 30 days
- ✅ Temporary tokens for 2FA (10 minutes)
- ✅ Tokens include user ID and role
- ✅ Secret key stored in environment variables

### 4. Password Security
- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ Never logged or exposed in responses
- ✅ Minimum length enforced on frontend

---

## 🐛 Troubleshooting

### Email Not Sending

**Problem:** OTP emails not being received

**Solutions:**
1. Check email configuration in `.env`
2. Verify Gmail App Password is correct
3. Check spam/junk folder
4. Look for errors in server console
5. In development, OTP is logged to console

### Google OAuth Not Working

**Problem:** "Invalid Google token" error

**Solutions:**
1. Verify `GOOGLE_CLIENT_ID` matches in both backend and frontend
2. Check authorized JavaScript origins in Google Console
3. Ensure Google+ API is enabled
4. Clear browser cache and cookies
5. Check browser console for errors

### OTP Always Expires

**Problem:** OTP expires immediately

**Solutions:**
1. Check server time is correct
2. Verify database timezone settings
3. Check `expires_at` calculation in `otpController.js`

### 2FA Not Triggering

**Problem:** TOTP 2FA not being requested

**Solutions:**
1. Verify user has `two_fa_enabled = true` in database
2. Check `two_fa_secret` is set for user
3. Ensure login flow checks `user.two_fa_enabled`

---

## 📊 Database Schema

### Users Table (Updated)
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  google_id TEXT UNIQUE,
  oauth_provider TEXT,
  two_fa_enabled BOOLEAN DEFAULT 0,
  two_fa_secret TEXT,
  backup_codes TEXT,
  otp_enabled BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### OTP Codes Table (New)
```sql
CREATE TABLE otp_codes (
  id INTEGER PRIMARY KEY,
  user_id INTEGER NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

## 🎯 Test Cases

### Test Case 1: Normal Login
- ✅ User can register with email/password
- ✅ User can login with correct credentials
- ✅ User receives JWT token
- ✅ Token is valid for 30 days
- ✅ Invalid credentials show error

### Test Case 2: OTP Login
- ✅ User can request OTP with valid credentials
- ✅ OTP is sent to email
- ✅ User can verify OTP within 5 minutes
- ✅ Invalid OTP shows error with remaining attempts
- ✅ OTP expires after 5 minutes
- ✅ User can resend OTP after 60 seconds
- ✅ Maximum 3 verification attempts

### Test Case 3: Google OAuth
- ✅ User can click "Sign in with Google"
- ✅ Google popup opens
- ✅ User completes Google sign-in
- ✅ New user is created automatically
- ✅ Existing user is logged in
- ✅ User receives JWT token
- ✅ Avatar is set from Google profile

### Test Case 4: TOTP 2FA
- ✅ User with 2FA enabled is prompted for code
- ✅ Valid TOTP code grants access
- ✅ Invalid TOTP code shows error
- ✅ Backup codes work as alternative
- ✅ Used backup codes are removed

### Test Case 5: Combined Flows
- ✅ Google user with 2FA enabled requires TOTP
- ✅ OTP login works for Google-linked accounts
- ✅ All three methods work independently

---

## 📝 Summary

You now have a complete, production-ready authentication system with:

✅ **Email/Password Login**
✅ **Email OTP (6-digit code with 5-minute expiry)**
✅ **Google OAuth 2.0**
✅ **TOTP 2FA (Authenticator app)**
✅ **Server-side token verification**
✅ **Rate limiting and security measures**
✅ **Professional email templates**
✅ **Comprehensive error handling**

All authentication methods work seamlessly together and can be used independently or in combination.
