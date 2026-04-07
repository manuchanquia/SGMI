from pydantic import BaseModel, Field, field_validator
from datetime import date
from typing import Optional

class BibliografiaBase(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=500, description="Título de la publicación")
    autores: str = Field(..., min_length=3, description="Lista de autores")
    editorial: str = Field(..., min_length=2)
    fecha: date = Field(..., description="Fecha de publicación en formato YYYY-MM-DD")
    planificacionId: int = Field(..., gt=0, description="ID de la planificación asociada")
    anio: Optional[int] = Field(None, ge=1900, le=2100)

class BibliografiaCreate(BibliografiaBase):
    pass

class BibliografiaResponse(BibliografiaBase):
    id: int

    class Config:
        from_attributes = True 