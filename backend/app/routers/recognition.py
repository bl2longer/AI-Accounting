from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
import os
import base64
from datetime import datetime

from .. import schemas
from ..database import get_db
from ..services.openrouter_client import OpenRouterClient
from ..config import OPENROUTER_API_KEY, UPLOAD_DIR

router = APIRouter()

# Initialize OpenRouter client
openrouter_client = OpenRouterClient(OPENROUTER_API_KEY)

@router.post("/process", response_model=schemas.RecognitionResult)
async def process_input(
    input_type: str = Form(...),  # 'image', 'voice', 'text'
    file: Optional[UploadFile] = File(None),
    text_content: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Process input data (image, voice, or text) and extract expense information
    using OpenRouter.ai API
    """
    
    try:
        # Validate input
        if input_type not in ["image", "voice", "text"]:
            raise HTTPException(status_code=400, detail="Invalid input type. Must be 'image', 'voice', or 'text'")
        
        if input_type in ["image", "voice"] and not file:
            raise HTTPException(status_code=400, detail=f"File is required for {input_type} input type")
        
        if input_type == "text" and not text_content:
            raise HTTPException(status_code=400, detail="Text content is required for text input type")
        
        # Store file if provided
        file_path = None
        if file:
            # Create unique filename
            timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
            file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
            filename = f"{timestamp}_{input_type}{file_extension}"
            file_path = os.path.join(UPLOAD_DIR, filename)
            
            # Save file
            with open(file_path, "wb") as f:
                content = await file.read()
                f.write(content)
        
        # Process input using OpenRouter.ai API
        result = None
        
        # In development mode, use mock data to avoid API costs
        # In production, uncomment the OpenRouter API calls
        if input_type == "image":
            # Uncomment in production
            # result = openrouter_client.process_image(file_path)
            
            # Mock data for development
            result = {
                "merchant": "全家便利店",
                "date": "2025/3/2",
                "total": 36.50,
                "items": [
                    {"name": "三明治", "amount": 15.0, "needConfirm": False},
                    {"name": "牛奶", "amount": 8.5, "needConfirm": False},
                    {"name": "香蕉", "amount": 13.0, "needConfirm": True}
                ]
            }
        elif input_type == "voice":
            # Uncomment in production
            # result = openrouter_client.process_voice(file_path)
            
            # Mock data for development
            result = {
                "merchant": "星巴克",
                "date": "2025/3/2",
                "total": 32.0,
                "items": [
                    {"name": "拿铁咖啡", "amount": 32.0, "needConfirm": False}
                ]
            }
        else:  # text
            # Uncomment in production
            # result = openrouter_client.process_text(text_content)
            
            # Mock data for development
            result = {
                "merchant": "公交车",
                "date": "2025/3/2",
                "total": 4.0,
                "items": [
                    {"name": "车票", "amount": 4.0, "needConfirm": False}
                ]
            }
        
        return result
    
    except Exception as e:
        # Log the error
        print(f"Error processing input: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing input: {str(e)}")

@router.get("/test", response_model=Dict[str, Any])
def test_openrouter():
    """
    Test endpoint for OpenRouter.ai API
    """
    return {
        "status": "ok",
        "message": "OpenRouter.ai API client is configured",
        "api_key_configured": bool(OPENROUTER_API_KEY)
    }
