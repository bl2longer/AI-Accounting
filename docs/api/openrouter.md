# OpenRouter.ai集成文档

## 概述

AI智能记账应用使用OpenRouter.ai API进行多模态数据处理，包括图片OCR识别、语音转文字和文本理解。OpenRouter.ai提供了访问多种AI模型的统一接口，应用选择合适的模型处理不同类型的输入数据。

## 配置

OpenRouter.ai API密钥配置在`app/config.py`文件中：

```python
# OpenRouter.ai API key
OPENROUTER_API_KEY = "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"
```

## OpenRouterClient类

应用使用`OpenRouterClient`类封装与OpenRouter.ai API的交互，该类位于`app/services/openrouter_client.py`文件中。

### 主要方法

#### 1. 处理图片

```python
def process_image(self, image_path: str) -> Dict[str, Any]:
    """
    Process an image file to extract expense information.
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Dict containing extracted expense information
    """
```

该方法将图片文件转换为Base64编码，发送到OpenRouter.ai API进行OCR识别和信息提取，返回结构化的消费信息。

#### 2. 处理语音

```python
def process_voice(self, voice_path: str) -> Dict[str, Any]:
    """
    Process a voice recording to extract expense information.
    
    Args:
        voice_path: Path to the voice file
        
    Returns:
        Dict containing extracted expense information
    """
```

该方法将语音文件转换为Base64编码，发送到OpenRouter.ai API进行语音转文字和信息提取，返回结构化的消费信息。

#### 3. 处理文本

```python
def process_text(self, text_content: str) -> Dict[str, Any]:
    """
    Process text content to extract expense information.
    
    Args:
        text_content: Text description of the expense
        
    Returns:
        Dict containing extracted expense information
    """
```

该方法将文本内容发送到OpenRouter.ai API进行信息提取，返回结构化的消费信息。

## 请求格式

### 图片处理请求

```json
{
  "model": "anthropic/claude-3-opus-20240229",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image",
          "image": "base64_encoded_image"
        },
        {
          "type": "text",
          "text": "这是一张收据或发票的照片。请提取以下信息：商家名称、日期、总金额和所有消费项目（名称和金额）。将结果以JSON格式返回，格式为：{\"merchant\": \"商家名称\", \"date\": \"YYYY-MM-DD\", \"total\": 金额, \"items\": [{\"name\": \"项目名称\", \"amount\": 金额}]}。如果某些信息不确定，请在相应项目中添加\"needed_confirmation\": true。"
        }
      ]
    }
  ]
}
```

### 语音处理请求

```json
{
  "model": "anthropic/claude-3-opus-20240229",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "这是一段关于消费记录的语音描述。请提取以下信息：商家名称、日期、总金额和所有消费项目（名称和金额）。将结果以JSON格式返回，格式为：{\"merchant\": \"商家名称\", \"date\": \"YYYY-MM-DD\", \"total\": 金额, \"items\": [{\"name\": \"项目名称\", \"amount\": 金额}]}。如果某些信息不确定，请在相应项目中添加\"needed_confirmation\": true。"
        },
        {
          "type": "audio",
          "audio": "base64_encoded_audio"
        }
      ]
    }
  ]
}
```

### 文本处理请求

```json
{
  "model": "anthropic/claude-3-opus-20240229",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "请从以下文本中提取消费信息：商家名称、日期、总金额和所有消费项目（名称和金额）。将结果以JSON格式返回，格式为：{\"merchant\": \"商家名称\", \"date\": \"YYYY-MM-DD\", \"total\": 金额, \"items\": [{\"name\": \"项目名称\", \"amount\": 金额}]}。如果某些信息不确定，请在相应项目中添加\"needed_confirmation\": true。\n\n" + text_content
        }
      ]
    }
  ]
}
```

## 响应格式

OpenRouter.ai API返回的响应格式如下：

```json
{
  "merchant": "全家便利店",
  "date": "2025-03-02",
  "total": 36.50,
  "items": [
    {
      "name": "三明治",
      "amount": 15.00
    },
    {
      "name": "牛奶",
      "amount": 8.50
    },
    {
      "name": "香蕉",
      "amount": 13.00,
      "needed_confirmation": true
    }
  ]
}
```

## 错误处理

`OpenRouterClient`类包含错误处理逻辑，处理API请求失败、响应解析错误等异常情况。

## 模型选择

应用默认使用`anthropic/claude-3-opus-20240229`模型，该模型支持多模态输入并具有较强的信息提取能力。
