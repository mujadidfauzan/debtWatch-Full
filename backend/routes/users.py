from fastapi import APIRouter, HTTPException
from services.firestore import db

router = APIRouter()


# Get user profile by ID
@router.get("/users/{user_id}")
def get_user_profile(user_id: str):
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return doc.to_dict()


# Add new user
@router.post("/users/{user_id}")
def create_user(user_id: str, payload: dict):
    ref = db.collection("users").document(user_id)
    ref.set(payload)
    return {"message": f"User {user_id} created."}


# Update user profile
@router.patch("/users/{user_id}")
def update_user_profile(user_id: str, payload: dict):
    ref = db.collection("users").document(user_id)
    ref.update(payload)
    return {"message": f"User {user_id} updated."}


@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    db.collection("users").document(user_id).delete()
    return {"message": f"User {user_id} deleted."}
