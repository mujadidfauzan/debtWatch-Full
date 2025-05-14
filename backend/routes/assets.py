# routes/assets.py

from datetime import datetime

from fastapi import APIRouter, Request
from services.firestore import db

router = APIRouter()


@router.get("/users/{user_id}/assets")
def get_assets(user_id: str):
    ref = db.collection("users").document(user_id).collection("assets")
    docs = ref.stream()
    return [doc.to_dict() for doc in docs]


@router.post("/users/{user_id}/assets")
async def save_assets(user_id: str, request: Request):
    data = await request.json()
    assets = data.get("assets", [])

    batch = db.batch()
    assets_ref = db.collection("users").document(user_id).collection("assets")

    existing_assets = assets_ref.stream()
    for doc in existing_assets:
        batch.delete(doc.reference)

    for asset in assets:
        doc_ref = assets_ref.document()
        batch.set(doc_ref, asset)

    batch.commit()
    return {"status": "success", "message": "Assets saved successfully."}
