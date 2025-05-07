# routes/active_loans.py

from datetime import datetime

from fastapi import APIRouter
from services.firestore import db

router = APIRouter()


# Ambil semua utang aktif user
@router.get("/users/{user_id}/active_loans")
def get_active_loans(user_id: str):
    ref = db.collection("users").document(user_id).collection("active_loans")
    docs = ref.stream()
    return [doc.to_dict() for doc in docs]


# Tambahkan utang baru
@router.post("/users/{user_id}/active_loans")
def add_active_loan(user_id: str, payload: dict):
    payload["created_at"] = datetime.utcnow()

    ref = db.collection("users").document(user_id).collection("active_loans")
    doc = ref.document()
    doc.set(payload)
    return {"message": "Active loan added", "id": doc.id}
