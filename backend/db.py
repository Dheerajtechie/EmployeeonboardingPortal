import oracledb
import os
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), '..', '.env'))

pool = None

def get_db():
    """Generator to yield a database connection from the pool."""
    global pool
    if pool is None:
        try:
            pool = oracledb.create_pool(
                user=os.getenv('ORACLE_USER', 'onboarding_user'),
                password=os.getenv('ORACLE_PASSWORD', 'onboarding123'),
                dsn=os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1'),
                min=1,
                max=5,
                increment=1
            )
            print("Oracle DB connection pool created.")
        except Exception as e:
            print(f"Failed to create DB pool: {e}")
            raise

    conn = pool.acquire()
    try:
        yield conn
    finally:
        pool.release(conn)

def get_connection():
    """Return a direct connection from the pool (non-generator, caller must close)."""
    global pool
    if pool is None:
        pool = oracledb.create_pool(
            user=os.getenv('ORACLE_USER', 'onboarding_user'),
            password=os.getenv('ORACLE_PASSWORD', 'onboarding123'),
            dsn=os.getenv('ORACLE_DSN', 'localhost:1521/XEPDB1'),
            min=1,
            max=5,
            increment=1
        )
    return pool.acquire()

def release_connection(conn):
    """Release a connection back to the pool."""
    global pool
    if pool and conn:
        pool.release(conn)
