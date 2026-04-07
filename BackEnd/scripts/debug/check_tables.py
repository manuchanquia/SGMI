import psycopg2

def main():
    try:
        conn = psycopg2.connect(host='localhost', database='sgmi', user='postgres', password='Segundo_Francia_2025', port=5432)
        cur = conn.cursor()
        cur.execute('SELECT 1')
        print('SELECT 1 ->', cur.fetchone())

        cur.execute("SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE tablename ILIKE '%login%';")
        rows = cur.fetchall()
        print('Login-related tables:')
        for r in rows:
            print(' -', r)

        cur.close()
        conn.close()
    except Exception as e:
        print('Error checking tables:', e)

if __name__ == '__main__':
    main()
