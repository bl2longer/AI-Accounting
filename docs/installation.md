# 安装与设置指南

## 环境要求

### 后端环境要求

- Python 3.8+
- pip 20.0+
- 操作系统：Windows、macOS或Linux

### 前端环境要求

- Node.js 14+
- npm 6+ 或 yarn 1.22+
- 操作系统：Windows、macOS或Linux

## 后端设置

### 步骤1：克隆仓库

```bash
git clone https://github.com/your-username/AI-Accounting.git
cd AI-Accounting
```

### 步骤2：设置Python虚拟环境

```bash
cd backend
python -m venv venv
```

在Windows上激活虚拟环境：

```bash
venv\Scripts\activate
```

在macOS/Linux上激活虚拟环境：

```bash
source venv/bin/activate
```

### 步骤3：安装依赖

```bash
pip install -r requirements.txt
```

### 步骤4：配置OpenRouter.ai API密钥

编辑`app/config.py`文件，设置您的OpenRouter.ai API密钥：

```python
# OpenRouter.ai API key
OPENROUTER_API_KEY = "your-api-key-here"
```

### 步骤5：运行后端服务器

```bash
python run.py
```

后端服务器将在http://localhost:8000上运行。您可以在http://localhost:8000/docs访问API文档。

## 前端设置

### 步骤1：进入前端目录

```bash
cd frontend
```

### 步骤2：安装依赖

使用npm：

```bash
npm install
```

或使用yarn：

```bash
yarn install
```

### 步骤3：配置API基础URL

创建`.env.local`文件，设置API基础URL：

```
VITE_API_BASE_URL=http://localhost:8000/api
```

### 步骤4：运行开发服务器

使用npm：

```bash
npm run dev
```

或使用yarn：

```bash
yarn dev
```

前端应用将在http://localhost:5173上运行。

## 生产环境部署

### 后端部署

1. 确保`requirements.txt`包含所有依赖项
2. 配置环境变量（API密钥等）
3. 设置数据库连接（如需要）
4. 使用Gunicorn或Uvicorn部署FastAPI应用

示例Procfile（用于Heroku等平台）：

```
web: uvicorn app.main:app --host=0.0.0.0 --port=$PORT
```

### 前端部署

1. 构建生产版本：

   使用npm：
   ```bash
   npm run build
   ```

   或使用yarn：
   ```bash
   yarn build
   ```

2. 部署`dist`目录中的文件到静态网站托管服务

3. 确保更新API基础URL以指向已部署的后端

## 常见问题

### 后端问题

1. **数据库初始化失败**

   确保应用有权限创建和写入SQLite数据库文件。

2. **OpenRouter.ai API连接失败**

   检查API密钥是否正确，网络连接是否正常。

3. **文件上传失败**

   确保`uploads`目录存在且有写入权限。

### 前端问题

1. **API连接失败**

   检查API基础URL是否正确，后端服务器是否运行。

2. **构建失败**

   检查依赖项是否安装完整，Node.js版本是否兼容。

3. **图表不显示**

   确保报表数据格式正确，Recharts库正确安装。

## 更新应用

### 更新后端

1. 拉取最新代码
2. 激活虚拟环境
3. 安装新依赖：`pip install -r requirements.txt`
4. 重启后端服务器

### 更新前端

1. 拉取最新代码
2. 安装新依赖：`npm install`或`yarn install`
3. 重新构建应用：`npm run build`或`yarn build`
4. 部署新的构建文件
