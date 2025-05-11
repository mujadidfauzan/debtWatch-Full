import os

import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.firestore import db

load_dotenv()
router = APIRouter()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")


class ChatRequest(BaseModel):
    user_id: str
    message: str


@router.post("/api/chat")
async def chat(request: ChatRequest):
    print("Received Request:", request)

    user_ref = db.collection("users").document(request.user_id)
    user_doc = user_ref.get()

    if not user_doc.exists:
        print("User not found in Firestore:", request.user_id)
        raise HTTPException(status_code=404, detail="User not found")

    user_data = user_doc.to_dict()

    # Ambil tanggungan
    dependents_doc = user_ref.collection("financial_dependents").document("main").get()
    dependents = (
        dependents_doc.to_dict().get("dependents_count", 0)
        if dependents_doc.exists
        else 0
    )

    # Ambil transaksi terakhir
    transactions = (
        user_ref.collection("transactions")
        .order_by("created_at", direction="DESCENDING")
        .limit(5)
        .stream()
    )
    transactions_list = [t.to_dict() for t in transactions]

    # Ambil utang aktif
    loans = user_ref.collection("active_loans").stream()
    loans_list = [l.to_dict() for l in loans]

    # Ambil riwayat kredit
    credit_doc = user_ref.collection("credit_history").document("main").get()
    credit_data = credit_doc.to_dict() if credit_doc.exists else {}

    # Ambil skor risiko terakhir
    risk_scores = (
        user_ref.collection("risk_scores")
        .order_by("last_calculated", direction="DESCENDING")
        .limit(1)
        .stream()
    )
    risk_score_data = next(risk_scores, None)
    risk_score = (
        risk_score_data.to_dict().get("score") if risk_score_data else "Belum dihitung"
    )

    # Bangun ringkasan profil lengkap
    user_profile = f"""
    Profil Pengguna:
    - Nama: {user_data.get('full_name', 'Tidak diketahui')}
    - Pemasukan bulanan: Rp{user_data.get('monthly_income', 0)}
    - Jumlah tanggungan: {dependents}

    Riwayat Transaksi Terakhir:
    {chr(10).join([f"- {t['type']}: Rp{t['amount']} untuk {t.get('category', 'tidak diketahui')}" for t in transactions_list]) or 'Tidak ada transaksi.'}

    Utang Aktif:
    {chr(10).join([f"- {l['loan_type']}: Cicilan Rp{l['monthly_payment']} selama {l['remaining_months']} bulan" for l in loans_list]) or 'Tidak ada utang aktif.'}

    Riwayat Kredit:
    - Total pinjaman sebelumnya: {credit_data.get('total_loans_taken', 'Tidak diketahui')}
    - Jumlah keterlambatan bayar: {credit_data.get('missed_payments', 'Tidak diketahui')}
    - Pernah gagal bayar: {"Ya" if credit_data.get('has_default_history') else "Tidak"}


    """
    # Skor Risiko Terakhir: {risk_score}

    # Instruction Prompt
    system_instruction = (
        "Anda adalah DebtBot, asisten virtual keuangan pribadi. "
        "Hanya jawab pertanyaan tentang keuangan, utang, pengeluaran, dan saran finansial. "
        "Jangan menjawab hal lain di luar topik ini. "
        "Berikan response yang interaktif"
        "Gunakan bahasa yang ramah dan bersahabat dengan gaya senatural mungkin.\n\n"
    )

    prompt = f"{system_instruction}{user_profile}User: {request.message}"
    print("Generated Prompt for AI:\n", prompt)

    try:
        response = model.generate_content(prompt)
        reply_text = response.text
        print("AI Response Text:", reply_text)
        return {"reply": reply_text}
    except Exception as e:
        print("Exception occurred while generating AI response:", str(e))
        return {"error": str(e)}
