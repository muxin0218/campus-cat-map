# 🐱 校园流浪猫地图

> 一个用于在校园地图上标注流浪猫档案、偶遇打卡、投喂记录与数据统计的 Web 应用。

---

## ✨ 功能特色

| 功能模块 | 说明 |
|----------|------|
| 🗺️ **地图概览** | 首页 Leaflet 地图展示所有猫咪位置、投喂点标记 |
| 📖 **猫咪图鉴** | 三列网格展示猫咪图片卡片，支持搜索、按绝育状态筛选 |
| 📄 **猫咪详情** | 猫咪资料、关联的打卡动态与投喂记录时间线 |
| 📸 **偶遇打卡** | 选择猫咪 → 定位（GPS 或手动输入）→ 上传照片 → 提交 |
| 🍽️ **投喂打卡** | 选择投喂点 → 填写食物信息 → 关联猫咪 → 提交 |
| 👤 **个人中心** | 登录/注册、个人打卡记录、成就徽章、猫咪总数统计 |
| 📊 **数据看板** | 核心指标、7 天打卡趋势、性别/绝育分布、明星猫咪排行、积极用户排行 |
| ✅ **审核管理** | 管理员审核猫咪、打卡、投喂记录的上报内容 |
| 🔐 **用户系统** | 注册 / 登录（JWT）、管理员/普通用户权限控制 |
| 🗺️ **投喂点管理** | 地图标注投喂点，支持添加、编辑、删除 |

---

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| **前端** | Vite + React 18 + React Router 7 + TypeScript |
| **地图** | Leaflet + React-Leaflet |
| **样式** | Tailwind CSS 4 + shadcn/ui |
| **图表** | Recharts |
| **后端** | Node.js + Express + Zod + pg |
| **认证** | Python FastAPI（独立 JWT 认证服务） |
| **数据库** | PostgreSQL 14+ |
| **包管理** | pnpm（monorepo workspace） |

---

## 🚀 启动步骤

### 1) 数据库配置

```bash
# 创建数据库并导入建表脚本
psql -U postgres -d campus_cat_map -f db/schema.postgres.sql
# 导入种子数据
psql -U postgres -d campus_cat_map -f db/seed.postgres.sql
```

### 2) 后端运行（Express，端口 3000）

```bash
pnpm install
cp backend/.env.example backend/.env  # 修改数据库连接信息
pnpm --dir backend dev
```

验证：`http://localhost:3000/api/health`

### 3) 认证服务（Python FastAPI，端口 8000）

```bash
pip install -r backend-python/requirements.txt
python backend-python/main.py
```

### 4) 前端运行（端口 5173）

```bash
pnpm dev
```

本地访问：`http://localhost:5173`

---

## 📁 项目结构

```
campus-cat-map/
├── src/                          # 前端源码
│   ├── app/
│   │   ├── api/client.ts         # API 请求封装
│   │   ├── routes.tsx            # 路由配置
│   │   ├── components/           # 公共组件
│   │   └── pages/                # 页面组件（11 个页面）
│   └── styles/
├── backend/                      # Express 后端
│   └── src/
│       ├── app.ts
│       ├── db/pool.ts
│       └── routes/               # cats, sightings, feeding-points, feeding-events, health
├── backend-python/               # FastAPI 认证服务
├── db/                           # SQL 脚本
└── docs/api.md                   # API 文档
```

---

## 📄 接口文档

详见 `docs/api.md`。

- Express 后端：`http://localhost:3000`
- FastAPI 认证：`http://localhost:8000`
