# Deployment & Setup Guide

This guide details how to run the Employee Onboarding Portal in Local, Docker, Kubernetes, and Jenkins environments.

## Prerequisites
- Node.js 18+
- Python 3.9+
- Oracle DB Express Edition (XE) or Oracle ATP
- Docker & Docker Compose
- Minikube & kubectl
- Jenkins

---

## 1. Local Deployment

### 1.1 Oracle Database Setup
1. Spin up your Oracle DB instance.
2. Execute `backend/schema.sql` to initialize tables, constraints, and mock data.
3. Update the `.env` file in the root directory:
```env
ORACLE_USER=onboarding_user
ORACLE_PASSWORD=onboarding123
ORACLE_DSN=localhost:1521/XEPDB1
JWT_SECRET=supersecret
XAI_API_KEY=your_xai_key
```

### 1.2 FastAPI Backend
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn main:app --port 8000 --reload
```

### 1.3 AI Chatbot Service
```bash
cd ai-service
python -m pip install -r requirements.txt
python app.py
```
*Note: The AI service runs on port 5000 and uses FAISS local vector databases.*

### 1.4 React Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 2. Docker Compose Deployment

The entire stack is containerized for seamless orchestration.

```bash
docker-compose up --build -d
```
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **AI Service**: http://localhost:5000

---

## 3. Kubernetes Deployment (Minikube)

1. Start Minikube:
```bash
minikube start --driver=docker
```

2. Point Docker to Minikube's daemon to build images directly inside K8s:
```bash
@FOR /f "tokens=*" %i IN ('minikube -p minikube docker-env --shell cmd') DO @%i
```

3. Build Images:
```bash
cd frontend && docker build -t onboarding-frontend:latest .
cd ../backend && docker build -t onboarding-backend:latest .
```

4. Apply Secrets and ConfigMaps:
```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
```

5. Deploy Services:
```bash
kubectl apply -f k8s/
```

6. Verify Pods:
```bash
kubectl get pods -A
```

---

## 4. Jenkins CI/CD Pipeline

The repository contains a declarative `Jenkinsfile` for automated builds.
1. Download Jenkins `jenkins.war` and run `java -jar jenkins.war --httpPort=8080`.
2. Install the necessary Jenkins plugins (Docker Pipeline, Git, Kubernetes).
3. Create a Pipeline Job pointing to this GitHub repository.
4. The pipeline will automatically:
   - Checkout Code
   - Run tests (mock)
   - Build Docker containers
   - Push to local/remote registry
   - Trigger `kubectl rollout`
