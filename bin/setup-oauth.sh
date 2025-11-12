#!/bin/bash

# Google OAuth Setup Instructions

cat << 'EOF'

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔐 Google OAuth Setup - REQUIRED!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️  You MUST configure Google OAuth for it to work!

📋 Step 1: Set up Google Cloud Console

   1. Go to: https://console.cloud.google.com/
   2. Create a new project (or select existing)
   3. Enable Google+ API

📋 Step 2: Create OAuth Credentials

   1. Go to: APIs & Services > Credentials
   2. Click "Create Credentials" > "OAuth client ID"
   3. Application type: Web application
   4. Add authorized redirect URIs (see Step 3)

📋 Step 3: Get Your Google OAuth Credentials

   1. Go to: https://console.cloud.google.com/apis/credentials
   2. Create OAuth 2.0 Client ID (if not already created)
   3. Set Authorized redirect URIs:
      - http://localhost:3000/api/auth/callback/google
      - http://localhost:3000/api/v1/auth/callback
   
   4. Copy your credentials from Google Cloud Console:
      - Client ID: YOUR_GOOGLE_CLIENT_ID
      - Client Secret: YOUR_GOOGLE_CLIENT_SECRET
   
   5. Add them to your .env.local file:
      GOOGLE_CLIENT_ID=your_client_id_here
      GOOGLE_CLIENT_SECRET=your_client_secret_here

📋 Step 4: Test OAuth!

   make dev
   # Visit http://localhost:3000
   # Click "Continue with Google"
   # Should redirect to Google sign-in! ✅

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Make sure your credentials are in .env.local!
⚠️  Keep your OAuth secrets safe and never commit them!

📖 Need more help? Check NextAuth.js Google Provider docs

EOF

