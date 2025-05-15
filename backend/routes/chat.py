import os
from datetime import datetime
from typing import List, Optional

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from services.firestore import db

load_dotenv()
router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


# =============== Pydantic Models for Request/Response ===============


class ChatRequest(BaseModel):
    user_id: str
    message: str


class ChatMessage(BaseModel):
    id: str
    text: str
    isUser: bool
    timestamp: str
    archived: Optional[bool] = False


class ChatRoom(BaseModel):
    id: str
    name: str
    created_at: str
    last_message: Optional[str] = None
    last_message_time: Optional[str] = None


class ChatRoomCreate(BaseModel):
    name: str
    created_at: str


class MessageCreate(BaseModel):
    message: str
    timestamp: str


class MessageUpdate(BaseModel):
    archived: Optional[bool] = None


# =============== Utility Functions ===============


def get_user_profile(user_id: str) -> dict:
    doc = db.collection("users").document(user_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    return doc.to_dict()


def get_user_loans(user_id: str) -> list:
    return [
        doc.to_dict()
        for doc in db.collection("users").document(user_id).collection("loans").stream()
    ]


def get_user_assets(user_id: str) -> list:
    return [
        doc.to_dict()
        for doc in db.collection("users")
        .document(user_id)
        .collection("assets")
        .stream()
    ]


def get_user_transactions(user_id: str) -> list:
    return [
        doc.to_dict()
        for doc in db.collection("users")
        .document(user_id)
        .collection("transactions")
        .stream()
    ]


def build_user_profile_summary(user_id: str) -> str:
    profile = get_user_profile(user_id)
    loans = get_user_loans(user_id)
    transactions = get_user_transactions(user_id)
    assets = get_user_assets(user_id)

    income = sum(t.get("amount", 0) for t in transactions if t.get("type") == "income")
    expense = sum(
        t.get("amount", 0) for t in transactions if t.get("type") == "expense"
    )

    total_cicilan_perbulan = sum(loan.get("cicilanPerbulan", 0) for loan in loans)
    total_utang = sum(
        loan.get("cicilanPerbulan", 0)
        * (loan.get("cicilanTotalBulan", 0) - loan.get("cicilanSudahDibayar", 0))
        for loan in loans
    )

    summary = f"""
    User Profile:
    - Profile: {profile}

    Assets:
    {chr(10).join([
        f"- {a.get('name', 'Unknown')}: Rp{a.get('value', 0)}"
        for a in assets
    ]) or 'No assets.'}

    Recent Transaction History:
    {chr(10).join([
        f"- {t.get('type', 'unknown')}: Rp{t.get('amount', 0)} for {t.get('category', 'unknown')}"
        for t in transactions
    ]) or 'No transactions.'}

    Active Loans:
    {chr(10).join([
        f"- {l.get('loan_type', 'unknown')}: Installment Rp{l.get('cicilanPerbulan', 0)} for {l.get('cicilanTotalBulan', 0)} months (remaining {l.get('cicilanTotalBulan', 0) - l.get('cicilanSudahDibayar', 0)} months)"
        for l in loans
    ]) or 'No active loans.'}

    Financial Summary:
    - Total Income: Rp{income}
    - Total Expenses: Rp{expense}
    - Total Monthly Installments: Rp{total_cicilan_perbulan}
    - Total Remaining Debt: Rp{total_utang}
    """

    return summary.strip()


def generate_ai_response(user_profile: str, message: str) -> str:
    """Generate AI response using Gemini API"""
    system_instruction = (
        "You are DebtBot, a virtual personal finance assistant. "
        "Only answer questions related to finance, debt, spending, or financial advice. "
        "Do not respond to topics outside this scope. "
        "Provide clear and concise responses. "
        "Use formal yet approachable language.\n\n"
    )

    prompt = f"{system_instruction}{user_profile}User: {message}"

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        print(f"Error generating AI response: {e}")
        raise HTTPException(
            status_code=500, detail=f"Failed to generate AI response: {str(e)}"
        )


# =============== API Endpoints ===============


@router.post("/api/chat")
async def chat(request: ChatRequest, user_id: str):
    """Legacy chat endpoint that will be maintained for backward compatibility"""
    print(f"Received request for user {request.user_id}: {request.message}")

    try:
        user_profile = build_user_profile_summary(user_id)
        reply_text = generate_ai_response(user_profile, request.message)
        print(f"AI Response: {reply_text}")
        return {"reply": reply_text}
    except Exception as e:
        print(f"Exception in chat: {str(e)}")
        return {"error": str(e)}


# =============== Chatroom Endpoints ===============


@router.get("/users/{user_id}/chatrooms")
async def get_user_chatrooms(user_id: str) -> List[ChatRoom]:
    """Get all chat rooms for a user"""
    try:
        chatrooms_ref = db.collection("users").document(user_id).collection("chatrooms")
        chatrooms = chatrooms_ref.order_by(
            "created_at", direction="DESCENDING"
        ).stream()

        results = []
        for room in chatrooms:
            room_data = room.to_dict()
            results.append(
                ChatRoom(
                    id=room.id,
                    name=room_data.get("name", "Unnamed Chat"),
                    created_at=room_data.get("created_at", ""),
                    last_message=room_data.get("last_message"),
                    last_message_time=room_data.get("last_message_time"),
                )
            )

        return results
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch chatrooms: {str(e)}"
        )


