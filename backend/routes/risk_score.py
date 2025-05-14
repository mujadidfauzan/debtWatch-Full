import os
from datetime import datetime

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from services.firestore import db

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")
router = APIRouter()


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


@router.post("/users/{user_id}/risk_scores/generate")
def generate_risk_score(user_id: str):
    try:
        profile = get_user_profile(user_id)
        loans = get_user_loans(user_id)
        transactions = get_user_transactions(user_id)
        assets = get_user_assets(user_id)

        expense = sum(
            t.get("amount", 0) for t in transactions if t.get("type") == "expense"
        )
        income = sum(
            t.get("amount", 0) for t in transactions if t.get("type") == "income"
        )

        total_cicilan_perbulan = sum(loan.get("cicilanPerbulan", 0) for loan in loans)

        total_utang = sum(
            loan.get("cicilanPerbulan", 0)
            * (loan.get("cicilanTotalBulan", 0) - loan.get("cicilanSudahDibayar", 0))
            for loan in loans
        )

        print("Profile:", profile)
        print("Assets:", assets)
        print("Transactions:", transactions)
        print("Loans:", loans)
        print("Total Income:", income)
        print("Total Expense:", expense)
        print("Total Installments:", total_cicilan_perbulan)
        print("Total Debt:", total_utang)

        # Prompt AI
        prompt = f"""
        User Profile:
        - Profile : {profile}
        - Assets: {assets}
        - Income: Rp{income}
        - Expenses: Rp{expense}
        - Total Monthly Installments: Rp{total_cicilan_perbulan}
        - Remaining Total Debt: Rp{total_utang}

        Your task is to categorize this user's financial risk into one of the following:
        - Low
        - Medium    
        - High

        Then give a brief 1-2 sentence explanation why.
        Format: <Risk>: <Reason>
        Example: High: Expenses exceed income.
        """

        ai_response = model.generate_content(prompt)
        reply = ai_response.text.strip()

        risk_level = "Unknown"
        explanation = reply

        if ":" in reply:
            level_part, explanation_part = reply.split(":", 1)
            explanation = explanation_part.strip()

            level_lower = level_part.strip().lower()
            if "high" in level_lower or "tinggi" in level_lower:
                risk_level = "High"
            elif "medium" in level_lower or "sedang" in level_lower:
                risk_level = "Medium"
            elif "low" in level_lower or "rendah" in level_lower:
                risk_level = "Low"

        # Simpan hasil ke Firestore
        db.collection("users").document(user_id).collection(
            "risk_scores"
        ).document().set(
            {
                "score": risk_level,
                "generated_by_ai": True,
                "explanation": explanation,
                "last_calculated": datetime.utcnow(),
            }
        )

        return {"risk_level": risk_level, "explanation": explanation}

    except HTTPException as http_err:
        raise http_err
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate risk score: {str(e)}"
        )
