import { getIPFSContentByCompanyId, getAllIPFSContent } from '../../services/indexedDBService';

// ==================== 虚假文章数据 ====================
// 模拟从 /api/getallarticles/ 获取的文章数据
export const MOCK_ARTICLES = [
  {
    id: "100000001",
    title: "React 入门指南",
    companyId: 1,
    content: `# React 入门指南

## 什么是 React？

React 是一个用于构建用户界面的 JavaScript 库。

### 核心概念

1. **组件化**：将 UI 拆分为独立、可复用的组件
2. **虚拟 DOM**：高效的 DOM 更新机制
3. **单向数据流**：数据从父组件流向子组件

### 快速开始

\`\`\`jsx
import React from 'react';

function App() {
  return <h1>Hello, React!</h1>;
}
\`\`\`

> React 让构建交互式 UI 变得轻而易举。`,
    tagObject: "前端+React+教程",
    category: "技术团队+前端组",
    timestamp: 1746364800000,
    author: "张三"
  },
  {
    id: "100000002",
    title: "Node.js 后端开发实践",
    companyId: 2,
    content: `# Node.js 后端开发实践

## 为什么选择 Node.js？

Node.js 基于 Chrome V8 引擎，具有高性能、事件驱动、非阻塞 I/O 等特性。

### 常用框架

| 框架 | 特点 | 适用场景 |
|------|------|----------|
| Express | 轻量灵活 | RESTful API |
| Koa | 更现代的中间件 | 复杂应用 |
| NestJS | 全栈框架 | 企业级应用 |

### 示例代码

\`\`\`javascript
const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello World' });
});

app.listen(3000);
\`\`\``,
    tagObject: "后端+Node.js+实践",
    category: "技术团队+后端组",
    timestamp: 1746375600000,
    author: "李四"
  },
  {
    id: "100000003",
    title: "数据库设计原则",
    companyId: 9,
    content: `# 数据库设计原则

良好的数据库设计是应用性能和数据一致性的基础。

## 三大范式

1. **第一范式**：字段不可再分
2. **第二范式**：非主键字段完全依赖主键
3. **第三范式**：非主键字段不传递依赖主键

## 索引优化

- 合理使用索引可以大幅提升查询性能
- 避免在频繁更新的列上建立过多索引
- 使用覆盖索引减少回表查询

### 设计注意事项

1. 预估数据量级，选择合适的数据库类型
2. 合理设计分表策略
3. 考虑读写分离方案`,
    tagObject: "数据库+设计+优化",
    category: "技术团队+数据库组",
    timestamp: 1746386400000,
    author: "王五"
  },
  {
    id: "100000004",
    title: "深入理解 JavaScript 闭包",
    companyId: 3,
    content: `# 深入理解 JavaScript 闭包

闭包是 JavaScript 中最重要也最容易让人困惑的概念之一。

## 什么是闭包？

**闭包**是指能够访问自由变量的函数。自由变量是指在函数中使用的，但既不是函数参数也不是函数局部变量的变量。

### 经典示例

\`\`\`javascript
function createCounter() {
  let count = 0;
  return function() {
    return ++count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
\`\`\`

### 闭包的应用场景

- 数据私有化
- 回调函数
- 函数柯里化
- 模块化编程`,
    tagObject: "JavaScript+闭包+进阶",
    category: "技术团队+前端组",
    timestamp: 1746397200000,
    author: "赵六"
  },
  {
    id: "100000005",
    title: "Docker 容器化部署",
    companyId: 4,
    content: `# Docker 容器化部署

Docker 改变了软件开发和部署的方式。

## 基本概念

- **镜像 (Image)**：一个只读模板，包含创建容器的指令
- **容器 (Container)**：镜像的运行实例
- **仓库 (Registry)**：存储和分发镜像的地方

### Dockerfile 示例

\`\`\`dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
\`\`\`

### 常用命令

| 命令 | 说明 |
|------|------|
| docker build | 构建镜像 |
| docker run | 运行容器 |
| docker ps | 查看运行中的容器 |
| docker compose | 管理多容器应用 |`,
    tagObject: "Docker+容器化+部署",
    category: "运维团队+部署组",
    timestamp: 1746408000000,
    author: "钱七"
  },
  {
    id: "100000006",
    title: "产品需求文档模板",
    companyId: 5,
    content: `# 产品需求文档模板

## 1. 项目背景

描述项目背景、目标和预期收益。

## 2. 用户故事

- 作为用户，我希望能快速注册账号
- 作为用户，我希望能搜索内容
- 作为管理员，我希望能管理用户权限

## 3. 功能需求

### 3.1 用户模块
- 注册/登录
- 个人信息管理
- 密码重置

### 3.2 内容模块
- 文章发布
- 文章编辑
- 文章删除

## 4. 非功能需求

- 响应时间 < 200ms
- 系统可用性 99.9%
- 支持 10000 并发用户`,
    tagObject: "产品+需求+文档",
    category: "产品团队+需求组",
    timestamp: 1746418800000,
    author: "孙八"
  },
  {
    id: "100000007",
    title: "UI/UX 设计规范",
    companyId: 6,
    content: `# UI/UX 设计规范

## 设计原则

1. **一致性**：保持界面元素和行为一致
2. **反馈**：用户操作后给予及时反馈
3. **简洁**：去除不必要的元素
4. **可访问性**：确保所有用户都能使用

## 色彩系统

- 主色：#1890ff
- 成功：#52c41a
- 警告：#faad14
- 错误：#ff4d4f

## 字体规范

- 标题：24px/20px/16px
- 正文：14px
- 辅助文字：12px

> 好的设计是看不见的设计。`,
    tagObject: "UI+UX+设计规范",
    category: "产品团队+设计组",
    timestamp: 1746429600000,
    author: "周九"
  },
  {
    id: "100000008",
    title: "Git 工作流最佳实践",
    companyId: 7,
    content: `# Git 工作流最佳实践

## 分支策略

### Git Flow
- **main**: 生产分支
- **develop**: 开发分支
- **feature/***: 功能分支
- **release/***: 发布分支
- **hotfix/***: 热修复分支

### 提交规范

\`\`\`
feat: 新功能
fix: 修复bug
docs: 文档变更
style: 代码格式
refactor: 重构
test: 测试
chore: 构建/工具
\`\`\`

### 常用命令

- git flow init
- git flow feature start my-feature
- git flow release start 1.0.0`,
    tagObject: "Git+工作流+实践",
    category: "技术团队+基础设施组",
    timestamp: 1746440400000,
    author: "吴十"
  },
  {
    id: "100000009",
    title: "机器学习入门",
    companyId: 7,
    content: `# 机器学习入门

## 什么是机器学习？

机器学习是人工智能的一个分支，使计算机能够从数据中学习和改进。

## 主要类型

### 监督学习
- 线性回归
- 决策树
- 支持向量机
- 神经网络

### 无监督学习
- K-means 聚类
- 主成分分析
- 自编码器

### 强化学习
- Q-learning
- 策略梯度
- 深度强化学习

## 学习路线

1. Python 基础
2. 数学基础（线性代数、概率论）
3. 经典算法
4. 深度学习
5. 项目实践`,
    tagObject: "机器学习+AI+入门",
    category: "AI团队+算法组",
    timestamp: 1746451200000,
    author: "郑一"
  },
  {
    id: "100000010",
    title: "微服务架构设计",
    companyId: 8,
    content: `# 微服务架构设计

## 什么是微服务？

微服务架构是一种将应用拆分为小、自治服务的架构风格。

## 核心特性

1. **独立部署**：每个服务可以独立部署
2. **技术多样性**：不同服务可以使用不同技术栈
3. **故障隔离**：单个服务故障不影响整体
4. **弹性扩展**：按需扩展特定服务

## 关键技术

- **服务发现**：Consul, Eureka
- **API 网关**：Kong, Nginx
- **服务通信**：gRPC, Message Queue
- **分布式追踪**：Jaeger, Zipkin
- **配置中心**：Apollo, Nacos`,
    tagObject: "微服务+架构+设计",
    category: "技术团队+架构组",
    timestamp: 1746462000000,
    author: "陈二"
  }
];

