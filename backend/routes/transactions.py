# routes/transactions.py

from datetime import datetime

from fastapi import APIRouter, HTTPException
from google.cloud import firestore
from services.firestore import db

router = APIRouter()


# Ambil semua transaksi user
@router.get("/users/{user_id}/transactions")
def get_transactions(user_id: str):
    ref = db.collection("users").document(user_id).collection("transactions")
    docs = ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    return [doc.to_dict() for doc in docs]


# Tambahkan transaksi baru
@router.post("/users/{user_id}/transactions")
def add_transaction(user_id: str, payload: dict):
    payload["created_at"] = datetime.utcnow()

    ref = db.collection("users").document(user_id).collection("transactions")
    doc = ref.document()  # auto-generate ID
    doc.set(payload)
    return {"message": "Transaction added", "id": doc.id}
