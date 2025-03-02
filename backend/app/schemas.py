from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date

# ExpenseItem schemas
class ExpenseItemBase(BaseModel):
    name: str
    amount: float
    needed_confirmation: bool = False

class ExpenseItemCreate(ExpenseItemBase):
    pass

class ExpenseItem(ExpenseItemBase):
    id: int
    expense_id: int

    class Config:
        from_attributes = True

# Expense schemas
class ExpenseBase(BaseModel):
    merchant: str
    date: datetime
    total_amount: float
    input_type: str
    input_data_path: Optional[str] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    is_confirmed: bool = False

class ExpenseCreate(ExpenseBase):
    items: List[ExpenseItemCreate]

class Expense(ExpenseBase):
    id: int
    created_at: datetime
    items: List[ExpenseItem]

    class Config:
        from_attributes = True

# Recognition result schema
class RecognitionResult(BaseModel):
    merchant: str
    date: str
    total: float
    items: List[Dict[str, Any]]

# Recognition request schema
class RecognitionRequest(BaseModel):
    input_type: str  # 'image', 'voice', 'text'
    content: Optional[str] = None  # Base64 encoded content or text

# Report schemas
class DateRange(BaseModel):
    start_date: date
    end_date: date

class CategorySummary(BaseModel):
    category: str
    total_amount: float
    count: int

class MerchantSummary(BaseModel):
    merchant: str
    total_amount: float
    count: int

class ExpenseSummary(BaseModel):
    total_expenses: float
    total_count: int
    by_category: List[CategorySummary]
    by_merchant: List[MerchantSummary]
    by_date: Dict[str, float]  # Date string -> total amount

# Expense update schema
class ExpenseUpdate(BaseModel):
    merchant: Optional[str] = None
    date: Optional[datetime] = None
    total_amount: Optional[float] = None
    category: Optional[str] = None
    notes: Optional[str] = None
    is_confirmed: Optional[bool] = None
