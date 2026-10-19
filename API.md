# API 接口文档

## 1. 基础信息

| 项目 | 值 |
|------|-----|
| **基础 URL** | `http://localhost:4000` |
| **Content-Type** | `application/json` |
| **开发环境** | 认证已禁用，可直接调用 |
| **生产环境** | 需在请求头中添加 `X-API-Key` 或 `Authorization: Bearer <key>` |

## 2. 通用规范

### 2.1 成功响应格式

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功",
  "timestamp": "2026-05-04T02:39:11.000Z"
}
```

### 2.2 错误响应格式

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": [
      { "field": "参数名", "message": "具体错误信息" }
    ]
  }
}
```

### 2.3 通用 HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| `200` | 请求成功 |
| `201` | 创建成功 |
| `400` | 请求参数错误（`VALIDATION_ERROR`） |
| `401` | 未授权，API Key 无效或缺失 |
| `404` | 资源不存在 |
| `429` | 请求频率过高（速率限制） |
| `500` | 服务器内部错误 |

## 3. IPFS 核心 API (`/api`)

### 3.1 上传数据

将数据上传到网络，返回内容标识符（CID）。

```
POST /api/upload
```

#### Request Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `data` | `string` | ✅ | 要上传的数据内容（纯文本或 JSON 字符串） |
| `metadata` | `object` | ❌ | 元数据信息 |
| `metadata.contentType` | `string` | ❌ | 内容类型（如 `text/plain`、`application/json`） |
| `metadata.filename` | `string` | ❌ | 文件名，最长 255 字符 |

> **注意**：上传数据大小不能超过 10MB（可通过环境变量 `MAX_UPLOAD_SIZE` 配置）。

#### 示例

**简单上传：**

```bash
curl -X POST http://localhost:4000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"data": "Hello IPFS!"}'
```

**带元数据上传：**

```bash
curl -X POST http://localhost:4000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "data": "文件内容...",
    "metadata": {
      "filename": "example.txt",
      "contentType": "text/plain"
    }
  }'
```

#### Response `200`

```json
{
  "success": true,
  "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
  "size": 1234,
  "message": "数据上传成功",
  "timestamp": "2026-05-04T02:39:11.000Z"
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `cid` | `string` | 内容标识符（CID v1 格式，以 `bafy` 开头） |
| `size` | `number` | 上传数据大小（字节） |


### 3.2 读取数据

根据 CID 从网络读取数据。

```
GET /api/read/:cid
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cid` | `string` | ✅ | IPFS 内容标识符，长度 46-100 字符，仅含字母数字 |

#### 示例

```bash
curl http://localhost:4000/api/read/bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f
```

#### Response `200`

```json
{
  "success": true,
  "data": "Hello!",
  "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
  "rawContent": "Hello!",
  "metadata": null,
  "timestamp": "2026-05-04T02:39:11.000Z"
}
```

> **说明**：如果上传时包含 `metadata`，返回的 `data` 为原始内容，`metadata` 会附带元数据信息。

#### Response `404`

```json
{
  "success": false,
  "error": {
    "code": "CID_NOT_FOUND",
    "message": "CID 不存在：bafy...1e2f"
  }
}
```

### 3.3 检查 CID

检查指定 CID 是否存在于网络中。

```
GET /api/check/:cid
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `cid` | `string` | ✅ | 内容标识符 |

#### 示例

```bash
curl http://localhost:4000/api/check/bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f
```

#### Response `200`

```json
{
  "success": true,
  "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
  "exists": true,
  "timestamp": "2026-05-04T02:39:11.000Z"
}
```

### 3.4 节点统计

获取本地节点的统计信息。

```
GET /api/stats
```

#### 示例

```bash
curl http://localhost:4000/api/stats
```

#### Response `200`

```json
{
  "success": true,
  "stats": {
    "repoSize": "1048576",
    "numObjects": 42
  },
  "nodeId": "12D3KooW...",
  "timestamp": "2026-05-04T02:39:11.000Z"
}
```

#### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `stats.repoSize` | `string` | 仓库大小（字节，转换为字符串以避免 BigInt 序列化问题） |
| `stats.numObjects` | `number` | 存储的对象数量 |
| `nodeId` | `string` | 节点 Peer ID |

## 4. IPNS API (`/api/ipns`)

### 4.1 发布 IPNS 名称

将 CID 绑定到 IPNS 名称（密钥），使得可以通过 IPNS 名称访问 IPFS 内容。

```
POST /api/ipns/publish
```

#### Request Body

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| `cid` | `string` | ✅ | IPFS 内容标识符 | - |
| `lifetime` | `string` | ❌ | IPNS 记录有效期 | `24h` |
| `ttl` | `string` | ❌ | DNS TTL 值 | - |
| `key` | `string` | ❌ | 使用的密钥名称 | `self` |

#### 示例

```bash
curl -X POST http://localhost:4000/api/ipns/publish \
  -H "Content-Type: application/json" \
  -d '{
    "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
    "lifetime": "48h",
    "key": "my-key"
  }'
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "name": "k51qzi5uqu5d...",
    "value": "/ipfs/bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f"
  },
  "message": "IPNS 发布成功"
}
```

---

### 4.2 解析 IPNS 名称

将 IPNS 名称解析为 IPFS 路径。

```
POST /api/ipns/resolve
```

#### Request Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | IPNS 名称（可包含 `/ipns/` 前缀或不含） |
| `recursive` | `boolean` | ❌ | 是否递归解析 |

#### 示例

```bash
curl -X POST http://localhost:4000/api/ipns/resolve \
  -H "Content-Type: application/json" \
  -d '{"name": "k51qzi5uqu5d...", "recursive": false}'
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "name": "k51qzi5uqu5d...",
    "resolved": "/ipfs/bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f"
  },
  "message": "IPNS 解析成功"
}
```

---

### 4.3 快速解析 IPNS 名称（REST 风格）

通过 GET 请求快速解析 IPNS 名称。

```
GET /api/ipns/:name
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | IPNS 名称 |

#### Query 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `recursive` | `string` | ❌ | 是否递归解析（传 `"true"` 启用） |

#### 示例

```bash
curl "http://localhost:4000/api/ipns/k51qzi5uqu5d...?recursive=true"
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "name": "/ipns/k51qzi5uqu5d...",
    "resolved": "/ipfs/bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f"
  }
}
```

---

### 4.4 获取 Pubsub 状态

获取 IPNS Pubsub 功能是否启用。

```
GET /api/ipns/pubsub/state
```

#### 示例

```bash
curl http://localhost:4000/api/ipns/pubsub/state
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "enabled": true
  }
}
```

---

### 4.5 获取订阅列表

获取当前节点的 IPNS 订阅列表。

```
GET /api/ipns/pubsub/subs
```

#### 示例

```bash
curl http://localhost:4000/api/ipns/pubsub/subs
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "subscriptions": [
      "k51qzi5uqu5d..."
    ],
    "count": 1
  }
}
```

---

### 4.6 取消订阅

取消指定的 IPNS 订阅。

```
POST /api/ipns/pubsub/cancel
```

#### Request Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | 要取消的订阅名称 |

#### 示例

```bash
curl -X POST http://localhost:4000/api/ipns/pubsub/cancel \
  -H "Content-Type: application/json" \
  -d '{"name": "k51qzi5uqu5d..."}'
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "canceled": true
  },
  "message": "订阅已取消"
}
```

---

### 4.7 获取密钥列表

获取本地 IPFS 节点的所有 IPNS 密钥。

```
GET /api/ipns/keys
```

#### 示例

```bash
curl http://localhost:4000/api/ipns/keys
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "keys": [
      {
        "id": "12D3KooW...",
        "name": "self"
      },
      {
        "id": "12D3KooX...",
        "name": "my-key"
      }
    ],
    "count": 2
  }
}
```

---

### 4.8 生成新密钥

生成一个新的 IPNS 密钥对。

```
POST /api/ipns/keys
```

#### Request Body

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| `name` | `string` | ✅ | 密钥名称 | - |
| `type` | `string` | ❌ | 密钥类型 | `rsa` |
| `size` | `number` | ❌ | 密钥大小（位数） | `2048` |

#### 示例

```bash
curl -X POST http://localhost:4000/api/ipns/keys \
  -H "Content-Type: application/json" \
  -d '{"name": "blog-key", "type": "rsa", "size": 2048}'
