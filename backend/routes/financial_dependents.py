# routes/financial_dependents.py

from datetime import datetime

from fastapi import APIRouter
from services.firestore import db

router = APIRouter()


# Ambil jumlah tanggungan user
@router.get("/users/{user_id}/dependents")
def get_dependents(user_id: str):
    ref = (
        db.collection("users")
        .document(user_id)
        .collection("financial_dependents")
        .document("main")
    )
    doc = ref.get()
    if doc.exists:
        return doc.to_dict()
    return {"dependents_count": 0}


# Update jumlah tanggungan user
@router.patch("/users/{user_id}/dependents")
def update_dependents(user_id: str, payload: dict):
    payload["updated_at"] = datetime.utcnow()

    ref = (
        db.collection("users")
        .document(user_id)
        .collection("financial_dependents")
        .document("main")
    )
    ref.set(payload, merge=True)
    return {"message": "Dependents updated"}
