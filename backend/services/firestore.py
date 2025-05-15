import json
import os

from firebase_admin import credentials, initialize_app

# Ambil isi JSON langsung dari environment variable
firebase_cred_json = os.environ.get("FIREBASE_CREDENTIALS")

if not firebase_cred_json:
    raise RuntimeError("FIREBASE_CREDENTIALS environment variable not set.")

# Convert string JSON ke dict
cred_dict = json.loads(firebase_cred_json)
cred = credentials.Certificate(cred_dict)

# Inisialisasi Firebase
initialize_app(cred)
