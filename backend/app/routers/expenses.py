from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Optional
from datetime import datetime, date, timedelta
import calendar

from .. import models, schemas
from ..database import get_db

router = APIRouter()

@router.post("/", response_model=schemas.Expense)
def create_expense(expense: schemas.ExpenseCreate, db: Session = Depends(get_db)):
    """Create a new expense record with items"""
    try:
        # Create expense
        db_expense = models.Expense(
            merchant=expense.merchant,
            date=expense.date,
            total_amount=expense.total_amount,
            input_type=expense.input_type,
            input_data_path=expense.input_data_path,
            category=expense.category,
            notes=expense.notes,
            is_confirmed=expense.is_confirmed
        )
        db.add(db_expense)
        db.commit()
        db.refresh(db_expense)
        
        # Create expense items
        for item in expense.items:
            db_item = models.ExpenseItem(
                expense_id=db_expense.id,
                name=item.name,
                amount=item.amount,
                needed_confirmation=item.needed_confirmation
            )
            db.add(db_item)
        
        db.commit()
        db.refresh(db_expense)
        return db_expense
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create expense: {str(e)}")

@router.get("/", response_model=List[schemas.Expense])
def read_expenses(
    skip: int = 0, 
    limit: int = 100, 
    merchant: Optional[str] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db)
):
    """
    Get all expenses with optional filtering
    
    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    - **merchant**: Filter by merchant name
    - **category**: Filter by category
    - **start_date**: Filter by start date
    - **end_date**: Filter by end date
    """
    query = db.query(models.Expense)
    
    # Apply filters if provided
    if merchant:
        query = query.filter(models.Expense.merchant.ilike(f"%{merchant}%"))
    if category:
        query = query.filter(models.Expense.category == category)
    if start_date:
        query = query.filter(models.Expense.date >= start_date)
    if end_date:
        query = query.filter(models.Expense.date <= end_date)
    
    # Order by date descending
    query = query.order_by(models.Expense.date.desc())
    
    # Apply pagination
    expenses = query.offset(skip).limit(limit).all()
    return expenses

@router.get("/{expense_id}", response_model=schemas.Expense)
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    """Get a specific expense by ID"""
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    return expense

@router.put("/{expense_id}", response_model=schemas.Expense)
def update_expense(expense_id: int, expense_update: schemas.ExpenseUpdate, db: Session = Depends(get_db)):
    """Update an expense"""
    db_expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if db_expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Update expense fields if provided
    update_data = expense_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_expense, key, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense

@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    """Delete an expense and its items"""
    expense = db.query(models.Expense).filter(models.Expense.id == expense_id).first()
    if expense is None:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # With cascade="all, delete-orphan" in the relationship, 
    # we don't need to manually delete the items
    db.delete(expense)
    db.commit()
    
    return {"message": "Expense deleted successfully"}

@router.get("/summary/report", response_model=schemas.ExpenseSummary)
def get_expense_summary(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Generate a summary report of expenses
    
    - **start_date**: Start date for the report period
    - **end_date**: End date for the report period
    """
    # Set default date range to current month if not provided
    if not start_date:
        today = date.today()
        start_date = date(today.year, today.month, 1)
    
    if not end_date:
        today = date.today()
        # Last day of current month
        _, last_day = calendar.monthrange(today.year, today.month)
        end_date = date(today.year, today.month, last_day)
    
    # Base query with date filter
    query = db.query(models.Expense).filter(
        models.Expense.date >= start_date,
        models.Expense.date <= end_date
    )
    
    # Total expenses
    total_expenses = db.query(func.sum(models.Expense.total_amount)).filter(
        models.Expense.date >= start_date,
        models.Expense.date <= end_date
    ).scalar() or 0.0
    
    total_count = query.count()
    
    # Group by category
    category_summary = []
    category_results = db.query(
        models.Expense.category,
        func.sum(models.Expense.total_amount).label("total_amount"),
        func.count(models.Expense.id).label("count")
    ).filter(
        models.Expense.date >= start_date,
        models.Expense.date <= end_date
    ).group_by(models.Expense.category).all()
    
    for category, amount, count in category_results:
        category_summary.append({
            "category": category or "未分类",  # "Uncategorized" in Chinese
            "total_amount": float(amount),
            "count": count
        })
    
    # Group by merchant
    merchant_summary = []
    merchant_results = db.query(
        models.Expense.merchant,
        func.sum(models.Expense.total_amount).label("total_amount"),
        func.count(models.Expense.id).label("count")
    ).filter(
        models.Expense.date >= start_date,
        models.Expense.date <= end_date
    ).group_by(models.Expense.merchant).all()
    
    for merchant, amount, count in merchant_results:
        merchant_summary.append({
            "merchant": merchant,
            "total_amount": float(amount),
            "count": count
        })
    
    # Group by date
    date_summary = {}
    date_results = db.query(
        models.Expense.date,
        func.sum(models.Expense.total_amount).label("total_amount")
    ).filter(
        models.Expense.date >= start_date,
        models.Expense.date <= end_date
    ).group_by(models.Expense.date).all()
    
    for expense_date, amount in date_results:
        date_str = expense_date.strftime("%Y-%m-%d")
        date_summary[date_str] = float(amount)
    
    return {
        "total_expenses": float(total_expenses),
        "total_count": total_count,
        "by_category": category_summary,
        "by_merchant": merchant_summary,
        "by_date": date_summary
    }

@router.get("/categories/list", response_model=List[str])
def get_categories(db: Session = Depends(get_db)):
    """Get a list of all unique categories"""
    categories = db.query(models.Expense.category).distinct().all()
    return [category[0] for category in categories if category[0]]

@router.get("/merchants/list", response_model=List[str])
def get_merchants(db: Session = Depends(get_db)):
    """Get a list of all unique merchants"""
    merchants = db.query(models.Expense.merchant).distinct().all()
    return [merchant[0] for merchant in merchants if merchant[0]]
