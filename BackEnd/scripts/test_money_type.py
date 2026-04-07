"""Test money type handling in Equipamiento model"""

import sys
sys.path.insert(0, 'C:\\inetpub\\SGMI-grupo-02\\BackEnd')

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database connection
DATABASE_URI = 'postgresql://postgres.hxrdfvfeiddvydvilrsa:Segundo_Francia_2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres'
engine = create_engine(DATABASE_URI)

def test_money_handling():
    """Test how money type is handled"""
    
    try:
        print("=" * 70)
        print("TESTING MONEY TYPE HANDLING")
        print("=" * 70)
        
        # Query directly with SQL
        with engine.connect() as conn:
            result = conn.execute(text("SELECT id, denominacion, monto FROM equipamiento LIMIT 1"))
            row = result.fetchone()
            
            if row:
                print(f"\n✓ Found equipamiento: {row[1]}")
                print(f"  ID: {row[0]}")
                print(f"  Monto (raw): {row[2]}")
                print(f"  Monto type: {type(row[2])}")
                
                # Try different conversion methods
                try:
                    as_float = float(row[2])
                    print(f"  Monto as float: {as_float}")
                except Exception as e:
                    print(f"  ⚠️  Error converting to float: {e}")
                
                try:
                    as_str = str(row[2])
                    print(f"  Monto as string: {as_str}")
                    # Remove currency symbols
                    cleaned = as_str.replace('$', '').replace(',', '').strip()
                    print(f"  Cleaned string: '{cleaned}'")
                    as_float = float(cleaned)
                    print(f"  Converted to float: {as_float}")
                except Exception as e:
                    print(f"  ⚠️  Error with string conversion: {e}")
            else:
                print("\n⚠️  No equipamiento found in database")
                
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_money_handling()
