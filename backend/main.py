from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes import auth, tasks, documents, assets, trainings, buddies, admin, enterprise, notifications, reports

app = FastAPI(title="AI-Powered Employee Onboarding Portal")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow frontend running on any port for dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(tasks.router)
app.include_router(documents.router)
app.include_router(assets.router)
app.include_router(trainings.router)
app.include_router(buddies.router)
app.include_router(admin.router)
app.include_router(enterprise.router)
app.include_router(notifications.router)
app.include_router(reports.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Onboarding Portal API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}

