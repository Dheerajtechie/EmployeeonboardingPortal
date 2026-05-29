# AI-Powered Employee Onboarding Portal

A full-stack web application designed for freshers entering an IT company. This portal manages the entire onboarding journey including tasks, document verification, IT asset assignments, training modules, and buddy pairing. It features an AI-powered Chatbot (using RAG) that answers new hire questions by querying company policy documents.

## Technology Stack

- **Frontend:** React JS, Vite, Axios, React Router
- **Backend:** FastAPI (Python), PyJWT, Passlib/Bcrypt
- **AI Service:** Flask (Python), Groq LLM API
- **Database:** Oracle Database 21c (XE)
- **DevOps:** Docker, Kubernetes, Jenkins CI/CD

## Setup Instructions

### 1. Database Setup
1. Ensure Oracle Database XE is installed and running on `localhost:1521/XEPDB1`.
2. Run the `backend/schema_setup.py` script to automatically create the `onboarding_user`, table structures, and seed data.

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
ORACLE_USER=onboarding_user
ORACLE_PASSWORD=onboarding123
ORACLE_DSN=localhost:1521/XEPDB1
SECRET_KEY=onboard_secret_key_2024_wipro
ALGORITHM=HS256
FILE_UPLOAD_PATH=./uploads
AI_SERVICE_URL=http://localhost:5000
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Running Locally (Development)

**Backend (Port 8000):**
```bash
cd backend
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

**AI Service (Port 5000):**
```bash
cd ai-service
pip install -r requirements.txt
python app.py
```

**Frontend (Port 3000):**
```bash
cd frontend
npm install
npm run dev
```

### 4. Running with Docker Compose
To run all three services using Docker:
```bash
docker-compose up --build
```

### 5. Kubernetes Deployment
To deploy to a local Kubernetes cluster (like Minikube or Docker Desktop K8s):
```bash
kubectl apply -f k8s/
```

## Features
- **HR Admin:** Create new hires, view onboarding progress, verify documents, assign buddies.
- **New Hire:** View progress checklist, upload documents, confirm laptop receipt, complete training, ask AI Chatbot for help.
- **AI Chatbot:** Uses Retrieval-Augmented Generation (RAG) to query the Oracle DB for policy FAQs and specific pending tasks to provide personalized answers.
