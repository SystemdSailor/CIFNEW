# SearchContext 搜索上下文说明

## 概述

`SearchContext` 是全局搜索状态管理，用于在搜索组件 `BigSearch` 和列表展示组件 `CompanyList` 之间传递搜索/筛选参数。

## 状态定义

| 状态名 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| `searchQuery` | string | `''` | 搜索关键词（公司名称/描述/行业） |
| `industry` | string | `''` | 选定行业（空字符串表示全部） |
| `city` | string | `''` | 选定城市（空字符串表示全国） |

## 暴露的 API

```js
const {
  searchQuery,   // string - 当前搜索关键词
  setSearchQuery,// function - 设置搜索关键词
  industry,      // string - 当前筛选行业
  setIndustry,   // function - 设置筛选行业
  city,          // string - 当前筛选城市
  setCity        // function - 设置筛选城市
} = useSearch();
```

## 数据流流程

```
BigSearch（搜索输入组件）
  │
  │  用户在搜索框输入关键词 + 选择行业/地区
  │  点击搜索按钮或按回车触发 handleSearch()
  │
  ├─ setSearchQuery(searchInput)  ──→  SearchContext.searchQuery
  ├─ setIndustry(selectedIndustry) ──→  SearchContext.industry
  └─ setCity(selectedCity)        ──→  SearchContext.city
                                          │
                                          ▼
App.js（应用根组件）
  │  const { searchQuery, industry, city } = useSearch()
  │
  │  mockCompanies.filter(company => {
  │    // 1. 关键词过滤（name / description / industry）
  │    // 2. 行业过滤（模糊匹配，如"互联网"匹配"互联网/电子商务"）
  │    // 3. 地区过滤（精确匹配 company.city）
  │  })
  │
  ▼
CompanyList（公司列表组件）
  │ 接收 filteredCompanies 作为 props
  │ 展示搜索结果（或"暂无匹配公司"空状态）
```

## 涉及文件

| 文件 | 角色 |
|------|------|
| `src/context/SearchContext.js` | 定义 Context、Provider、useSearch hook |
| `src/components/Layout/BigSearch.js` | 用户输入搜索参数，调用 setSearchQuery/setIndustry/setCity |
| `src/App.js` | 读取搜索参数，对 mockCompanies 执行过滤，传入 CompanyList |
| `src/components/Home/CompanyList.jsx` | 接收过滤后的 companies 列表并渲染 |

## 过滤规则

```js
// 关键词：不区分大小写，模糊匹配
company.name.includes(query)
company.description.includes(query)
company.industry.includes(query)

// 行业：使用 includes 做模糊匹配（如数据中 "互联网/电子商务" 匹配 "互联网"）
company.industry.includes(industry)

// 地区：精确匹配
company.city === city
```

三个条件是 **与（AND）** 关系，同时满足所有非空条件才会被展示。