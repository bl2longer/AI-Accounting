# AI智能记账应用 - 前端

这是AI智能记账应用的前端部分，使用React + TypeScript + Vite构建，支持多模态数据输入和报表生成。

## 功能特点

- 多模态数据采集界面（图片、语音、文字）
- AI智能识别结果确认界面
- 消费记录查看界面
- 消费报表生成界面

## 本地运行

1. 安装依赖：
   ```
   npm install
   ```

2. 运行开发服务器：
   ```
   npm run dev
   ```

   前端应用将在 http://localhost:5173 上运行。

## 构建生产版本

```
npm run build
```

构建后的文件将位于 `dist` 目录中。

## 环境变量

在`.env`文件中设置以下环境变量：

- `VITE_API_BASE_URL`：后端API的基础URL

## 技术栈

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Recharts
- Axios

