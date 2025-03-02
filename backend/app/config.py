import os

# OpenRouter.ai API key
OPENROUTER_API_KEY = "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"

# Upload directory for files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
