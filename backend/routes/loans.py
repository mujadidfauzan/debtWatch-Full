# routes/loans.py

from datetime import datetime

from fastapi import APIRouter
from services.firestore import db

router = APIRouter()


@router.get("/users/{user_id}/loans")
def get_loans(user_id: str):
    ref = db.collection("users").document(user_id).collection("loans")
    docs = ref.stream()
    return [doc.to_dict() for doc in docs]


@router.post("/users/{user_id}/loans")
def add_active_loan(user_id: str, payload: dict):
    payload["created_at"] = datetime.utcnow()

    sudah = payload.get("cicilanSudahBayar", 0)
    total = payload.get("cicilanTotalBulan", 0)
    payload["is_active"] = sudah < total

    ref = db.collection("users").document(user_id).collection("loans")
    doc = ref.document()
    doc.set(payload)
    return {"message": "Loan added", "id": doc.id}


@router.patch("/users/{user_id}/loans/{loan_id}")
def update_loan_payment(user_id: str, loan_id: str, payload: dict):
    sudah = payload.get("cicilanSudahBayar")
    total = payload.get("cicilanTotalBulan")

    is_active = sudah < total if sudah is not None and total is not None else True
    payload["is_active"] = is_active
    payload["updated_at"] = datetime.utcnow()

    ref = db.collection("users").document(user_id).collection("loans").document(loan_id)
    ref.set(payload, merge=True)

    return {"message": "Loan updated", "is_active": is_active}


@router.get("/users/{user_id}/loans/active")
def get_active_loans(user_id: str):
    ref = db.collection("users").document(user_id).collection("loans")
    docs = ref.where("is_active", "==", True).stream()
    return [doc.to_dict() for doc in docs]
