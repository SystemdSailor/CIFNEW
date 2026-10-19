## mockCompanies（公司假数据）

`mockCompanies` 是一个公司假数据数组，每个公司对象包含以下字段及其作用：

| 字段 | 类型 | 作用说明 |
|------|------|----------|
| **id** | number | 唯一标识符，用于列表渲染 key、路由跳转参数、关联查询的区分依据 |
| **name** | string | 公司名称，在卡片、详情页、搜索结果等 UI 中展示 |
| **logo** | string | 公司 Logo URL，以图片形式展示品牌标识 |
| **industry** | string | 所属行业，用于行业分类筛选（对应 filterOptions.industries） |
| **scale** | string | 公司规模（员工人数范围），用于规模筛选（对应 filterOptions.scales） |
| **city** | string | 所在城市，用于按城市筛选（对应 filterOptions.cities）及位置展示 |
| **description** | string | 公司简介，帮助用户快速了解公司 |
| **jobs** | number | 在招职位数量，展示当前开放的招聘岗位数 |
| **rating** | number | 公司评分（1-5 分制），体现用户评价，影响排名 |
| **founded** | string | 成立年份，展示公司历史积淀 |
| **website** | string | 公司官网地址，提供跳转链接 |
| **parent** | string (可选) | 所属集团/母公司名称（如"阿里云"的 parent 为"阿里巴巴集团"），展示子公司隶属关系 |
| **related** | string[] (可选) | 相关公司/关联公司列表，展示合作伙伴、竞品或关联企业 |

- 此外还有 **filterOptions** 导出，包含三个筛选分类：industries（行业）、cities（城市）、scales（规模）。

## allData.json（A股上市公司数据）

`allData.json` 是一个以省份为 key 的 JSON 对象，存储 A 股上市公司数据。顶级 key 为各省份名称（含直辖市、自治区、特别行政区），每个省份对应一个公司对象数组。

**顶级结构：**

| 层级 | 类型 | 说明 |
|------|------|------|
| 顶级 key | string | 省份名称（如 "上海市"、"北京市"、"广东省"），共 34 个地区 |
| 对应 value | array | 该省份下的 A 股上市公司列表 |

**每个公司对象包含以下字段：**

| 字段 | 类型 | 作用说明 |
|------|------|----------|
| **id** | string | 公司唯一标识符（32 位字符串），用于数据关联与去重 |
| **stockCode** | string | A 股股票代码（如 "301000"、"601519"），用于展示和链接到股票行情 |
| **companyName** | string | 公司简称（如 "肇民科技"、"大智慧"），在列表、搜索、详情页中展示 |
| **province** | string | 所属省份，与顶级 key 对应，用于按地域维度筛选和统计 |
| **fullCompanyName** | string | 公司全称（如 "上海肇民新材料科技股份有限公司"），在详情页展示完整企业名称 |
| **tags** | string | 概念标签（逗号分隔，如 "新能源汽车, 融资融券, 人工智能"），用于按概念/题材筛选和展示 |
| **englishName** | string | 公司英文名称，用于国际化展示或接口对接 |
| **city** | string | 所在城市/区（如 "金山区"、"浦东新区"），用于更精细的地域筛选 |
| **industry** | string | 所属行业（如 "汽车零部件"、"软件开发"），用于按行业分类筛选 |
| **details** | string | 详细信息（当前统一为 "N/A"），预留字段，可用于扩展存储公司详情描述 |
