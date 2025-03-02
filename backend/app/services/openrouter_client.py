import requests
import json
import base64
import os
from typing import Optional, Dict, Any, List

class OpenRouterClient:
    """Client for interacting with OpenRouter.ai API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def process_image(self, image_path: str) -> Dict[str, Any]:
        """
        Process an image using OpenRouter.ai API
        
        Args:
            image_path: Path to the image file
            
        Returns:
            Dict containing the extracted information from the receipt
        """
        # Read image file and encode as base64
        with open(image_path, "rb") as image_file:
            image_data = base64.b64encode(image_file.read()).decode("utf-8")
        
        # Prepare the request payload
        payload = {
            "model": "anthropic/claude-3-opus-20240229",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "This is a receipt or invoice image. Please extract the following information:\n"
                                   "1. Merchant/store name\n"
                                   "2. Date of purchase\n"
                                   "3. Total amount\n"
                                   "4. List of items with their individual prices\n\n"
                                   "Format your response as a JSON object with the following structure:\n"
                                   "{\n"
                                   "  \"merchant\": \"Store Name\",\n"
                                   "  \"date\": \"YYYY/MM/DD\",\n"
                                   "  \"total\": 123.45,\n"
                                   "  \"items\": [\n"
                                   "    {\"name\": \"Item 1\", \"amount\": 10.00, \"needConfirm\": false},\n"
                                   "    {\"name\": \"Item 2\", \"amount\": 20.00, \"needConfirm\": true}\n"
                                   "  ]\n"
                                   "}\n\n"
                                   "Mark items with \"needConfirm\": true if you're uncertain about the item name or price."
                        },
                        {
                            "type": "image",
                            "image": image_data
                        }
                    ]
                }
            ]
        }
        
        # Make the API request
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=self.headers,
            json=payload
        )
        
        # Process the response
        if response.status_code == 200:
            response_data = response.json()
            # Extract the JSON from the response text
            try:
                content = response_data["choices"][0]["message"]["content"]
                # Find JSON in the response
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = content[json_start:json_end]
                    return json.loads(json_str)
                else:
                    # If no JSON found, try to parse the entire content
                    return json.loads(content)
            except (KeyError, json.JSONDecodeError) as e:
                raise Exception(f"Failed to parse OpenRouter response: {str(e)}")
        else:
            raise Exception(f"OpenRouter API request failed with status {response.status_code}: {response.text}")
    
    def process_voice(self, audio_path: str) -> Dict[str, Any]:
        """
        Process a voice recording using OpenRouter.ai API
        
        Args:
            audio_path: Path to the audio file
            
        Returns:
            Dict containing the extracted information from the voice recording
        """
        # Read audio file and encode as base64
        with open(audio_path, "rb") as audio_file:
            audio_data = base64.b64encode(audio_file.read()).decode("utf-8")
        
        # Prepare the request payload
        payload = {
            "model": "anthropic/claude-3-opus-20240229",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "This is a voice recording about an expense. Please extract the following information:\n"
                                   "1. Merchant/store name\n"
                                   "2. Date of purchase\n"
                                   "3. Total amount\n"
                                   "4. List of items with their individual prices\n\n"
                                   "Format your response as a JSON object with the following structure:\n"
                                   "{\n"
                                   "  \"merchant\": \"Store Name\",\n"
                                   "  \"date\": \"YYYY/MM/DD\",\n"
                                   "  \"total\": 123.45,\n"
                                   "  \"items\": [\n"
                                   "    {\"name\": \"Item 1\", \"amount\": 10.00, \"needConfirm\": false},\n"
                                   "    {\"name\": \"Item 2\", \"amount\": 20.00, \"needConfirm\": true}\n"
                                   "  ]\n"
                                   "}\n\n"
                                   "Mark items with \"needConfirm\": true if you're uncertain about the item name or price."
                        },
                        {
                            "type": "audio",
                            "audio": audio_data
                        }
                    ]
                }
            ]
        }
        
        # Make the API request
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=self.headers,
            json=payload
        )
        
        # Process the response
        if response.status_code == 200:
            response_data = response.json()
            # Extract the JSON from the response text
            try:
                content = response_data["choices"][0]["message"]["content"]
                # Find JSON in the response
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = content[json_start:json_end]
                    return json.loads(json_str)
                else:
                    # If no JSON found, try to parse the entire content
                    return json.loads(content)
            except (KeyError, json.JSONDecodeError) as e:
                raise Exception(f"Failed to parse OpenRouter response: {str(e)}")
        else:
            raise Exception(f"OpenRouter API request failed with status {response.status_code}: {response.text}")
    
    def process_text(self, text: str) -> Dict[str, Any]:
        """
        Process text input using OpenRouter.ai API
        
        Args:
            text: Text description of the expense
            
        Returns:
            Dict containing the extracted information from the text
        """
        # Prepare the request payload
        payload = {
            "model": "anthropic/claude-3-opus-20240229",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": f"This is a text description of an expense. Please extract the following information:\n"
                                   f"1. Merchant/store name\n"
                                   f"2. Date of purchase\n"
                                   f"3. Total amount\n"
                                   f"4. List of items with their individual prices\n\n"
                                   f"Here is the text description:\n\n{text}\n\n"
                                   f"Format your response as a JSON object with the following structure:\n"
                                   f"{{\n"
                                   f"  \"merchant\": \"Store Name\",\n"
                                   f"  \"date\": \"YYYY/MM/DD\",\n"
                                   f"  \"total\": 123.45,\n"
                                   f"  \"items\": [\n"
                                   f"    {{\"name\": \"Item 1\", \"amount\": 10.00, \"needConfirm\": false}},\n"
                                   f"    {{\"name\": \"Item 2\", \"amount\": 20.00, \"needConfirm\": true}}\n"
                                   f"  ]\n"
                                   f"}}\n\n"
                                   f"Mark items with \"needConfirm\": true if you're uncertain about the item name or price."
                        }
                    ]
                }
            ]
        }
        
        # Make the API request
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=self.headers,
            json=payload
        )
        
        # Process the response
        if response.status_code == 200:
            response_data = response.json()
            # Extract the JSON from the response text
            try:
                content = response_data["choices"][0]["message"]["content"]
                # Find JSON in the response
                json_start = content.find("{")
                json_end = content.rfind("}") + 1
                if json_start >= 0 and json_end > json_start:
                    json_str = content[json_start:json_end]
                    return json.loads(json_str)
                else:
                    # If no JSON found, try to parse the entire content
                    return json.loads(content)
            except (KeyError, json.JSONDecodeError) as e:
                raise Exception(f"Failed to parse OpenRouter response: {str(e)}")
        else:
            raise Exception(f"OpenRouter API request failed with status {response.status_code}: {response.text}")
