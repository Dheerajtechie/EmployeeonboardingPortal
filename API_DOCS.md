# API Documentation

The Employee Onboarding Portal exposes two distinct REST API services.

## 1. FastAPI Core (Port 8000)

### Auth (`/auth`)
- `POST /auth/login` - Returns JWT token.
- `POST /auth/register` - Creates a new user (HR Admin only).
- `POST /auth/set-password` - Allows new hires to set their password via one-time tokens.
- `GET /auth/me` - Validates JWT and returns active user context.

### Admin (`/admin`)
- `GET /admin/onboarding-status` - Progress tracker for all new hires.
- `POST /admin/bulk-assign` - Maps tasks to department members.
- `GET /admin/users` - Fetches the directory of all users.
- `DELETE /admin/users/{id}` - Deep deletion of an employee and their records.
- `POST /admin/assets` - Creates a new IT asset.
- `DELETE /admin/assets/{id}` - Deletes an IT asset.
- `POST /admin/documents/{id}/review` - Approves or rejects a document submission.

### Tasks (`/tasks`)
- `GET /tasks/my` - Fetches tasks for current user.
- `PUT /tasks/{id}/complete` - Manually completes a task.

### Documents (`/documents`)
- `GET /documents/my` - Fetches uploaded documents.
- `POST /documents/upload` - Secure file upload. Replaces rejected files implicitly. Auto-completes associated tasks.

### Assets (`/assets`)
- `GET /assets/my` - Fetches assets assigned to user.
- `PUT /assets/{id}/confirm` - Confirms receipt. Auto-completes IT Setup tasks.
- `PUT /assets/{id}/status` - Reports damage or loss.

## 2. Flask AI Service (Port 5000)

### Chatbot (`/chatbot`)
- `GET /chatbot/health` - Ping check for K8s liveliness probes.
- `POST /chatbot/ask` - The primary RAG endpoint.
  - **Payload:** `{ "query": "string", "user_id": "integer" }`
  - **Behavior:** Fetches real-time user tasks and documents, embeds the query, searches FAISS, constructs a prompt, and yields a Grok (xAI) completion.
