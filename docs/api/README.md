# API文档

## 目录

1. [概述](#概述)
2. [认证](#认证)
3. [基础URL](#基础URL)
4. [识别API](#识别API)
5. [消费记录API](#消费记录API)
6. [报表API](#报表API)
7. [OpenRouter.ai集成](./openrouter.md)

## 概述

AI智能记账应用的后端API使用FastAPI构建，提供RESTful接口用于多模态数据处理、消费记录管理和报表生成。

## 认证

当前版本的API不需要认证。在生产环境中，建议实现适当的认证机制。

## 基础URL

本地开发环境：`http://localhost:8000/api`

## 识别API

### 处理多模态输入数据

**请求**

```
POST /recognition/process
```

**参数**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| input_type | string | 输入类型，可选值：'image', 'voice', 'text' |
| file | file | 图片或语音文件（当input_type为'image'或'voice'时） |
| text_content | string | 文本内容（当input_type为'text'时） |

**响应**

```json
{
  "merchant": "全家便利店",
  "date": "2025-03-02",
  "total": 36.50,
  "items": [
    {
      "name": "三明治",
      "amount": 15.00,
      "needed_confirmation": false
    },
    {
      "name": "牛奶",
      "amount": 8.50,
      "needed_confirmation": false
    },
    {
      "name": "香蕉",
      "amount": 13.00,
      "needed_confirmation": true
    }
  ]
}
```

## 消费记录API

### 获取消费记录列表

**请求**

```
GET /expenses
```

**查询参数**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| skip | integer | 跳过的记录数（分页） |
| limit | integer | 返回的记录数（分页） |
| merchant | string | 按商家筛选 |
| category | string | 按分类筛选 |
| start_date | string | 开始日期（YYYY-MM-DD） |
| end_date | string | 结束日期（YYYY-MM-DD） |

## 报表API

### 获取消费报表

**请求**

```
GET /expenses/summary/report
```

**查询参数**

| 参数名 | 类型 | 描述 |
|--------|------|------|
| start_date | string | 开始日期（YYYY-MM-DD） |
| end_date | string | 结束日期（YYYY-MM-DD） |