// ==================== 模拟 API 请求函数 ====================
// 模拟从 /api/getallarticles/ 获取文章
// 支持传入 companyId，从 CIFNEW_DB.ipfsContent 中过滤对应数据；
// 不传 companyId 时返回全部 IndexedDB 记录 + mock 文章（供「我的文档」/ /articles 页面使用）
const mapRecordToArticle = (record) => {
  let parsedContent = {};
  try {
    parsedContent = JSON.parse(record.content);
  } catch {
    // 如果 content 不是 JSON，直接使用
  }

  return {
    id: record.cid,
    title: parsedContent.title || record.title || '无标题',
    content: parsedContent.content || record.content || '',
    companyId: parsedContent.companyId || record.companyId || '',
    tagObject: parsedContent.tags ? (Array.isArray(parsedContent.tags) ? parsedContent.tags.join('+') : parsedContent.tags) : '',
    category: parsedContent.category || '',
    timestamp: parsedContent.timestamp || record.savedAt || Date.now(),
    author: parsedContent.author || '',
    // 保留数字签名归属信息，便于按 owner 过滤「我的文档」
    owner: parsedContent.owner || null,
    // 保留原始 cid 以便后续使用
    cid: record.cid,
    savedAt: record.savedAt,
  };
};

export const fetchMockArticles = (companyId) => {
  return new Promise(async (resolve) => {
    // 模拟网络延迟
    setTimeout(async () => {
      let articles = [...MOCK_ARTICLES];

      // ===== 删除标记识别（category.type === 'del'） =====
      // 与 QA 的 category.type === 'ans' 关联机制类似：
      // 删除标记的 label 指向被删除文章的目标 cid/id
      const isDelMarker = (article) => {
        const cat = article && article.category;
        return typeof cat === 'object' && cat !== null && cat.type === 'del';
      };

      // 删除标记本身不展示；目标 cid/id 命中 label 的文章也被过滤掉
      const isDeletedArticle = (article, deletedTargets) => {
        if (isDelMarker(article)) return true;
        const key = String((article && (article.cid || article.id)) || '');
        return key !== '' && deletedTargets.has(key);
      };

      // 收集所有被删除目标（删除标记的 label 值）
      let deletedTargets = new Set();

      try {
        // 传入 companyId 时按公司过滤；否则读取 IndexedDB 中的全部记录
        const ipfsRecords = companyId
          ? await getIPFSContentByCompanyId(companyId)
          : await getAllIPFSContent();

        console.log(`fetchMockArticles - 从 IndexedDB 获取到 ${ipfsRecords.length} 条记录:`, ipfsRecords);

        // 将 IndexedDB 记录转换为与 MOCK_ARTICLES 相同的格式
        const ipfsArticles = ipfsRecords.map(mapRecordToArticle);

        // 从删除标记中收集被删除目标（label = 目标文章的 cid/id）
        deletedTargets = new Set(
          ipfsArticles
            .filter(isDelMarker)
            .map((a) => a.category && a.category.label)
            .filter(Boolean)
            .map(String)
        );

        if (deletedTargets.size > 0) {
          console.log(`fetchMockArticles - 识别到 ${deletedTargets.size} 个删除标记:`, [...deletedTargets]);
        }

        // 合并 IndexedDB 文章和 mock 文章（mock 文章仅在传入了 companyId 时过滤），
        // 并过滤掉删除标记及其目标文章
        const mockFiltered = companyId
          ? articles.filter((a) => String(a.companyId) === String(companyId) && !isDeletedArticle(a, deletedTargets))
          : articles.filter((a) => !isDeletedArticle(a, deletedTargets));
        articles = [...mockFiltered, ...ipfsArticles.filter((a) => !isDeletedArticle(a, deletedTargets))];

        console.log(`fetchMockArticles - 总计 ${articles.length} 条文章 (mock: ${mockFiltered.length}, ipfs: ${ipfsArticles.length})`);
      } catch (err) {
        console.error('fetchMockArticles - 从 IndexedDB 查询失败:', err);
        // 如果 IndexedDB 查询失败，回退到只从 mock 数据中过滤
        if (companyId) {
          articles = articles.filter((a) => String(a.companyId) === String(companyId));
        }
      }

      resolve(articles);
    }, 500);
  });
};
