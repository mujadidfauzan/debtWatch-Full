# routes/assets.py

from datetime import datetime

from fastapi import APIRouter
from services.firestore import db

router = APIRouter()


@router.get("/users/{user_id}/assets")
def get_assets(user_id: str):
    ref = db.collection("users").document(user_id).collection("assets")
    docs = ref.stream()
    return [doc.to_dict() for doc in docs]
