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
