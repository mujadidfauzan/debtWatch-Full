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


@router.get("/users/{user_id}/risk_scores/latest")
def generate_risk_score(user_id: str):
    # 🔹 Ambil data user
    user_ref = db.collection("users").document(user_id)
    user_doc = user_ref.get()
    if not user_doc.exists:
        raise HTTPException(status_code=404, detail="User not found")
    user_data = user_doc.to_dict()

    # 🔹 Ambil tanggungan
    dep_doc = user_ref.collection("financial_dependents").document("main").get()
    dependents = dep_doc.to_dict().get("dependents_count", 0) if dep_doc.exists else 0

    # 🔹 Ambil transaksi
    transactions = user_ref.collection("transactions").stream()
    txns = [t.to_dict() for t in transactions]

    # 🔹 Ambil utang aktif
    loans = user_ref.collection("active_loans").stream()
    active_loans = [l.to_dict() for l in loans]

    # 🔹 Ambil riwayat kredit
    credit_doc = user_ref.collection("credit_history").document("main").get()
    credit_data = credit_doc.to_dict() if credit_doc.exists else {}

    # 🔹 Rangkai data untuk prompt
    prompt = f"""
Berikut adalah data pengguna:

- Nama: {user_data.get('full_name', 'Tidak diketahui')}
- Umur: {user_data.get('age', 'N/A')}
- Pekerjaan: {user_data.get('occupation', 'N/A')}
- Tanggungan keluarga: {dependents}
- Riwayat Kredit: Total Pinjaman = {credit_data.get('total_loans_taken', 0)}, Telat Bayar = {credit_data.get('missed_payments', 0)}, Pernah Gagal Bayar = {"Ya" if credit_data.get('has_default_history') else "Tidak"}

Transaksi:
{chr(10).join([f"- {t.get('type')} Rp{t.get('amount')} kategori {t.get('category')}" for t in txns]) or "Tidak ada transaksi"}

Utang Aktif:
{chr(10).join([f"- {l['loan_type']} sisa {l['remaining_months']} bulan, cicilan Rp{l['monthly_payment']}" for l in active_loans]) or "Tidak ada"}

Tolong analisis risiko keuangan pengguna ini berdasarkan data di atas. 
Berikan hasil akhir dengan memilih salah satu dari:
- High Risk
- Medium Risk
- Low Risk

Tambahkan penjelasan singkat setelahnya.
"""

    try:
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Ekstrak kategori
        if "High Risk" in text:
            label = "High Risk"
        elif "Medium Risk" in text:
            label = "Medium Risk"
        elif "Low Risk" in text:
            label = "Low Risk"
        else:
            label = "Unknown"

        # Simpan ke Firestore
        doc_ref = user_ref.collection("risk_scores").document()
        doc_ref.set(
            {
                "score": label,
                "generated_by_ai": True,
                "raw_output": text,
                "last_calculated": datetime.utcnow(),
            }
        )

        return {"score": label, "raw": text}

    except Exception as e:
        return {"error": str(e)}
