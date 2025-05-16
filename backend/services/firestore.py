import json
import os
from dotenv import load_dotenv
import firebase_admin # Import firebase_admin
from firebase_admin import credentials, firestore, initialize_app

# load_dotenv() is generally safe to call.
# If .env is not found (e.g., in production), it does nothing.
load_dotenv()

firebase_env_var = os.environ.get("FIREBASE_CREDENTIALS")

if not firebase_env_var:
    raise RuntimeError(
        "FIREBASE_CREDENTIALS environment variable not set. "
        "This should be the JSON content of your service account key or a path to the JSON file."
    )

cred_dict = None
# For error reporting, store a snippet of what was processed.
# Initialize with a safe default or the start of the env var.
processed_source_snippet = firebase_env_var[:100] + "..." if len(firebase_env_var) > 100 else firebase_env_var

try:
    # Attempt to parse the environment variable as JSON directly
    cred_dict = json.loads(firebase_env_var)
    # If successful, FIREBASE_CREDENTIALS contained the JSON content.
    # processed_source_snippet is already set correctly.
except json.JSONDecodeError:
    # If parsing fails, assume it's a file path (for local dev or specific setups)
    firebase_credentials_path = firebase_env_var
    processed_source_snippet = f"path: {firebase_credentials_path}" # Update snippet for path case
    try:
        with open(firebase_credentials_path, 'r', encoding='utf-8') as f:
            credentials_content_from_file = f.read()
            # Update snippet for file content if read successfully
            processed_source_snippet = credentials_content_from_file[:100] + "..." if len(credentials_content_from_file) > 100 else credentials_content_from_file
            cred_dict = json.loads(credentials_content_from_file)
    except FileNotFoundError:
        raise RuntimeError(
            f"Firebase credentials file not found at path: {firebase_credentials_path}. "
            "Ensure FIREBASE_CREDENTIALS is set to the correct file path in your .env (for local) "
            "or that the file exists at this path in your deployment environment if not providing direct JSON."
        )
    except json.JSONDecodeError as e_file:
        raise RuntimeError(
            f"Error decoding JSON from Firebase credentials file '{firebase_credentials_path}'. "
            f"Content snippet: '{processed_source_snippet}'. Error: {e_file}"
        )
    except Exception as e_file_other: # Catch other file-related errors
        raise RuntimeError(
            f"Error reading or parsing Firebase credentials file '{firebase_credentials_path}': {e_file_other}"
        )
except Exception as e_main:
    # This catches errors from the initial json.loads(firebase_env_var) or unexpected issues.
    raise RuntimeError(
        f"An unexpected error occurred processing FIREBASE_CREDENTIALS. "
        f"Processed source snippet: '{processed_source_snippet}'. Error: {e_main}"
    )

if cred_dict is None:
    # This case should ideally not be reached if the logic above is correct and firebase_env_var is set.
    raise RuntimeError(
        "Failed to load Firebase credentials. "
        "FIREBASE_CREDENTIALS was set but could not be interpreted as JSON content or a valid file path. "
        f"Processed source snippet: '{processed_source_snippet}'"
    )

cred = credentials.Certificate(cred_dict)

# Initialize Firebase app only if it hasn't been initialized yet.
if not firebase_admin._apps:
    default_app = initialize_app(cred)
else:
    default_app = firebase_admin.get_app() # Get the already initialized app

# Initialize Firestore client with the specific app
db = firestore.client(app=default_app)
