# Kinetiq

A modern, AI-powered fitness training platform offering real-time posture analysis, personalized workout suggestions, and nutrition advice. Built with computer vision and LLM integration for a comprehensive fitness coaching experience.

## Features

- Real-time posture analysis using MediaPipe and PyTorch
- Accurate tracking across 5 core exercises (squats, push-ups, planks, lunges, deadlifts)
- Smart workout and nutrition advisor
- React web interface with camera integration
- AWS Lambda serverless deployment
- Fast responses per analysis (<200ms latency)

## Project Structure

```
├── backend/                 # Python FastAPI backend
│   ├── models/             # PyTorch models for posture analysis
│   ├── services/           # Posture analysis and coaching services
│   ├── api/                # FastAPI routes
│   └── lambda/             # AWS Lambda deployment code
├── frontend/               # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API integration
│   │   └── utils/          # Utility functions
└── docs/                   # Documentation
```

## Quick Start

### Backend Setup
```bash
pip install -r requirements.txt
cd backend
python -m uvicorn api.main:app --reload
```

### Frontend Setup
```bash
npm install
npm start
```

## API Endpoints

- `POST /analyze-posture` - Analyze exercise form from image/video
- `POST /workout-plan` - Generate personalized workout plan
- `POST /nutrition-advice` - Get nutrition recommendations
- `GET /exercise-library` - Get available exercises

## Deployment

The application is designed for AWS Lambda deployment with serverless inference pipeline.
