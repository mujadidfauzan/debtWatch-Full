# services/scoring_model.py

import os

import joblib

# Load model sekali saat pertama kali dipanggil
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../model/risk_model.pkl")
model = joblib.load(MODEL_PATH)


def predict_score(features: list) -> float:
    """
    Menerima array fitur dan mengembalikan skor risiko (0.0 - 1.0)
    """
    prob = model.predict_proba([features])[0][
        1
    ]  # ambil probabilitas label 1 (berisiko)
    return round(prob, 4)
