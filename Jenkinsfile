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
                sh 'pip install -r backend/requirements.txt'
                sh 'pip install -r ai-service/requirements.txt'
                sh 'cd frontend && npm install'
            }
        }
        stage('Run Tests') {
            steps {
                sh 'cd backend && pytest tests/ -v --tb=short'
            }
        }
        stage('Build Docker Images') {
            steps {
                sh 'docker build -t onboard-backend:latest ./backend'
                sh 'docker build -t onboard-frontend:latest ./frontend'
                sh 'docker build -t onboard-ai:latest ./ai-service'
            }
        }
        stage('Deploy to Kubernetes') {
            steps {
                sh 'kubectl apply -f k8s/backend.yaml'
                sh 'kubectl apply -f k8s/frontend.yaml'
                sh 'kubectl apply -f k8s/ai.yaml'
                sh 'kubectl rollout status deployment/onboard-backend'
            }
        }
    }
    post {
        success { echo 'Onboarding Portal deployed successfully!' }
        failure { echo 'Build failed. Check Jenkins console output.' }
    }
}
