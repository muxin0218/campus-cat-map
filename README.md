# 校园流浪猫地图

一个用于在校园地图上标注流浪猫档案、出现记录与投喂点的 Web 应用。

（原型来源：Figma 设计稿：`https://www.figma.com/design/O22Nw44jSzqvB7em40FXBW/%E6%A0%A1%E5%9B%AD%E6%B5%81%E6%B5%AA%E7%8C%AB%E5%9C%B0%E5%9B%BE%E8%AE%BE%E8%AE%A1`）

## 技术栈

- 前端：Vite `6.3.5` + React `18.3.1` + React Router `7.13.0` + Leaflet `^1.9.4` / React-Leaflet `^5.0.0` + Tailwind CSS `4.1.12`
- 后端：Node.js `20+` + Express `4.21.2` + Zod `3.25.76` + pg `8.16.3`
- 数据库：PostgreSQL `14+`
- 包管理：pnpm（仓库为 pnpm workspace）

## 启动步骤

### 1) 数据库配置（含 SQL 导入）

1. 准备 PostgreSQL `14+`，并创建数据库：`campus_cat_map`
2. 导入建表脚本：
   - `psql -U postgres -d campus_cat_map -f db/schema.postgres.sql`

### 2) 后端运行命令

1. 安装依赖（根目录执行一次即可）：
   - `pnpm install`
2. 配置环境变量：
   - 复制 `backend/.env.example` 为 `backend/.env`，并按本机 MySQL 修改
3. 启动后端：
   - `pnpm --dir backend dev`
4. 本地接口地址：
   - `http://localhost:3000/api/health`

### 3) 前端运行命令

- 启动前端：
  - `pnpm dev`
- 本地访问：
  - `http://localhost:5173`

## 接口入口

- 接口文档：`docs/api.md`
- Base URL（本地开发）：`http://localhost:3000`
