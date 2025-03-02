# 应用架构文档

## 系统架构概述

AI智能记账应用采用前后端分离的架构设计，前端使用React构建用户界面，后端使用FastAPI提供RESTful API服务，数据存储使用SQLite数据库。

## 架构图

```
+-------------------+        +-------------------+        +-------------------+
|                   |        |                   |        |                   |
|  前端应用         |        |  后端API服务      |        |  OpenRouter.ai    |
|  (React + Vite)   | <----> |  (FastAPI)        | <----> |  API              |
|                   |        |                   |        |                   |
+-------------------+        +-------------------+        +-------------------+
                                     |
                                     |
                                     v
                             +-------------------+
                             |                   |
                             |  SQLite数据库     |
                             |                   |
                             +-------------------+
```

## 前端架构

前端应用使用React + TypeScript + Vite构建，采用组件化设计，主要包括以下模块：

### 核心组件

1. **App.tsx**：应用入口，负责路由和状态管理
2. **主界面（Home）**：显示最近记录和添加新记录入口
3. **数据输入（Input）**：处理多模态数据输入
4. **确认界面（Confirm）**：显示AI识别结果并请求用户确认
5. **记录查看（Records）**：查看和管理历史消费记录
6. **报表界面（Report）**：生成和查看消费报表

### 服务层

1. **api.ts**：封装与后端API的通信
   - expenseApi：消费记录相关API
   - recognitionApi：识别相关API

### 状态管理

前端使用React的useState和useEffect钩子进行状态管理，主要状态包括：

1. **视图状态**：控制当前显示的界面
2. **输入状态**：存储用户输入的数据
3. **识别结果**：存储AI识别的结果
4. **消费记录**：存储从后端获取的消费记录
5. **报表数据**：存储从后端获取的报表数据

## 后端架构

后端应用使用FastAPI构建，采用分层设计，主要包括以下模块：

### API路由层

1. **recognition.py**：处理多模态数据识别请求
   - POST /process：处理输入数据
   - GET /test：测试OpenRouter.ai API连接

2. **expenses.py**：处理消费记录相关请求
   - GET /：获取消费记录列表
   - POST /：创建新的消费记录
   - GET /{id}：获取特定消费记录
   - PUT /{id}：更新消费记录
   - DELETE /{id}：删除消费记录
   - GET /summary/report：获取消费报表
   - GET /categories/list：获取分类列表
   - GET /merchants/list：获取商家列表

### 服务层

1. **openrouter_client.py**：封装与OpenRouter.ai API的交互
   - process_image：处理图片
   - process_voice：处理语音
   - process_text：处理文本

### 数据访问层

1. **database.py**：数据库连接和会话管理
2. **models.py**：数据库模型定义
   - Expense：消费记录模型
   - ExpenseItem：消费项目模型

### 模型层

1. **schemas.py**：数据验证模式
   - ExpenseBase：消费记录基础模式
   - ExpenseCreate：创建消费记录模式
   - Expense：消费记录响应模式
   - ExpenseItem：消费项目模式
   - RecognitionResult：识别结果模式
   - RecognitionRequest：识别请求模式
   - ExpenseSummary：消费报表模式

## 数据流

### 添加消费记录流程

1. 用户在前端选择输入方式（图片、语音、文字）
2. 前端调用recognitionApi.processInput发送数据到后端
3. 后端路由/recognition/process接收请求
4. 后端使用OpenRouterClient处理数据
5. OpenRouterClient调用OpenRouter.ai API进行识别
6. 后端返回识别结果给前端
7. 前端显示识别结果并请求用户确认
8. 用户确认后，前端调用expenseApi.createExpense创建消费记录
9. 后端路由/expenses接收请求
10. 后端将数据保存到SQLite数据库
11. 后端返回创建成功的消费记录给前端
12. 前端更新界面显示最新记录

### 查看报表流程

1. 用户在前端选择报表时间范围（周、月、年）
2. 前端调用expenseApi.getExpenseSummary发送请求到后端
3. 后端路由/expenses/summary/report接收请求
4. 后端从SQLite数据库查询数据
5. 后端按分类、商家、日期聚合数据
6. 后端返回报表数据给前端
7. 前端使用Recharts库渲染图表
8. 前端显示报表界面

## 技术栈

### 前端技术栈

- React：用户界面库
- TypeScript：类型安全的JavaScript超集
- Vite：构建工具
- Tailwind CSS：CSS框架
- shadcn/ui：UI组件库
- Recharts：图表库
- Axios：HTTP客户端

### 后端技术栈

- FastAPI：Web框架
- SQLAlchemy：ORM库
- Pydantic：数据验证
- Uvicorn：ASGI服务器
- SQLite：关系型数据库
- Python-multipart：处理文件上传
- Requests：HTTP客户端

## 部署架构

### 本地开发环境

- 前端：http://localhost:5173
- 后端：http://localhost:8000

### 生产环境

前端和后端可以部署到不同的服务上：

1. 前端：静态网站托管服务（Vercel、Netlify、GitHub Pages等）
2. 后端：支持Python的服务器（Heroku、Render、Vercel等）

## 扩展性考虑

1. **数据库扩展**：可以从SQLite迁移到PostgreSQL或MySQL等更强大的数据库
2. **认证系统**：可以添加用户认证和授权系统
3. **云端同步**：可以添加云端数据同步功能
4. **多语言支持**：可以添加国际化支持
5. **移动应用**：可以使用React Native开发移动应用
