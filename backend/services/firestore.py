import json
import os

from firebase_admin import credentials, firestore, initialize_app

# Ambil kredensial dari ENV
firebase_json = os.environ.get("FIREBASE_CREDENTIALS")
if not firebase_json:
    raise RuntimeError("FIREBASE_CREDENTIALS not set")

cred_dict = json.loads(firebase_json)
cred = credentials.Certificate(cred_dict)

# Inisialisasi Firebase hanya jika belum
default_app = initialize_app(cred)

# Inisialisasi Firestore
db = firestore.client()
