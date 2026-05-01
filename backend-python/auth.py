"""用户认证模块 - 注册、登录、获取用户信息"""

import os
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel, Field

from database import execute_query, execute_insert

router = APIRouter(prefix="/api/auth", tags=["auth"])

# JWT 配置
JWT_SECRET = os.getenv("JWT_SECRET", "campus-cat-map-secret-key-change-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24


# ─── 请求/响应模型 ─────────────────────────────────────────


class RegisterRequest(BaseModel):
    username: str = Field(min_length=2, max_length=32)
    password: str = Field(min_length=6, max_length=64)


class LoginRequest(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    role: str
    created_at: str


class AuthResponse(BaseModel):
    token: str
    user: UserResponse


# ─── 辅助函数 ─────────────────────────────────────────────


def hash_password(password: str) -> str:
    """加密密码"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: int, username: str, role: str) -> str:
    """生成 JWT token"""
    payload = {
        "sub": str(user_id),
        "username": username,
        "role": role,
        "iat": datetime.now(timezone.utc),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict:
    """解码 JWT token，失败则抛出异常"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token 已过期，请重新登录")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="无效的 Token")


def get_current_user(authorization: str = Header(None)) -> dict:
    """从请求头中解析当前用户（依赖注入）"""
    if not authorization:
        raise HTTPException(status_code=401, detail="请先登录")
    
    scheme, _, token = authorization.partition(" ")
    if scheme.lower() != "bearer" or not token:
        raise HTTPException(status_code=401, detail="请使用 Bearer Token 格式")
    
    return decode_token(token)


def row_to_user(row: dict) -> UserResponse:
    """数据库行转用户响应"""
    created_at = row["created_at"]
    if hasattr(created_at, "isoformat"):
        created_at = created_at.isoformat()
    return UserResponse(
        id=row["id"],
        username=row["username"],
        role=row["role"],
        created_at=str(created_at),
    )


# ─── API 路由 ─────────────────────────────────────────────


@router.post("/register", response_model=AuthResponse, status_code=201)
def register(body: RegisterRequest):
    """用户注册"""
    # 检查用户名是否已存在
    existing = execute_query(
        "SELECT id FROM public.users WHERE username = %s", (body.username,)
    )
    if existing:
        raise HTTPException(status_code=409, detail="用户名已被占用")

    # 创建用户
    hashed = hash_password(body.password)
    user_row = execute_insert(
        """
        INSERT INTO public.users (username, password_hash, role)
        VALUES (%s, %s, 'user')
        RETURNING id, username, role, created_at
        """,
        (body.username, hashed),
    )

    if not user_row:
        raise HTTPException(status_code=500, detail="注册失败")

    # 生成 token
    token = create_token(user_row["id"], user_row["username"], user_row["role"])
    return AuthResponse(token=token, user=row_to_user(user_row))


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    """用户登录"""
    users = execute_query(
        "SELECT id, username, password_hash, role, created_at FROM public.users WHERE username = %s",
        (body.username,),
    )

    if not users:
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    user = users[0]

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="用户名或密码错误")

    token = create_token(user["id"], user["username"], user["role"])
    return AuthResponse(token=token, user=row_to_user(user))


@router.get("/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """获取当前登录用户信息"""
    user_id = int(current_user["sub"])
    users = execute_query(
        "SELECT id, username, role, created_at FROM public.users WHERE id = %s",
        (user_id,),
    )

    if not users:
        raise HTTPException(status_code=404, detail="用户不存在")

    return row_to_user(users[0])
