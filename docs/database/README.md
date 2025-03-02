# 数据库模型文档

## 概述

AI智能记账应用使用SQLite作为本地数据库，通过SQLAlchemy ORM进行数据库操作。数据库模型主要包括消费记录（Expense）和消费项目（ExpenseItem）两个主要实体。

## 数据库模型

### Expense（消费记录）

消费记录表存储用户的消费信息，包括商家、日期、金额等基本信息。

**表结构**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | Integer | 主键 |
| merchant | String | 商家名称 |
| date | DateTime | 消费日期 |
| total_amount | Float | 消费总金额 |
| created_at | DateTime | 记录创建时间 |
| category | String | 消费分类 |
| notes | Text | 备注信息 |
| input_type | String | 输入类型（'image', 'voice', 'text'） |
| input_data_path | String | 输入数据文件路径 |
| is_confirmed | Boolean | 是否已确认 |

**代码定义**

```python
class Expense(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    merchant = Column(String, index=True)
    date = Column(DateTime, index=True, default=func.now())
    total_amount = Column(Float)
    created_at = Column(DateTime, default=func.now())
    
    # Category for reporting
    category = Column(String, index=True, nullable=True)
    
    # Notes or additional information
    notes = Column(Text, nullable=True)
    
    # Relationship with ExpenseItem
    items = relationship("ExpenseItem", back_populates="expense", cascade="all, delete-orphan")
    
    # Original input data (for reference)
    input_type = Column(String)  # 'image', 'voice', 'text'
    input_data_path = Column(String, nullable=True)  # Path to stored input file if any
    
    # Processing status
    is_confirmed = Column(Boolean, default=False)  # Whether the expense has been confirmed by the user
```

### ExpenseItem（消费项目）

消费项目表存储消费记录中的具体项目信息，如商品名称、金额等。

**表结构**

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | Integer | 主键 |
| expense_id | Integer | 外键，关联消费记录 |
| name | String | 项目名称 |
| amount | Float | 项目金额 |
| needed_confirmation | Boolean | 是否需要确认 |

**代码定义**

```python
class ExpenseItem(Base):
    __tablename__ = "expense_items"

    id = Column(Integer, primary_key=True, index=True)
    expense_id = Column(Integer, ForeignKey("expenses.id"))
    name = Column(String)
    amount = Column(Float)
    
    # Whether this item needed confirmation
    needed_confirmation = Column(Boolean, default=False)
    
    # Relationship with Expense
    expense = relationship("Expense", back_populates="items")
```

## 数据库关系

Expense和ExpenseItem之间是一对多关系，一个消费记录可以包含多个消费项目。

## 数据库操作

应用使用SQLAlchemy ORM进行数据库操作，主要包括以下操作：

1. **创建记录**：将AI识别结果保存为消费记录
2. **查询记录**：按日期、商家、分类等条件查询消费记录
3. **更新记录**：修改消费记录信息
4. **删除记录**：删除消费记录及其关联的消费项目
5. **生成报表**：按不同维度统计消费数据

## 数据库初始化

数据库初始化代码位于`app/database.py`文件中，在应用启动时自动创建数据库表。

```python
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# SQLite database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./accounting.db"

# Create SQLAlchemy engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```