```

#### Response `201`

```json
{
  "success": true,
  "data": {
    "id": "12D3KooX...",
    "name": "blog-key"
  },
  "message": "密钥生成成功"
}
```

---

## 5. 博客 API (`/api/blog`)

### 5.1 获取文章列表

获取博客文章列表，支持分页。

```
GET /api/blog/posts
```

#### Query 参数

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| `page` | `number` | ❌ | 页码（从 1 开始） | `1` |
| `limit` | `number` | ❌ | 每页数量 | `10` |

#### 示例

```bash
curl "http://localhost:4000/api/blog/posts?page=1&limit=5"
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "Hello World",
        "excerpt": "这是我的第一篇博客文章...",
        "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
        "tags": ["hello", "ipfs"],
        "createdAt": "2026-05-04T02:00:00.000Z",
        "updatedAt": "2026-05-04T02:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 12,
      "totalPages": 3
    }
  }
}
```

> **说明**：文章按创建时间倒序排列，列表不返回完整内容（content），仅返回摘要（excerpt）。

---

### 5.2 获取单篇文章

获取单篇博客文章的完整内容（包含从 IPFS 读取的内容）。

```
GET /api/blog/posts/:id
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `number` | ✅ | 文章 ID |

#### 示例

```bash
curl http://localhost:4000/api/blog/posts/1
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Hello World",
    "content": "这是完整的博客文章内容...",
    "excerpt": "这是我的第一篇博客文章...",
    "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
    "tags": ["hello", "ipfs"],
    "metadata": {
      "size": "2048"
    },
    "createdAt": "2026-05-04T02:00:00.000Z",
    "updatedAt": "2026-05-04T02:00:00.000Z"
  }
}
```

#### Response `404`

```json
{
  "success": false,
  "error": {
    "code": "POST_NOT_FOUND",
    "message": "文章不存在"
  }
}
```

---

### 5.3 创建文章

创建一篇新的博客文章。文章内容会上传到 IPFS，元数据保存在本地数据库。

```
POST /api/blog/posts
```

#### Request Body

| 参数 | 类型 | 必填 | 说明 | 默认值 |
|------|------|------|------|--------|
| `title` | `string` | ✅ | 文章标题 | - |
| `content` | `string` | ✅ | 文章内容（Markdown 或纯文本） | - |
| `excerpt` | `string` | ❌ | 文章摘要 | 自动截取 content 前 200 字符 |
| `tags` | `string[]` | ❌ | 标签数组 | `[]` |

#### 示例

```bash
curl -X POST http://localhost:4000/api/blog/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World",
    "content": "这是我的第一篇博客文章，存储在 IPFS 上！",
    "tags": ["hello", "ipfs"]
  }'
```

#### Response `201`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Hello World",
    "excerpt": "这是我的第一篇博客文章，存储在 IPFS 上！",
    "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
    "tags": ["hello", "ipfs"],
    "metadata": {
      "size": 1234
    },
    "createdAt": "2026-05-04T02:00:00.000Z",
    "updatedAt": "2026-05-04T02:00:00.000Z"
  }
}
```

---

### 5.4 更新文章

更新指定的博客文章。如果提供了 `content`，会重新上传到 IPFS 并获得新 CID。

```
PUT /api/blog/posts/:id
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `number` | ✅ | 文章 ID |

#### Request Body（所有字段可选，只传需要更新的字段）

