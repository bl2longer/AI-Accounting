# AI智能记账应用 - 后端

这是AI智能记账应用的后端部分，使用FastAPI构建，支持多模态数据处理和SQLite数据存储。

## 功能特点

- 多模态数据处理API（图片、语音、文字）
- 使用OpenRouter.ai API进行AI智能识别
- SQLite数据库存储消费记录
- 报表生成API

## 本地运行

1. 创建虚拟环境并激活：
   ```
   python -m venv venv
   source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
   ```

2. 安装依赖：
   ```
   # 首先升级pip以避免段错误(segmentation fault)
   python -m pip install --upgrade pip setuptools wheel
   # 然后安装依赖
   pip install -r requirements.txt
   ```
   
   注意：如果使用Python 3.12版本，可能会遇到段错误(segmentation fault)。这是由于pip版本与Python 3.12的兼容性问题导致的。升级pip到最新版本可以解决此问题。如果问题仍然存在，可以尝试使用Python 3.11或更早的版本。

3. 运行后端服务器：
   ```
   python run.py
   ```

   后端服务器将在 http://localhost:8000 上运行。

## API文档

启动服务器后，可以在 http://localhost:8000/docs 访问API文档。

## 环境变量

在`app/config.py`文件中设置以下环境变量：

- `OPENROUTER_API_KEY`：OpenRouter.ai API密钥
- `UPLOAD_DIR`：上传文件存储目录

## 数据库

应用使用SQLite数据库，数据库文件位于项目根目录下的`sql_app.db`。

