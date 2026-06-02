pipeline {
    agent any
    environment {
        APP = 'employee-onboarding-portal'
    }
    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/your-org/onboarding-portal.git'
            }
        }
        stage('Install Dependencies') {
            steps {
                bat 'pip install -r backend/requirements.txt'
                bat 'pip install -r ai-service/requirements.txt'
                bat 'cd frontend && npm install'
            }
        }
        stage('Run Tests') {
            steps {
                bat 'cd backend && pytest tests/ -v --tb=short'
            }
        }
        stage('Build Docker Images') {
            steps {
                bat 'docker build -t onboard-backend:latest ./backend'
                bat 'docker build -t onboard-frontend:latest ./frontend'
                bat 'docker build -t onboard-ai:latest ./ai-service'
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl apply -f k8s/backend-deployment.yaml'
                bat 'kubectl apply -f k8s/frontend-deployment.yaml'
                bat 'kubectl apply -f k8s/ai-deployment.yaml'
                bat 'kubectl rollout status deployment/onboard-backend'
            }
        }
    }
    post {
        success { echo 'Onboarding Portal deployed successfully!' }
        failure { echo 'Build failed. Check Jenkins console output.' }
    }
}