| 参数 | 类型 | 说明 |
|------|------|------|
| `title` | `string` | 新标题 |
| `content` | `string` | 新内容（更新此字段会重新上传 IPFS） |
| `excerpt` | `string` | 新摘要 |
| `tags` | `string[]` | 新标签数组 |

#### 示例

```bash
curl -X PUT http://localhost:4000/api/blog/posts/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Hello World (已更新)",
    "content": "更新后的内容..."
  }'
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Hello World (已更新)",
    "excerpt": "这是我第一篇博客文章...",
    "cid": "bafybeic3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d",
    "tags": ["hello", "ipfs"],
    "metadata": {
      "size": 5678
    },
    "createdAt": "2026-05-04T02:00:00.000Z",
    "updatedAt": "2026-05-04T02:30:00.000Z"
  },
  "message": "文章更新成功"
}
```

> **注意**：更新后 `cid` 会改变（如果更新了内容），因为 IPFS 地址基于内容哈希。

---

### 5.5 删除文章

删除指定的博客文章（仅删除本地元数据记录，IPFS 上的数据本身不可删除）。

```
DELETE /api/blog/posts/:id
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `number` | ✅ | 文章 ID |

#### 示例

```bash
curl -X DELETE http://localhost:4000/api/blog/posts/1
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Hello World",
    "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f"
  },
  "message": "文章已删除"
}
```

---

### 5.6 获取所有标签

获取所有博客文章使用的标签及其文章数量统计。

```
GET /api/blog/tags
```

#### 示例

```bash
curl http://localhost:4000/api/blog/tags
```

#### Response `200`

```json
{
  "success": true,
  "data": [
    { "name": "ipfs", "count": 5 },
    { "name": "hello", "count": 3 },
    { "name": "tutorial", "count": 2 }
  ]
}
```

> **说明**：标签按文章数量降序排列。

---

### 5.7 获取标签文章列表

获取包含特定标签的所有文章列表。

```
GET /api/blog/tags/:tag
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tag` | `string` | ✅ | 标签名称 |

#### 示例

```bash
curl http://localhost:4000/api/blog/tags/ipfs
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "tag": "ipfs",
    "count": 5,
    "posts": [
      {
        "id": 1,
        "title": "Hello World",
        "excerpt": "这是我的第一篇博客文章...",
        "cid": "bafybeigdyrzt5mhldp4q3j4l5k6n7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f",
        "tags": ["hello", "ipfs"],
        "createdAt": "2026-05-04T02:00:00.000Z"
      }
    ]
  }
}
```

---

## 6. 标签管理 API (`/api/tags`)

### 6.1 获取所有标签

获取标签云中的所有标签（自动从文章中同步）。

```
GET /api/tags
```

#### 示例

```bash
curl http://localhost:4000/api/tags
```

#### Response `200`

```json
{
  "success": true,
  "data": [
    { "name": "hello" },
    { "name": "ipfs" },
    { "name": "tutorial" }
  ]
}
```

---

### 6.2 获取标签云

同 `/api/tags`，获取标签云。

```
GET /api/tags/cloud
```

#### 示例

```bash
curl http://localhost:4000/api/tags/cloud
```

#### Response `200`

```json
{
  "success": true,
  "data": [
    { "name": "hello" },
    { "name": "ipfs" }
  ]
}
```

---

### 6.3 创建标签

创建一个新标签。

```
POST /api/tags
```

#### Request Body

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | `string` | ✅ | 标签名称 |

#### 示例

```bash
curl -X POST http://localhost:4000/api/tags \
  -H "Content-Type: application/json" \
  -d '{"name": "web3"}'
