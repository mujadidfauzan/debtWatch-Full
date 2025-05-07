# routes/scoring.py

from datetime import datetime

from fastapi import APIRouter, HTTPException
from services.firestore import db
from services.scoring_model import predict_score

router = APIRouter()


@router.post("/users/{user_id}/score")
def generate_risk_score(user_id: str):
    user_ref = db.collection("users").document(user_id)

    # 1. Ambil data profil
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user_doc.to_dict()
    income = user_data.get("monthly_income", 0)

    # 2. Hitung total expense bulan ini
    from calendar import monthrange
    from datetime import datetime

    now = datetime.utcnow()
    start = datetime(now.year, now.month, 1)
    end = datetime(now.year, now.month, monthrange(now.year, now.month)[1], 23, 59, 59)

    expenses_ref = user_ref.collection("transactions")
    expense_query = (
        expenses_ref.where("type", "==", "expense")
        .where("created_at", ">=", start)
        .where("created_at", "<=", end)
    )
    expenses = sum(doc.to_dict()["amount"] for doc in expense_query.stream())

    # 3. Hitung total cicilan bulanan
    loans_ref = user_ref.collection("active_loans").stream()
    monthly_loan = sum(doc.to_dict().get("monthly_payment", 0) for doc in loans_ref)

    # 4. Ambil tanggungan
    dependents_ref = user_ref.collection("financial_dependents").document("main").get()
    dependents = (
        dependents_ref.to_dict().get("dependents_count", 0)
        if dependents_ref.exists
        else 0
    )

    # 5. Ambil riwayat kredit
    history_ref = user_ref.collection("credit_history").document("main").get()
    credit = history_ref.to_dict() if history_ref.exists else {}
    missed = credit.get("missed_payments", 0)
    defaulted = credit.get("has_default_history", False)

    # 6. Susun fitur untuk AI
    features = [income, expenses, monthly_loan, dependents, missed, int(defaulted)]

    # 7. Prediksi risiko
    score = predict_score(features)

    # 8. Simpan hasil ke Firestore
    score_ref = user_ref.collection("risk_scores").document()
    score_ref.set(
        {
            "score": score,
            "features_used": features,
            "generated_by_ai": True,
            "last_calculated": datetime.utcnow(),
        }
    )

    return {"risk_score": score, "features": features}
