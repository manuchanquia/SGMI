from sqlalchemy import create_engine, inspect
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv('DATABASE_URL') or 'postgresql://postgres:Segundo_Francia_2025@localhost:5432/sgmi'
engine = create_engine(DB_URL)
inspector = inspect(engine)

print("Participacion table structure:")
columns = inspector.get_columns('participacion')
for col in columns:
    print(f"  {col['name']}: {col['type']}, nullable={col['nullable']}")

print("\nForeign keys:")
fks = inspector.get_foreign_keys('participacion')
for fk in fks:
    print(f"  Name: {fk.get('name')}")
    print(f"  Constrained columns: {fk['constrained_columns']}")
    print(f"  Referred table: {fk['referred_table']}")
    print(f"  Referred columns: {fk['referred_columns']}")
    print()
