from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

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
