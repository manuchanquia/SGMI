import psycopg2

def main():
    try:
        conn = psycopg2.connect(host='localhost', database='sgmi', user='postgres', password='Segundo_Francia_2025', port=5432)
        cur = conn.cursor()
        cur.execute("SELECT email, clave, activo FROM public.login_credentials WHERE email = %s", ("test@example.org",))
        row = cur.fetchone()
        print('login_credentials row:', row)
        cur.close()
        conn.close()
    except Exception as e:
        print('Error querying login_credentials:', e)

if __name__ == '__main__':
    main()