```

#### Response `201`

```json
{
  "success": true,
  "data": { "name": "web3" },
  "message": "标签创建成功"
}
```

#### Response `400`（标签已存在）

```json
{
  "success": false,
  "error": {
    "code": "TAG_EXISTS",
    "message": "标签已存在"
  }
}
```

---

### 6.4 删除标签

删除指定的标签（有关联文章时禁止删除）。

```
DELETE /api/tags/:tag
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tag` | `string` | ✅ | 标签名称 |

#### 示例

```bash
curl -X DELETE http://localhost:4000/api/tags/web3
```

#### Response `200`

```json
{
  "success": true,
  "data": { "name": "web3" },
  "message": "标签已删除"
}
```

#### Response `400`（标签正在使用）

```json
{
  "success": false,
  "error": {
    "code": "TAG_IN_USE",
    "message": "有文章正在使用此标签"
  }
}
```

---

### 6.5 获取标签文章列表

获取特定标签下的所有文章。

```
GET /api/tags/:tag/posts
```

#### Path 参数

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `tag` | `string` | ✅ | 标签名称 |

#### 示例

```bash
curl http://localhost:4000/api/tags/ipfs/posts
```

#### Response `200`

```json
{
  "success": true,
  "data": {
    "tag": "ipfs",
    "count": 5,
    "posts": [
      {
        "id": 1,
        "title": "Hello World",
        "excerpt": "这是我的第一篇博客文章...",
        "tags": ["hello", "ipfs"],
        "createdAt": "2026-05-04T02:00:00.000Z"
      }
    ]
  }
}
```

---

## 7. 错误码说明

### 错误码列表

| HTTP 状态码 | 错误码 | 说明 |
|------------|--------|------|
| `400` | `VALIDATION_ERROR` | 请求参数验证失败 |
| `400` | `TAG_EXISTS` | 标签已存在 |
| `400` | `TAG_IN_USE` | 标签正在被文章使用，无法删除 |
| `401` | `MISSING_API_KEY` | 缺少 API Key |
| `401` | `INVALID_API_KEY` | API Key 无效 |
| `404` | `CID_NOT_FOUND` | IPFS 上未找到指定 CID |
| `404` | `POST_NOT_FOUND` | 文章不存在 |
| `404` | `TAG_NOT_FOUND` | 标签不存在 |
| `429` | `RATE_LIMIT_EXCEEDED` | 请求频率超过限制 |
| `500` | `INTERNAL_ERROR` | 服务器内部错误 |

---

## API 端点速查表

| 方法 | 路径 | 功能 |
|------|------|------|
| `GET` | `/health` | 健康检查 |
| `POST` | `/api/upload` | 上传数据到 IPFS |
| `GET` | `/api/read/:cid` | 读取 IPFS 数据 |
| `GET` | `/api/check/:cid` | 检查 CID 是否存在 |
| `GET` | `/api/stats` | 节点统计 |
| `POST` | `/api/ipns/publish` | 发布 IPNS 名称 |
| `POST` | `/api/ipns/resolve` | 解析 IPNS 名称 |
| `GET` | `/api/ipns/:name` | 快速解析 IPNS |
| `GET` | `/api/ipns/pubsub/state` | Pubsub 状态 |
| `GET` | `/api/ipns/pubsub/subs` | 订阅列表 |
| `POST` | `/api/ipns/pubsub/cancel` | 取消订阅 |
| `GET` | `/api/ipns/keys` | 密钥列表 |
| `POST` | `/api/ipns/keys` | 生成密钥 |
| `GET` | `/api/blog/posts` | 文章列表（分页） |
| `GET` | `/api/blog/posts/:id` | 文章详情 |
| `POST` | `/api/blog/posts` | 创建文章 |
| `PUT` | `/api/blog/posts/:id` | 更新文章 |
| `DELETE` | `/api/blog/posts/:id` | 删除文章 |
| `GET` | `/api/blog/tags` | 博客标签统计 |
| `GET` | `/api/blog/tags/:tag` | 标签文章列表 |
| `GET` | `/api/tags` | 所有标签 |
| `GET` | `/api/tags/cloud` | 标签云 |
| `POST` | `/api/tags` | 创建标签 |
| `DELETE` | `/api/tags/:tag` | 删除标签 |
| `GET` | `/api/tags/:tag/posts` | 标签文章列表 |