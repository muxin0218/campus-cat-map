"""数据库连接模块 - 连接到现有的 PostgreSQL 数据库"""

import os
import psycopg2
import psycopg2.pool
from dotenv import load_dotenv

# 加载环境变量（优先从 backend/.env 读取）
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "backend", ".env")
if os.path.exists(env_path):
    load_dotenv(env_path)
else:
    load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "127.0.0.1"),
    "port": int(os.getenv("DB_PORT", "5432")),
    "user": os.getenv("DB_USER", "postgres"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "campus_cat_map"),
}

_pool = None


def get_connection():
    """获取数据库连接"""
    global _pool
    if _pool is None:
        _pool = psycopg2.pool.ThreadedConnectionPool(
            minconn=1, maxconn=10, **DB_CONFIG
        )
    return _pool.getconn()


def put_connection(conn):
    """归还数据库连接"""
    global _pool
    if _pool:
        _pool.putconn(conn)


def execute_query(sql: str, params: tuple = ()):
    """执行查询并返回所有行"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            # 尝试获取字段名
            if cur.description:
                columns = [desc[0] for desc in cur.description]
                rows = cur.fetchall()
                return [dict(zip(columns, row)) for row in rows]
            return []
    finally:
        put_connection(conn)


def execute_insert(sql: str, params: tuple = ()):
    """执行插入并返回插入的行"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(sql, params)
            conn.commit()
            if cur.description:
                columns = [desc[0] for desc in cur.description]
                row = cur.fetchone()
                return dict(zip(columns, row)) if row else None
            return None
    finally:
        put_connection(conn)
