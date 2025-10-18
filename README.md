# PodcastAI - Intelligent Podcast Recommendation System

A sophisticated multi-agent AI system that provides personalized podcast recommendations using advanced machine learning and intelligent recommendation algorithms.

## System Architecture

### Multi-Agent Architecture

The system employs three specialized AI agents working in harmony:

**Spotify API Agent**
- Handles podcast retrieval from Spotify API.
- Manages authentication and rate limiting.
- Processes and standardizes podcast data.

**User Preference Agent**
- Tracks user search history and interactions.
- Analyzes user behavior patterns.
- Stores preferences in MongoDB.

**Recommendation Agent**
- Generates personalized recommendations.
- Communicates with User Preference Agent.
- Uses content-based and collaborative filtering.
- Integrates OpenAI GPT for semantic understanding.

### Data Flow

```
User Search → Spotify API Agent → Podcast Results → User Preference Agent (logs search)
User Request → Recommendation Agent → User Preference Agent (gets preferences) → Spotify API Agent (fetches relevant content) → Personalized Recommendations
```

### Technology Stack

**Backend**
- FastAPI for REST API.
- MongoDB for data storage.
- OpenAI GPT for AI processing.
- Spotify API for podcast data.

**Frontend**
- React 18 with TypeScript.
- Tailwind CSS for styling.
- Redux Toolkit for state management.

## Agent Roles and Communication Flow

### Agent Responsibilities

| Agent | Responsibilities |
|-------|-----------------|
| **Spotify API Agent** | Authenticate with Spotify API, Search podcast episodes, Fetch trending content, Convert data to standardized format |
| **User Preference Agent** | Log user search queries, Analyze search patterns, Store user preferences, Provide preference insights |
| **Recommendation Agent** | Request user preferences, Apply ML strategies, Generate personalized suggestions, Provide recommendation reasoning |

### Communication Protocol

1. **Search Flow**: User searches → Spotify Agent retrieves → User Preference Agent logs
2. **Recommendation Flow**: User requests recommendations → Recommendation Agent queries User Preference Agent → Gets preferences → Uses Spotify Agent to fetch relevant content → Returns personalized results

## Progress Demo - What's Done

- **Backend**: FastAPI server with JWT authentication, MongoDB integration, and Spotify API integration
- **Frontend**: React application with TypeScript, user authentication, and responsive design
- **AI Agents**: Three specialized agents (Spotify, User Preference, Recommendation) with OpenAI GPT integration
- **Capabilities**: Real-time podcast search, user preference tracking, and personalized recommendations

## Responsible AI Compliance Check

### Data Privacy
- User data encrypted in MongoDB Atlas
- Search history stored securely with user consent
- No personal data shared with third parties
- GDPR-compliant data handling practices

### Algorithmic Fairness
- Recommendations based on user preferences, not demographics
- No bias in content selection algorithms
- Equal opportunity for all podcast creators
- Transparent recommendation reasoning

### User Control
- Users can delete their search history.
- Opt-out options for data collection.
- Clear privacy policy and terms of service.
- User feedback mechanisms for recommendations.

### Ethical AI Practices
- OpenAI GPT used responsibly with content filtering.
- No generation of harmful or inappropriate content.
- Regular monitoring of recommendation quality.
- Continuous improvement based on user feedback.

## Installation & Setup

### Prerequisites
- Python 3.8+.
- Node.js 16+.
- MongoDB Atlas account.
- Spotify Developer account.
- OpenAI API key.

### Quick Start

```bash
# Clone repository
git clone https://github.com/Keerthithev/podcast_recomandation_system.git
cd podcast_recomandation_system

# Backend setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev
```

### Environment Configuration

**Backend (.env)**
```env
DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/podcast_db
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
OPENAI_API_KEY=your_openai_api_key
SECRET_KEY=your-secret-key
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Team Members

| Name | Registration Number |
|------|-------------------|
| T. Keerthigan | IT23203112 |
| T. Thiruverakan | IT23231078 |
| K. Rishikesh Sharma | IT23392458 |

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue on GitHub or contact the development team.

---

Built with modern technologies and responsible AI practices for intelligent podcast discovery.