"""校园流浪猫地图 - Python 认证后端入口"""

import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth import router as auth_router

app = FastAPI(
    title="校园流浪猫地图 - 认证服务",
    description="提供用户注册、登录、Token 验证功能",
    version="1.0.0",
)

# CORS 配置 - 允许前端跨域访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth_router)


@app.get("/api/health")
def health_check():
    return {"ok": True}


if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_PORT", "8000"))
    print(f"Python 认证服务启动在 http://localhost:{port}")
    print(f"API 文档: http://localhost:{port}/docs")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
