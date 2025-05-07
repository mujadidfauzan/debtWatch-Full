# main.py

from fastapi import FastAPI
from routes import (  # scoring,
    active_loans,
    credit_history,
    financial_dependents,
    risk_score,
    transactions,
    users,
)

app = FastAPI(
    title="DebtWatch API",
    description="Backend API untuk analisis risiko keuangan pengguna berbasis AI",
    version="1.0.0",
)

# Register semua endpoint
app.include_router(users.router)
app.include_router(transactions.router)
app.include_router(active_loans.router)
app.include_router(financial_dependents.router)
app.include_router(credit_history.router)
app.include_router(risk_score.router)
# app.include_router(scoring.router)
