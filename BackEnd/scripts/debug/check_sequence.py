from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
DB_URL = os.getenv('DATABASE_URL') or 'postgresql://postgres:Segundo_Francia_2025@localhost:5432/sgmi'
engine = create_engine(DB_URL)
conn = engine.connect()

# Check sequence value
result = conn.execute(text("SELECT last_value FROM institucion_id_seq"))
print(f'Sequence last_value: {result.fetchone()[0]}')

# Check actual rows
result = conn.execute(text('SELECT COUNT(*) FROM institucion'))
print(f'Actual rows in institucion: {result.fetchone()[0]}')

conn.close()
