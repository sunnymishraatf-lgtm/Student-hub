# StudySync 📚

A full-stack responsive web application for students to track attendance, manage timetables, and share study notes.

## Features

- **Google OAuth 2.0 Authentication** - Secure login with JWT sessions
- **Smart Attendance Tracker** - Track attendance with color-coded indicators
- **Attendance Predictions** - AI-powered insights on classes you can miss or need to attend
- **Live Simulation** - Preview attendance impact before marking
- **Weekly Timetable** - Grid layout (desktop) + stacked (mobile)
- **Notes System** - Upload/download PDF, images, and documents via Cloudinary
- **Dark Mode** - Toggle between light and dark themes
- **Fully Responsive** - Works on all devices

## Tech Stack

**Frontend:** React.js, Tailwind CSS, Heroicons
**Backend:** Node.js, Express.js
**Database:** MongoDB
**Authentication:** Google OAuth 2.0 + JWT
**File Storage:** Cloudinary
**Deployment:** Vercel (Frontend), Render (Backend)

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account
- Google Cloud Console project
- Cloudinary account

### 1. Clone & Setup

```bash
git clone <repo-url>
cd studysync
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
cp .env.example .env
# Edit .env with your API URL
npm install
npm start
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/auth/google | Google OAuth login |
| GET | /api/auth/me | Get current user |
| GET | /api/user/dashboard | Dashboard stats |
| GET | /api/subjects | Get all subjects |
| POST | /api/subjects | Add subject |
| PATCH | /api/subjects/:id/attendance | Update attendance |
| POST | /api/subjects/:id/simulate | Simulate attendance |
| GET | /api/timetable | Get timetable |
| POST | /api/timetable | Add timetable entry |
| GET | /api/notes | Get notes |
| POST | /api/notes | Upload note |

## Deployment

### Backend (Render)
1. Push code to GitHub
2. Create new Web Service on Render
3. Add environment variables
4. Deploy

### Frontend (Vercel)
1. Push code to GitHub
2. Import project on Vercel
3. Set environment variables
4. Deploy

## License

MIT License - feel free to use for your projects!
