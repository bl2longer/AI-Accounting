import os

# OpenRouter.ai API key
OPENROUTER_API_KEY = ""

# Upload directory for files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
