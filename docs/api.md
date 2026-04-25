# RESTful API 接口文档（核心功能）

Base URL（本地开发）：`http://localhost:3000`

统一约定：
- Content-Type：`application/json`
- 返回体：成功返回业务 JSON；失败返回 `{ "message": string, "issues"?: any }`

## 1. 健康检查

### GET `/api/health`
- 状态码：`200`
- 返回：
  - `ok:boolean`

## 2. 猫咪（Cats）

### GET `/api/cats`
查询猫咪列表（用于地图/列表页）。
- 状态码：`200`
- 请求参数（Query，可选）：
  - `q:string`：按名称模糊查询
  - `limit:number`：默认 20
  - `offset:number`：默认 0
- 返回：
  - `items: Cat[]`

### GET `/api/cats/:id`
查询单只猫详情。
- 状态码：`200` / `404`
- 路径参数：
  - `id:number`
- 返回（200）：
  - `id:number`
  - `name:string`
  - `sex:"unknown"|"male"|"female"`
  - `description?:string`
  - `neutered:boolean`

### POST `/api/cats`
创建猫咪档案。
- 状态码：`201` / `400`
- 请求体：
  - `name:string`（必填，1-50）
  - `sex:"unknown"|"male"|"female"`（可选）
  - `description?:string`（可选，<=500）
- 返回（201）：
  - `id:number`
  - 同请求体字段

## 3. 出现记录（Sightings）

### GET `/api/sightings`
查询出现记录列表（支持按猫咪筛选）。
- 状态码：`200`
- 请求参数（Query，可选）：
  - `cat_id:number`
  - `from:string`：ISO datetime
  - `to:string`：ISO datetime
  - `limit:number`：默认 50
  - `offset:number`：默认 0
- 返回：
  - `items: Sighting[]`

### POST `/api/sightings`
上报一次“目击/出现”。
- 状态码：`201` / `400` / `404`
- 请求体：
  - `cat_id:number`（必填）
  - `latitude:number`（必填，-90~90）
  - `longitude:number`（必填，-180~180）
  - `note?:string`（可选，<=500）
  - `happened_at?:string`（可选，ISO datetime）
- 返回（201）：
  - `id:number`
  - 同请求体字段

## 4. 投喂点（Feeding Points）

### GET `/api/feeding-points`
查询投喂点列表（用于地图展示）。
- 状态码：`200`
- 请求参数（Query，可选）：
  - `limit:number`：默认 50
  - `offset:number`：默认 0
- 返回：
  - `items: FeedingPoint[]`

### POST `/api/feeding-points`
创建投喂点。
- 状态码：`201` / `400`
- 请求体：
  - `name:string`（必填，1-100）
  - `latitude:number`（必填，-90~90）
  - `longitude:number`（必填，-180~180）
  - `description?:string`（可选，<=500）
- 返回（201）：
  - `id:number`
  - 同请求体字段

## 5. 状态码说明

- `200 OK`：查询成功
- `201 Created`：创建成功
- `400 Bad Request`：参数校验失败
- `404 Not Found`：资源不存在（如 `cat_id` 不存在）
- `500 Internal Server Error`：服务端异常

