# Quick Start Guide - For Your Friend

## Step 1: Clone the Repository

Open your terminal/command prompt and run:

```bash
git clone https://github.com/Keerthithev/podcast_recomandation_system.git
cd podcast_recomandation_system
```

## Step 2: Check Your Setup

Run this command to check if everything is ready:

```bash
python3 check_setup.py
```

If you see any ❌ errors, follow the instructions below to fix them.

## Step 3: Setup Backend

```bash
# Go to backend folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
# Create a file called .env in the backend folder with this content:
```

**Create `backend/.env` file with:**
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/podcast_db
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your-secret-key-here
API_V1_STR=/api/v1
PROJECT_NAME="PodcastAI Recommendation System"
BACKEND_CORS_ORIGINS=["http://localhost:5173", "http://localhost:3000"]
```

## Step 4: Setup Frontend

```bash
# Go to frontend folder (in a new terminal)
cd frontend

# Install dependencies
npm install

# Create environment file (OPTIONAL)
# The frontend will work without this file, but you can create it to customize the API URL:
```

**Create `frontend/.env` file with (OPTIONAL):**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Step 5: Run the Project

### Option 1: Easy Way (Recommended)
```bash
# Go back to project root folder
cd ..

# Run the startup script
./start_project.sh
```

### Option 2: Manual Way
**Terminal 1 (Backend):**
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python main.py
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

## Step 6: Access the Application

- **Frontend**: Open http://localhost:5173 in your browser
- **Backend API**: Open http://localhost:8000 in your browser

## Common Issues & Quick Fixes

### Issue 1: "python: command not found"
**Fix**: Use `python3` instead of `python`

### Issue 2: "node: command not found"
**Fix**: Install Node.js from https://nodejs.org

### Issue 3: "pip install" fails
**Fix**: 
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue 4: "npm install" fails
**Fix**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Issue 5: Port already in use
**Fix**: Kill processes using ports 8000 and 5173
```bash
# On Mac/Linux:
lsof -ti:8000 | xargs kill -9
lsof -ti:5173 | xargs kill -9

# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F
```

## Getting API Keys (If Needed)

### Spotify API
1. Go to https://developer.spotify.com/dashboard
2. Create new app
3. Get Client ID and Client Secret
4. Add to backend/.env file

### OpenAI API
1. Go to https://platform.openai.com/
2. Create account and get API key
3. Add to backend/.env file

### MongoDB Atlas
1. Go to https://www.mongodb.com/atlas
2. Create free cluster
3. Get connection string
4. Add to backend/.env file

## Still Having Problems?

1. Run `python3 check_setup.py` to see what's wrong
2. Check the detailed SETUP_GUIDE.md for more help
3. Make sure you have Python 3.8+ and Node.js 16+ installed
4. Ensure all .env files are created correctly

## Success!

If everything works, you should see:
- Backend running on http://localhost:8000
- Frontend running on http://localhost:5173
- No error messages in the terminal

🎉 You're ready to use the PodcastAI Recommendation System!
