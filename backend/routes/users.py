from fastapi import APIRouter, HTTPException, Depends
from services.firestore import db
from auth_utils import get_current_user_uid

router = APIRouter()


# Get user profile by ID - now protected
@router.get("/users/{user_id}")
def get_user_profile(user_id: str, authenticated_user_uid: str = Depends(get_current_user_uid)):
    # Ensure the authenticated user is requesting their own profile
    if user_id != authenticated_user_uid:
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own profile.")

    doc_ref = db.collection("users").document(user_id)
    doc = doc_ref.get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    
    data = doc.to_dict()
    
    # Map 'mobile' from Firestore to 'phone' for the API response
    if 'mobile' in data:
        data['phone'] = data.pop('mobile') # Rename mobile to phone
        
    # Optional: Ensure other potentially missing fields expected by frontend have default values
    # data.setdefault('marital_status', None) 
    # data.setdefault('location', None) 
        
    return data


# Add new user - This endpoint might not need auth or different auth logic
# For now, assuming public or handled differently. If it needs auth, add dependency.
@router.post("/users/{user_id}")
def create_user(user_id: str, payload: dict):
    ref = db.collection("users").document(user_id)
    ref.set(payload)
    return {"message": f"User {user_id} created."}


# Update user profile - now protected
@router.patch("/users/{user_id}")
def update_user_profile(user_id: str, payload: dict, authenticated_user_uid: str = Depends(get_current_user_uid)):
    if user_id != authenticated_user_uid:
        raise HTTPException(status_code=403, detail="Forbidden: You can only update your own profile.")

    # If frontend sends 'phone', map it back to 'mobile' before saving
    if 'phone' in payload:
        payload['mobile'] = payload.pop('phone')
        
    ref = db.collection("users").document(user_id)
    # Check if document exists before updating
    if not ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found, cannot update.")
    ref.update(payload) # Use update to avoid overwriting fields not included in payload
    return {"message": f"User {user_id} updated."}


# Delete user - now protected
@router.delete("/users/{user_id}")
def delete_user(user_id: str, authenticated_user_uid: str = Depends(get_current_user_uid)):
    if user_id != authenticated_user_uid:
        raise HTTPException(status_code=403, detail="Forbidden: You can only delete your own profile.")

    # Check if document exists before deleting
    doc_ref = db.collection("users").document(user_id)
    if not doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found, cannot delete.")
    doc_ref.delete()
    return {"message": f"User {user_id} deleted."}
