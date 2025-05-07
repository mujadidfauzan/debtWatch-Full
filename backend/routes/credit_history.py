# routes/credit_history.py

from datetime import datetime

from fastapi import APIRouter
from services.firestore import db

router = APIRouter()


# Ambil riwayat kredit user
@router.get("/users/{user_id}/credit_history")
def get_credit_history(user_id: str):
    ref = (
        db.collection("users")
        .document(user_id)
        .collection("credit_history")
        .document("main")
    )
    doc = ref.get()
    if doc.exists:
        return doc.to_dict()
    return {"total_loans_taken": 0, "missed_payments": 0, "has_default_history": False}


# Update riwayat kredit user
@router.patch("/users/{user_id}/credit_history")
def update_credit_history(user_id: str, payload: dict):
    payload["last_updated"] = datetime.utcnow()

    ref = (
        db.collection("users")
        .document(user_id)
        .collection("credit_history")
        .document("main")
    )
    ref.set(payload, merge=True)
    return {"message": "Credit history updated"}