@router.post("/users/{user_id}/chatrooms")
async def create_chatroom(user_id: str, chatroom: ChatRoomCreate) -> ChatRoom:
    """Create a new chat room for a user"""
    try:
        # Check if user exists
        user_ref = db.collection("users").document(user_id)
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")

        # Create new chatroom document
        chatroom_ref = user_ref.collection("chatrooms").document()  # Auto-generated ID

        chatroom_data = {
            "name": chatroom.name,
            "created_at": chatroom.created_at,
        }

        chatroom_ref.set(chatroom_data)

        # Return the created chatroom with its ID
        return ChatRoom(
            id=chatroom_ref.id, name=chatroom.name, created_at=chatroom.created_at
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to create chatroom: {str(e)}"
        )


@router.get("/users/{user_id}/chatrooms/{room_id}/messages")
async def get_chat_messages(user_id: str, room_id: str) -> List[ChatMessage]:
    """Get all messages for a specific chat room"""
    try:
        # Verify user and chatroom
        user_ref = db.collection("users").document(user_id)
        chatroom_ref = user_ref.collection("chatrooms").document(room_id)

        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        if not chatroom_ref.get().exists:
            raise HTTPException(status_code=404, detail="Chat room not found")

        # Get messages
        messages_ref = chatroom_ref.collection("messages")
        messages = messages_ref.order_by("timestamp").stream()

        results = []
        for msg in messages:
            msg_data = msg.to_dict()
            results.append(
                ChatMessage(
                    id=msg.id,
                    text=msg_data.get("text", ""),
                    isUser=msg_data.get("isUser", True),
                    timestamp=msg_data.get("timestamp", ""),
                    archived=msg_data.get("archived", False),
                )
            )

        return results
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to fetch messages: {str(e)}"
        )


@router.post("/users/{user_id}/chatrooms/{room_id}/messages")
async def send_chat_message(
    user_id: str, room_id: str, message_req: MessageCreate
) -> ChatMessage:
    """Send a message to a chat room and get AI response"""
    try:
        # Verify user and chatroom
        user_ref = db.collection("users").document(user_id)
        chatroom_ref = user_ref.collection("chatrooms").document(room_id)

        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        if not chatroom_ref.get().exists:
            raise HTTPException(status_code=404, detail="Chat room not found")

        # Generate ID for user message
        message_ref = chatroom_ref.collection("messages").document()

        # Store user message
        user_message_data = {
            "text": message_req.message,
            "isUser": True,
            "timestamp": message_req.timestamp,
            "archived": False,
        }

        message_ref.set(user_message_data)

        # Get user profile for AI context
        user_profile = build_user_profile_summary(user_id)

        # Generate AI response
        ai_response = generate_ai_response(user_profile, message_req.message)

        # Store AI response
        ai_message_ref = chatroom_ref.collection("messages").document()
        ai_message_data = {
            "text": ai_response,
            "isUser": False,
            "timestamp": datetime.now().isoformat(),
            "archived": False,
        }

        ai_message_ref.set(ai_message_data)

        # Update chatroom with last message info
        chatroom_ref.update(
            {
                "last_message": message_req.message,
                "last_message_time": message_req.timestamp,
            }
        )

        # Return the AI message
        return ChatMessage(
            id=ai_message_ref.id,
            text=ai_response,
            isUser=False,
            timestamp=ai_message_data["timestamp"],
            archived=False,
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send message: {str(e)}")


@router.patch("/users/{user_id}/chatrooms/{room_id}/messages/{message_id}")
async def update_chat_message(
    user_id: str, room_id: str, message_id: str, updates: MessageUpdate
) -> dict:
    """Update a chat message (currently only for archiving/unarchiving)"""
    try:
        # Verify user, chatroom, and message
        user_ref = db.collection("users").document(user_id)
        chatroom_ref = user_ref.collection("chatrooms").document(room_id)
        message_ref = chatroom_ref.collection("messages").document(message_id)

        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        if not chatroom_ref.get().exists:
            raise HTTPException(status_code=404, detail="Chat room not found")
        if not message_ref.get().exists:
            raise HTTPException(status_code=404, detail="Message not found")

        # Update message
        update_data = {}
        if updates.archived is not None:
            update_data["archived"] = updates.archived

        if update_data:
            message_ref.update(update_data)

        return {"message": "Message updated successfully"}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to update message: {str(e)}"
        )
