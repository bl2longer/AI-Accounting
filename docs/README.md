# AI智能记账应用文档

欢迎使用AI智能记账应用文档。本文档提供了应用的详细说明、安装指南、使用方法和API参考。

## 文档目录

1. [应用概述](./README.md)
2. [系统架构](./architecture.md)
3. [安装与设置](./installation.md)
4. [API文档](./api/README.md)
5. [数据库模型](./database/README.md)
6. [使用指南](./usage/README.md)
7. [报表详解](./usage/reports.md)
8. [OpenRouter.ai集成](./api/openrouter.md)

## 快速入门

### 后端设置

```bash
cd backend
python -m venv venv
source venv/bin/activate  # 在Windows上使用 venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### 前端设置

```bash
cd frontend
npm install
npm run dev
```

## 功能概述

- **多模态数据采集**：支持图片、语音、文字三种输入方式
- **AI智能识别与处理**：自动提取消费信息（商家、金额、日期、项目）
- **基础记账与查询**：生成标准化消费记录，提供历史记录查看功能
- **报表生成**：提供按类别、商家、时间维度的消费报表

## 技术栈

- **前端**：React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Recharts
- **后端**：FastAPI, SQLite, SQLAlchemy
- **AI处理**：OpenRouter.ai API

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。

## 许可证

MIT
