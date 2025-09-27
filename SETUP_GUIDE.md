# Setup Guide - PodcastAI Recommendation System

This guide will help you set up the project on your local machine and troubleshoot common issues.

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.8 or higher**
- **Node.js 16 or higher**
- **Git**

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Keerthithev/podcast_recomandation_system.git
cd podcast_recomandation_system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (see Environment Configuration below)
# Run the backend server
python main.py
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create .env file (see Environment Configuration below)
# Run the frontend server
npm run dev
```

## Environment Configuration

### Backend Environment Variables (.env in backend folder)

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/podcast_db

# Spotify API Configuration
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret

# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key

# Security Configuration
SECRET_KEY=your-super-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# API Configuration
API_V1_STR=/api/v1
PROJECT_NAME="PodcastAI Recommendation System"
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

### Frontend Environment Variables (.env in frontend folder) - OPTIONAL

Create a `.env` file in the `frontend` directory (optional - will use default if not provided):

```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Common Issues and Solutions

### Backend Issues

#### 1. Python Version Error
**Error**: `python: command not found` or version issues
**Solution**:
```bash
# Check Python version
python --version
# If not 3.8+, install Python 3.8+ or use python3
python3 -m venv venv
python3 main.py
```

#### 2. Virtual Environment Issues
**Error**: `venv\Scripts\activate` not working
**Solution**:
```bash
# On Windows, try:
venv\Scripts\activate.bat
# Or use PowerShell:
venv\Scripts\Activate.ps1

# On macOS/Linux:
source venv/bin/activate
```

#### 3. Package Installation Errors
**Error**: `pip install -r requirements.txt` fails
**Solution**:
```bash
# Upgrade pip first
pip install --upgrade pip
# Then install requirements
pip install -r requirements.txt

# If specific package fails, install individually:
pip install fastapi==0.115.2
pip install uvicorn[standard]==0.30.6
pip install motor==3.5.1
```

#### 4. Database Connection Error
**Error**: MongoDB connection failed
**Solution**:
- Check your `DATABASE_URL` in `.env` file
- Ensure MongoDB Atlas cluster is running
- Verify network access settings in MongoDB Atlas
- Check if your IP is whitelisted in MongoDB Atlas

#### 5. Import Errors
**Error**: `ModuleNotFoundError` or import issues
**Solution**:
```bash
# Make sure you're in the backend directory
cd backend
# Activate virtual environment
source venv/bin/activate  # or venv\Scripts\activate on Windows
# Install missing packages
pip install -r requirements.txt
```

### Frontend Issues

#### 1. Node.js Version Error
**Error**: Node.js version issues
**Solution**:
```bash
# Check Node.js version
node --version
# Should be 16 or higher
# If not, install Node.js 16+ from nodejs.org
```

#### 2. npm install Errors
**Error**: `npm install` fails
**Solution**:
```bash
# Clear npm cache
npm cache clean --force
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json
# Reinstall
npm install
```

#### 3. Vite/React Errors
**Error**: Vite or React related errors
**Solution**:
```bash
# Update dependencies
npm update
# Or reinstall everything
rm -rf node_modules package-lock.json
npm install
```

#### 4. Environment Variables Not Loading
**Error**: Frontend can't connect to backend
**Solution**:
- Check `.env` file exists in `frontend` directory
- Verify `VITE_API_URL=http://localhost:8000/api/v1`
- Restart the frontend server after creating `.env`

### General Issues

#### 1. Port Already in Use
**Error**: Port 8000 or 5173 already in use
**Solution**:
```bash
# Kill processes using the ports
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# On macOS/Linux:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

#### 2. CORS Errors
**Error**: CORS policy errors in browser
**Solution**:
- Check backend CORS settings in `main.py`
- Ensure frontend URL is in `BACKEND_CORS_ORIGINS`
- Restart both servers

#### 3. API Connection Issues
**Error**: Frontend can't connect to backend API
**Solution**:
- Verify backend is running on `http://localhost:8000`
- Check `VITE_API_URL` in frontend `.env`
- Ensure no firewall blocking the connection

## Testing the Setup

### 1. Test Backend
```bash
# In backend directory with venv activated
python main.py
# Should see: "Uvicorn running on http://0.0.0.0:8000"
```

Visit `http://localhost:8000` in browser - should see API response.

### 2. Test Frontend
```bash
# In frontend directory
npm run dev
# Should see: "Local: http://localhost:5173"
```

Visit `http://localhost:5173` in browser - should see the React app.

## Getting API Keys

### Spotify API
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Get Client ID and Client Secret
4. Add to backend `.env` file

### OpenAI API
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account and get API key
3. Add to backend `.env` file

### MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Add to backend `.env` file

## Troubleshooting Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Virtual environment created and activated
- [ ] All dependencies installed (`pip install -r requirements.txt`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] `.env` files created in both backend and frontend
- [ ] API keys configured correctly
- [ ] MongoDB Atlas cluster running and accessible
- [ ] No port conflicts (8000, 5173)
- [ ] Both servers running simultaneously

## Still Having Issues?

If you're still experiencing problems:

1. Check the console/terminal output for specific error messages
2. Verify all environment variables are set correctly
3. Ensure all prerequisites are installed
4. Try running each component separately to isolate the issue
5. Check if your firewall or antivirus is blocking connections

## Contact

For additional help, please open an issue on GitHub or contact the development team.
