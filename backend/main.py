# main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import (
    assets,
    chat,
    credit_history,
    financial_dependents,
    loans,
    risk_score,
    transactions,
    users,
)

app = FastAPI(
    title="DebtWatch API",
    description="Backend API untuk analisis risiko keuangan pengguna berbasis AI",
    version="1.0.0",
)

# Define allowed origins for CORS
# For development, you can allow your frontend's origin.
# For production, be more restrictive.
origins = [
    "http://localhost:8080",  # Your frontend's origin (if it's 8080)
    "http://localhost:5173",  # Common Vite default port, add if you use it
    # Add any other origins you need to allow (e.g., your deployed frontend URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # List of origins that are allowed to make requests
    allow_credentials=True,  # Allows cookies to be included in requests
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, etc.)
    allow_headers=["*"],  # Allows all headers
)

# Register semua endpoint
app.include_router(users.router)
app.include_router(chat.router)
app.include_router(transactions.router)
app.include_router(loans.router)
app.include_router(financial_dependents.router)
app.include_router(credit_history.router)
app.include_router(risk_score.router)
app.include_router(loans.router)
app.include_router(assets.router)
