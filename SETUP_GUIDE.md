# StudySync - Setup & Deployment Guide

## Table of Contents
1. [Local Development Setup](#local-development-setup)
2. [Environment Configuration](#environment-configuration)
3. [Database Setup](#database-setup)
4. [Google OAuth Setup](#google-oauth-setup)
5. [Cloudinary Setup](#cloudinary-setup)
6. [Deployment](#deployment)

---

## Local Development Setup

### Step 1: Install Prerequisites
- **Node.js** (v18 or higher): [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git**: [Download here](https://git-scm.com/)

### Step 2: Project Structure
```
studysync/
├── backend/          # Node.js + Express API
│   ├── config/       # Configuration files
│   ├── middleware/   # Auth & upload middleware
│   ├── models/       # MongoDB schemas
│   ├── routes/       # API routes
│   ├── .env          # Environment variables
│   └── server.js     # Entry point
├── frontend/         # React.js app
│   ├── public/       # Static files
│   ├── src/          # React components
│   ├── .env          # Environment variables
│   └── package.json
└── README.md
```

### Step 3: Clone & Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd studysync

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

## Environment Configuration

### Backend Environment Variables

Create `backend/.env` file:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studysync?retryWrites=true&w=majority

# JWT Secret (generate a strong random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long
JWT_EXPIRE=7d

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend Environment Variables

Create `frontend/.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## Database Setup

### MongoDB Atlas (Cloud)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `username`, `password`, and `cluster` in the URI

Example:
```
mongodb+srv://john:password123@cluster0.abc123.mongodb.net/studysync?retryWrites=true&w=majority
```

### Local MongoDB (Optional)

If running MongoDB locally:
```env
MONGODB_URI=mongodb://localhost:27017/studysync
```

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (e.g., "StudySync")
3. Enable the Google+ API:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it

### Step 2: Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" (for testing) or "Internal" (for organization)
3. Fill in required fields:
   - App name: StudySync
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. Add scopes:
   - `.../auth/userinfo.profile`
   - `.../auth/userinfo.email`
5. Add test users (for external apps in testing mode)

### Step 3: Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Select "Web application"
4. Configure authorized redirect URIs:
   - Local: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-backend-url.com/api/auth/google/callback`
5. Click "Create" and copy the Client ID and Client Secret

### Step 4: Update Environment Variables

Add the credentials to both backend and frontend `.env` files.

---

## Cloudinary Setup

### Step 1: Create Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for a free account
3. Note your Cloud Name from the dashboard

### Step 2: Get API Credentials

1. Go to Settings → API Keys
2. Copy:
   - Cloud Name
   - API Key
   - API Secret

### Step 3: Update Backend .env

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Running Locally

### Start Backend Server

```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

### Start Frontend Development Server

```bash
cd frontend
npm start
```
App runs on `http://localhost:3000`

### Verify Setup

1. Open `http://localhost:3000`
2. Click "Continue with Google"
3. Complete OAuth flow
4. You should see the Dashboard

---

## Deployment

### Backend Deployment (Render)

#### Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### Step 2: Create Render Account

1. Go to [Render](https://render.com/)
2. Sign up with GitHub
3. Click "New" → "Web Service"

#### Step 3: Configure Service

1. Connect your GitHub repository
2. Configure settings:
   - **Name**: studysync-backend
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

#### Step 4: Add Environment Variables

Add all variables from `backend/.env`:
- `NODE_ENV`: production
- `PORT`: 10000 (Render assigns this automatically)
- `MONGODB_URI`: your MongoDB Atlas URI
- `JWT_SECRET`: strong random string
- `GOOGLE_CLIENT_ID`: from Google Console
- `GOOGLE_CLIENT_SECRET`: from Google Console
- `FRONTEND_URL`: your Vercel frontend URL (e.g., `https://studysync.vercel.app`)
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

#### Step 5: Update Google OAuth Redirect URI

In Google Cloud Console, add:
```
https://your-render-service-name.onrender.com/api/auth/google/callback
```

#### Step 6: Deploy

Click "Create Web Service" and wait for deployment.

---

### Frontend Deployment (Vercel)

#### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

#### Step 2: Deploy via Dashboard

1. Go to [Vercel](https://vercel.com/)
2. Sign up with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

#### Step 3: Add Environment Variables

Add to Vercel project settings:
```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

#### Step 4: Deploy

Click "Deploy" and wait for build to complete.

#### Step 5: Update Backend CORS

Update `FRONTEND_URL` in Render environment variables to match your Vercel URL.

---

## Post-Deployment Checklist

- [ ] Backend deployed and health check passes (`/api/health`)
- [ ] Frontend loads without errors
- [ ] Google OAuth login works
- [ ] Attendance tracking works
- [ ] Timetable displays correctly
- [ ] Notes upload/download works
- [ ] Dark mode toggle works
- [ ] Mobile responsiveness verified

---

## Troubleshooting

### Common Issues

**CORS Errors**
- Ensure `FRONTEND_URL` in backend matches actual frontend URL
- Check for trailing slashes

**MongoDB Connection Failed**
- Whitelist your IP in MongoDB Atlas Network Access
- Verify connection string format

**Google OAuth Redirect URI Mismatch**
- Ensure redirect URI in Google Console exactly matches backend callback URL
- Include protocol (https://)

**File Upload Fails**
- Verify Cloudinary credentials
- Check file size (max 10MB)
- Ensure file type is allowed

**JWT Token Issues**
- Ensure `JWT_SECRET` is set and consistent
- Check token expiration settings

---

## Support

For issues or questions:
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review the [API Documentation](#api-endpoints)
- Contact: your-email@example.com
