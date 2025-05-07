# routes/risk_scores.py

from fastapi import APIRouter
from services.firestore import db

router = APIRouter()


# Ambil skor risiko terakhir user
@router.get("/users/{user_id}/risk_scores/latest")
def get_latest_risk_score(user_id: str):
    ref = db.collection("users").document(user_id).collection("risk_scores")
    docs = ref.order_by("last_calculated", direction="DESCENDING").limit(1).stream()

    for doc in docs:
        return doc.to_dict()

    return {"message": "No score found", "score": None}
