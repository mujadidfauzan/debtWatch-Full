# routes/transactions.py

from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
from services.firestore import db
from auth_utils import get_current_user_uid

router = APIRouter()

# Define a Pydantic model for the transaction payload
class TransactionPayload(BaseModel):
    amount: float
    category: str
    note: str | None = None # Make note optional
    type: str # Should be 'income' or 'expense'
    created_at: datetime # Expect a datetime object (FastAPI/Pydantic handle ISO string parsing)

# Get all user transactions - now protected
@router.get("/users/{user_id}/transactions")
def get_transactions(user_id: str, authenticated_user_uid: str = Depends(get_current_user_uid)):
    if user_id != authenticated_user_uid:
        raise HTTPException(status_code=403, detail="Forbidden: You can only access your own transactions.")

    user_doc_ref = db.collection("users").document(user_id)
    # Optional: Check if user exists first
    if not user_doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    trans_ref = user_doc_ref.collection("transactions")
    docs = trans_ref.order_by("created_at", direction=firestore.Query.DESCENDING).stream()
    
    transactions_list = []
    for doc in docs:
        data = doc.to_dict()
        data["id"] = doc.id # Explicitly add the document ID
        
        # Format timestamp to ISO string if it's a datetime object
        if "created_at" in data and isinstance(data["created_at"], datetime):
            # Ensure timestamp is timezone-aware (UTC) before formatting
            if data["created_at"].tzinfo is None:
                timestamp_utc = data["created_at"].replace(tzinfo=timezone.utc)
            else:
                timestamp_utc = data["created_at"].astimezone(timezone.utc)
            data["created_at"] = timestamp_utc.isoformat().replace("+00:00", "Z") # Use ISO format with Z
            
        transactions_list.append(data)
        
    return transactions_list


# Tambahkan transaksi baru - now protected
@router.post("/users/{user_id}/transactions")
def add_transaction(user_id: str, payload: TransactionPayload, authenticated_user_uid: str = Depends(get_current_user_uid)):
    if user_id != authenticated_user_uid:
        raise HTTPException(status_code=403, detail="Forbidden: You can only add transactions for yourself.")

    # Ensure user exists before adding transaction
    user_doc_ref = db.collection("users").document(user_id)
    if not user_doc_ref.get().exists:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Convert Pydantic model back to dict for Firestore
    # Pydantic automatically parsed payload.created_at to datetime
    transaction_data = payload.dict()
    
    # Ensure the datetime is timezone-aware (UTC) before saving
    # Firestore prefers timezone-aware datetime objects
    if transaction_data["created_at"].tzinfo is None:
        transaction_data["created_at"] = transaction_data["created_at"].replace(tzinfo=timezone.utc)
    else:
        transaction_data["created_at"] = transaction_data["created_at"].astimezone(timezone.utc)
        
    ref = user_doc_ref.collection("transactions")
    doc_ref = ref.document()  # auto-generate ID
    doc_ref.set(transaction_data)
    return {"message": "Transaction added", "id": doc_ref.id}
