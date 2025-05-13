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


@router.post("/users/{user_id}/risk_scores/generate")
def generate_risk_score(user_id: str):
    try:
        user_ref = db.collection("users").document(user_id)

        # Ambil data user profile
        user_data = user_ref.get().to_dict()
        if not user_data:
            raise HTTPException(status_code=404, detail="User not found")

        income = user_data.get("monthly_income", 0)
        dependents = (
            user_ref.collection("financial_dependents").document("main").get().to_dict()
            or {}
        )
        loans = list(user_ref.collection("loans").stream())
        credit = (
            user_ref.collection("credit_history").document("main").get().to_dict() or {}
        )

        # Ambil total pengeluaran
        transactions = list(user_ref.collection("transactions").stream())
        total_expenses = sum(
            t.get("amount", 0)
            for t in (tr.to_dict() for tr in transactions)
            if t.get("type") == "expense"
        )

        total_cicilan_perbulan = sum(
            (doc.to_dict().get("cicilanPerbulan", 0) for doc in loans)
        )
        total_utang = sum(
            doc.to_dict().get("cicilanPerbulan", 0)
            * (
                doc.to_dict().get("cicilanTotalBulan", 0)
                - doc.to_dict().get("cicilanSudahDibayar", 0)
            )
            for doc in loans
        )

        # Prompt AI
        prompt = f"""
        Profil Pengguna:
        - Penghasilan: Rp{income}
        - Pengeluaran: Rp{total_expenses}
        - Jumlah tanggungan: {dependents.get("dependents_count", 0)}
        - Total cicilan per bulan: Rp{total_cicilan_perbulan}
        - Total utang tersisa: Rp{total_utang}

        Tugas Anda adalah mengkategorikan tingkat risiko finansial pengguna ini sebagai salah satu dari:
        - Rendah
        - Sedang
        - Tinggi

        Lalu berikan penjelasan singkat 1-2 kalimat mengapa.
        Format jawaban: <Risiko>: <Penjelasan>
        Contoh: Tinggi: Pengeluaran bulanan melebihi penghasilan bulanan.
        """

        ai_response = model.generate_content(prompt)
        reply = ai_response.text.strip()

        # Default fallback values
        risk_level = "Unknown"
        explanation = reply

        # Try to parse "<Risiko>: <Penjelasan>"
        if ":" in reply:
            level_part, explanation_part = reply.split(":", 1)
            explanation = explanation_part.strip()

            level_lower = level_part.strip().lower()
            if level_lower.startswith("tinggi"):
                risk_level = "High"
            elif level_lower.startswith("sedang"):
                risk_level = "Medium"
            elif level_lower.startswith("rendah"):
                risk_level = "Low"
        else:
            # If no colon found, assume the whole reply is just explanation
            explanation = reply

        # Simpan ke Firestore
        ref = user_ref.collection("risk_scores").document()
        ref.set(
            {
                "score": risk_level,
                "generated_by_ai": True,
                "explanation": reply,
                "last_calculated": datetime.utcnow(),
            }
        )

        return {"risk_level": risk_level, "explanation": explanation}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to generate risk score: {str(e)}"
        )
