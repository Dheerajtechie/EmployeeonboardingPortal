# AI-Powered Employee Onboarding Portal

An enterprise-grade Employee Onboarding Portal built to streamline and automate the new hire integration process. This platform provides a centralized, secure, and intelligent ecosystem combining a React frontend, FastAPI core backend, Oracle relational database, and an AI-driven Chatbot Service powered by FAISS vector similarity and Groq LLMs.

## Core Features
1. **Multi-Role Dashboards**: Dedicated experiences for New Hires, HR Admins, IT Admins, and Buddies.
2. **Automated Task Management**: Role/Department specific task assignment with progress tracking.
3. **Document Workflow**: Upload, verify, and reject documents securely with automated triggers.
4. **IT Asset Provisioning**: Real-time asset assignment, status tracking, and lifecycle management.
5. **AI Onboarding Copilot**: Semantic RAG chatbot providing real-time, personalized policy answers using a FAISS vector index.
6. **Enterprise Security**: JWT-based authentication, bcrypt hashing, and strict role-based access control (RBAC).

## Architecture Stack
- **Frontend**: React, Vite, Lucide-React
- **Backend API**: FastAPI (Python), PyJWT
- **AI Service**: Flask, FAISS, Sentence-Transformers, Groq
- **Database**: Oracle DB (cx_Oracle / oracledb)
- **DevOps**: Docker, Docker-Compose, Kubernetes (Minikube), Jenkins

## Evaluator Resources
Please refer to the following documentation files to evaluate the system's architecture and readiness:
- [SETUP.md](./SETUP.md) - Local, Docker, and Kubernetes deployment instructions.
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System Component Diagrams.
- [DATABASE.md](./DATABASE.md) - Oracle DB Entity Relationship Diagram and Schema overview.
- [API_DOCS.md](./API_DOCS.md) - FastAPI and Flask route contracts.

## License
Confidential - Wipro Enterprise Project
