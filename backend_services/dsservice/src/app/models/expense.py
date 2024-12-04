from typing import Optional
from pydantic import BaseModel, Field


class Expense(BaseModel):
    """Information about a transaction made on any Card"""
    amount: Optional[str] = Field(title="expense", description="Expense made on the transaction")
    merchant: Optional[str] = Field(title="merchant", description="Marchant name whom the transaction has been made")
    currency: Optional[str] = Field(title="currency", description="currency of the transaction")

    def serialize(self):
        return {
            "amount": self.amount,
            "merchant": self.merchant,
            "currency": self.currency
        }
    

# How to return the JSON Safely, getting exception.
# Next Video Flow
# Recap
# Draw self using eraser.io
