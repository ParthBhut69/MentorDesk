# Quick Testing Guide

## 🚀 Quick Start

### 1. Start the Application
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

### 2. Access the Application
Open browser: http://localhost:5173/login

---

## 🧪 Test Scenarios

### Scenario 1: Normal Login (No OTP)
1. Go to login page
2. Enter email and password
3. **Do NOT check** "Use email OTP for extra security"
4. Click "Login"
5. ✅ Should redirect to home page

### Scenario 2: OTP Login
1. Go to login page
2. Enter email and password
3. **Check** "Use email OTP for extra security"
4. Click "Send OTP"
5. Check server console for OTP (in development mode):
   ```
   📧 EMAIL (Development Mode - Not Sent)
   Content: Your MentorDesk login code is: 123456
   ```
6. Enter the 6-digit code
7. Click "Verify OTP"
8. ✅ Should redirect to home page

### Scenario 3: Google OAuth
1. Go to login page
2. Click "Continue with Google"
3. Complete Google sign-in
4. ✅ Should redirect to home page
5. ✅ Check profile - avatar should be from Google

### Scenario 4: OTP Expiry
1. Send OTP
2. Wait 5 minutes
3. Try to verify
4. ✅ Should show "OTP has expired"

### Scenario 5: Invalid OTP
1. Send OTP
2. Enter wrong code (e.g., 000000)
3. ✅ Should show "Invalid OTP. 2 attempt(s) remaining"
4. Try 2 more times
5. ✅ Should show "Too many failed attempts"

### Scenario 6: Resend OTP
1. Send OTP
2. Wait 60 seconds
3. Click "Resend OTP"
4. ✅ Should receive new OTP
5. ✅ Timer should reset to 5:00

---

## 🔧 Configuration Checklist

### Before Testing Google OAuth
- [ ] Created Google Cloud project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 Client ID
- [ ] Added `http://localhost:5173` to authorized origins
- [ ] Copied Client ID to both `.env` files
- [ ] Restarted both frontend and backend

### Before Testing Email OTP
- [ ] Email configuration in `server/.env` (optional for development)
- [ ] If not configured, OTP will be logged to console
- [ ] Backend server is running

---

## 📝 Test Data

### Create Test User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test OTP Send
```bash
curl -X POST http://localhost:3000/api/auth/otp/send \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test OTP Verify
```bash
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "otp": "123456"
  }'
```

---

## ✅ Expected Results

### Normal Login
```json
{
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "role": "user",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### OTP Send
```json
{
  "success": true,
  "message": "OTP sent to your email",
  "userId": 1,
  "expiresIn": 300,
  "developmentOTP": "123456"
}
```

### OTP Verify (Success)
```json
{
  "success": true,
  "message": "Login successful",
  "id": 1,
  "name": "Test User",
  "email": "test@example.com",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### OTP Verify (Invalid)
```json
{
  "message": "Invalid OTP. 2 attempt(s) remaining."
}
```

### OTP Verify (Expired)
```json
{
  "message": "OTP has expired. Please request a new one."
}
```

---

## 🐛 Troubleshooting

### Google OAuth Not Working
1. Check browser console for errors
2. Verify `VITE_GOOGLE_CLIENT_ID` in `.env`
3. Verify `GOOGLE_CLIENT_ID` in `server/.env`
4. Check authorized origins in Google Console
5. Clear browser cache and cookies

### OTP Not Appearing
1. Check server console for email output
2. Verify backend is running
3. Check for errors in server console
4. Try resending OTP

### Login Redirects to Blank Page
1. Check browser console for errors
2. Verify token is stored in localStorage
3. Check network tab for API responses
4. Verify backend is running

---

## 📊 Database Verification

### Check OTP Codes Table
```bash
# In server directory
sqlite3 dev.sqlite3
```

```sql
-- View OTP codes
SELECT * FROM otp_codes;

-- View users with OTP enabled
SELECT id, name, email, otp_enabled FROM users;

-- Check Google-linked users
SELECT id, name, email, google_id, oauth_provider FROM users WHERE google_id IS NOT NULL;
```

---

## 🎯 Success Indicators

✅ Normal login works  
✅ OTP is generated and logged to console  
✅ OTP verification works  
✅ OTP expires after 5 minutes  
✅ Invalid OTP shows error  
✅ Resend OTP works  
✅ Google login button appears  
✅ Google sign-in completes  
✅ New Google users are created  
✅ Existing Google users can login  
✅ All methods redirect to home page  
✅ JWT token is stored in localStorage  

---

## 📞 Need Help?

See [AUTHENTICATION_GUIDE.md](file:///c:/Users/DASHHAM/Desktop/MentorDesk/AUTHENTICATION_GUIDE.md) for:
- Detailed setup instructions
- Complete API documentation
- Security best practices
- Common mistakes to avoid
