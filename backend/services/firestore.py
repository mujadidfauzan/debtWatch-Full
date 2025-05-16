import json
import os
from dotenv import load_dotenv

from firebase_admin import credentials, firestore, initialize_app

load_dotenv()

# Ambil path ke file kredensial dari ENV
firebase_credentials_path = os.environ.get("FIREBASE_CREDENTIALS")
if not firebase_credentials_path:
    raise RuntimeError("FIREBASE_CREDENTIALS environment variable (path to JSON file) not set")

try:
    with open(firebase_credentials_path, 'r', encoding='utf-8') as f: # Added encoding
        credentials_content = f.read()
except FileNotFoundError:
    raise RuntimeError(f"Firebase credentials file not found at path: {firebase_credentials_path}")
except Exception as e:
    raise RuntimeError(f"Error reading Firebase credentials file '{firebase_credentials_path}': {e}")

try:
    cred_dict = json.loads(credentials_content)
except json.JSONDecodeError as e:
    # It's helpful to print a snippet of the content that failed to parse, but be careful with sensitive data.
    # For now, just raise the error with context.
    error_snippet = credentials_content[:100] # Get first 100 chars
    raise RuntimeError(f"Error decoding JSON from Firebase credentials file '{firebase_credentials_path}'. Content starts with: '{error_snippet}'. Error: {e}")


cred = credentials.Certificate(cred_dict)

# Inisialisasi Firebase hanya jika belum
default_app = initialize_app(cred)

# Inisialisasi Firestore
db = firestore.client()
