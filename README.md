# AI智能记账应用

这是一个使用AI技术进行智能记账的应用程序，支持多模态数据输入（图片、语音、文字），使用OpenRouter.ai API进行数据处理，并使用SQLite数据库进行本地存储。

## 功能特点

- **多模态数据采集**：支持图片、文字、语音等多种输入方式
- **AI智能识别与处理**：自动提取消费信息（商家、金额、日期、项目）
- **基础记账与查询**：生成标准化消费记录，提供历史记录查看功能
- **报表生成**：提供消费报表，包括分类支出、商家支出和支出趋势

## 项目结构

```
ai-accounting-app/
├── backend/                # 后端应用
│   ├── app/                # 主应用代码
│   │   ├── routers/        # API路由
│   │   ├── services/       # 服务层
│   │   ├── config.py       # 配置文件
│   │   ├── database.py     # 数据库配置
│   │   ├── main.py         # 主应用入口
│   │   ├── models.py       # 数据库模型
│   │   └── schemas.py      # 数据验证模式
│   ├── uploads/            # 上传文件存储目录
│   ├── requirements.txt    # 依赖项
│   └── run.py              # 运行脚本
└── frontend/               # 前端应用
    ├── public/             # 静态资源
    ├── src/                # 源代码
    │   ├── components/     # 组件
    │   ├── services/       # API服务
    │   ├── hooks/          # 自定义钩子
    │   └── App.tsx         # 主应用组件
    ├── index.html          # HTML模板
    └── package.json        # 依赖项
```

## 技术栈

- **前端**：React, Vite, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **后端**：FastAPI, SQLite, SQLAlchemy
- **AI处理**：OpenRouter.ai API

## 本地运行

### 后端

1. 进入后端目录：
   ```
   cd backend
   ```

2. 创建虚拟环境并激活：
   ```
   python -m venv venv
   source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
   ```

3. 安装依赖：
   ```
   pip install -r requirements.txt
   ```

4. 运行后端服务器：
   ```
   python run.py
   ```

   后端服务器将在 http://localhost:8000 上运行。

### 前端

1. 进入前端目录：
   ```
   cd frontend
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 运行开发服务器：
   ```
   npm run dev
   ```

   前端应用将在 http://localhost:5173 上运行。

## API文档

启动后端服务器后，可以在 http://localhost:8000/docs 访问API文档。

### 主要API端点

#### 识别API

- `POST /api/recognition/process`：处理多模态输入数据
- `GET /api/recognition/test`：测试OpenRouter.ai API连接

#### 消费记录API

- `GET /api/expenses`：获取消费记录列表
- `POST /api/expenses`：创建新的消费记录
- `GET /api/expenses/{id}`：获取特定消费记录
- `PUT /api/expenses/{id}`：更新消费记录
- `DELETE /api/expenses/{id}`：删除消费记录
- `GET /api/expenses/summary/report`：获取消费报表
- `GET /api/expenses/categories/list`：获取分类列表
- `GET /api/expenses/merchants/list`：获取商家列表

## 使用OpenRouter.ai API

本应用使用OpenRouter.ai API进行多模态数据处理。您需要在`backend/app/config.py`文件中设置您的API密钥。

```python
# OpenRouter.ai API key
OPENROUTER_API_KEY = "your-api-key-here"
```

## 数据库

所有数据使用SQLite在本地存储，数据库文件位于`backend/accounting.db`。

## 部署

### 后端部署

后端可以部署到支持Python的服务器上，如Heroku、Render或Vercel。

1. 确保`requirements.txt`包含所有依赖项
2. 配置环境变量（API密钥等）
3. 设置数据库连接（如需要）
4. 部署应用

### 前端部署

前端可以部署到静态网站托管服务上，如Vercel、Netlify或GitHub Pages。

1. 构建生产版本：
   ```
   npm run build
   ```

2. 部署`dist`目录中的文件
3. 确保更新API基础URL以指向已部署的后端

## 贡献

欢迎贡献代码、报告问题或提出改进建议。

## 许可证

MIT
