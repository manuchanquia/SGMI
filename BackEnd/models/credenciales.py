from database import db
from sqlalchemy.orm import relationship
from datetime import date, datetime
from decimal import Decimal
from typing import Optional, List
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, LargeBinary, ForeignKey, BigInteger, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship



class LoginCredentials(db.Model):
    __tablename__ = 'login_credentials'
    
    email = Column(String, primary_key=True)
    clave = Column(LargeBinary, nullable=False)
    activo = Column(Boolean, default=True)

    def __init__(self, email: str, clave: str):
        self.email = email
        self.clave = clave
        self.activo = True