import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navigation from './components/Layout/Navigation';
import MarkdownEditor from './components/Editor/MarkdownEditor';
import ALLArticles from './components/Articles/ALLArticles';
import MyDocuments from './components/Articles/MyDocuments';
import HappyFooter from './components/Articles/AppFooter';
import ArticleDetail from './components/Articles/ArticleDetail';
import { SearchProvider, useSearch } from './context/SearchContext';
import { QaChapterProvider } from './context/QaChapterContext';
import { loadAndStoreData } from "./services/loadCompInfo";
import FlightSearchBar from './components/Home/FlightSearchBar';
import CompanySearchBar from './components/Home/CompanySearchBar';
import DestinationSection from './components/Home/DestinationSection';
import CompanyList from './components/Home/CompanyList';
import CompanyDetail from './components/Home/CompanyDetail';
import HomeTour from './components/Home/HomeTour';
import StandardizePage from './components/Standardization/StandardizePage';
import NotFoundPage from './components/Home/NotFoundPage';
import { mockCompanies as initialCompanies } from './components/data/transformed_companies';


import CytoscapeTree from './components/Editor/CytoscapeTree';
// import pubsubAggregator from './services/pubsubAggregator';
import backendClient from './services/backendClient';
import { syncAllMonthsToIndexedDB } from './services/orbitUpdateService';
import { fetchOrbitCompanies, mergeCompanies } from './services/orbitCompanyService';
import MonthlyDbTest from './components/Test/MonthlyDbTest';
import OrbitDbDocTest from './components/Test/OrbitDbDocTest';
import OrbitServerTest from './components/Test/OrbitServerTest';
import TestRouter from './components/Test/TestRouter';
import CommonQAPage from './components/QA/CommonQAPage';


// 内部组件，确保 useNavigate 在 Router 内部使用
const AppRoutes = () => {
  const [companies, setCompanies] = useState(initialCompanies);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [listCurrentPage, setListCurrentPage] = useState(1);
  const { searchQuery, industry, city } = useSearch();
  const filteredCompanies = companies.filter(company => {
    const query = searchQuery.toLowerCase().trim();

    // 关键词过滤（字段兜底空串：历史/外部写入的 OrbitDB 记录可能缺失这些字段）
    const name = (company.name || '').toLowerCase();
    const description = (company.description || '').toLowerCase();
    const companyIndustry = (company.industry || '').toLowerCase();

    if (query && !(name.includes(query) ||
      description.includes(query) ||
      companyIndustry.includes(query))) {
      return false;
    }

    // 行业过滤
    if (industry && !(company.industry || '').includes(industry)) {
      return false;
    }

    // 地区过滤
    if (city && company.city !== city) {
      return false;
    }

    return true;
  });

  // 点击公司卡片时不跳转路由，改为设置选中公司以显示覆盖层
  const handleCompanyClick = useCallback((company) => {
    setSelectedCompany(company);
  }, []);

  const [isEditing, setIsEditing] = useState(false);
  const [editCompany, setEditCompany] = useState(null);

  const handleCloseDetail = useCallback(() => {
    setSelectedCompany(null);
    setIsEditing(false);
    setEditCompany(null);
  }, [setSelectedCompany, setIsEditing, setEditCompany]);

  const handleEdit = useCallback((company) => {
    setEditCompany(company);
    setIsEditing(true);
  }, []);

  const handleBackFromEdit = useCallback(() => {
    setIsEditing(false);
    setEditCompany(null);
  }, []);

  useEffect(() => {
    loadAndStoreData(); // 加载爬取的上市公司json数据

    // 自动同步 orbit-config.json 中所有月份 OrbitDB 数据到 IndexedDB
    // （月份来源：后端 /api/dbs 返回的 YYYY-MM 月度库名）
    syncAllMonthsToIndexedDB().catch(err => {
      console.error('OrbitDB 月度同步失败:', err);
    });

    // 读取 OrbitDB companies 数据库中「新增公司节点」写入的公司，追加到列表末尾
    let cancelled = false;
    fetchOrbitCompanies().then(({ docs, error }) => {
      if (cancelled || error || docs.length === 0) return;
      setCompanies(prev => mergeCompanies(prev, docs));
      console.log(`✅ 已从 OrbitDB companies 载入 ${docs.length} 条公司数据`);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />

      <main className="container mx-auto py-6">
        <Routes>
          <Route
            path="/"
            element={
              <div>
                {selectedCompany ? (
                  <CompanyDetail
                    company={selectedCompany}
                    onClose={handleCloseDetail}
                    onEdit={() => handleEdit(selectedCompany)}
                    isEditing={isEditing && editCompany?.id === selectedCompany?.id}
                    onBackFromEdit={isEditing ? handleBackFromEdit : undefined}
                  />
                ) : (
                  <>
                    <CompanyList
                      companies={filteredCompanies}
                      onCompanyClick={handleCompanyClick}
                      onAddCompany={(newCompany) => setCompanies(prev => [...prev, newCompany])}
                      currentPage={listCurrentPage}
                      onPageChange={setListCurrentPage}
                    />
                    {/* 首页新手引导：仅列表视图挂载，详情页自动卸载 */}
                    <HomeTour />
                    {/* <ALLArticles /> */}
                  </>
                )}
                <HappyFooter />
              </div>
            }
          />
          <Route
            path="/editor"
            element={
              <MarkdownEditor company={null} />
            }
          />

          <Route
            path="/searchtree"
            element={
              <CytoscapeTree />
            }
          />

          <Route path="/standardize" element={<StandardizePage />} />
          <Route path="/qa" element={<CommonQAPage />} />
          <Route path="/articles" element={<MyDocuments />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/company/:id" element={<CompanyDetail />} />
          <Route path="/test" element={<TestRouter />} />
          <Route path="/test/orbit-server" element={<OrbitServerTest />} />
          <Route path="/test/orbitdb-doc" element={<OrbitDbDocTest />} />
          <Route path="/test/monthly-db" element={<MonthlyDbTest />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  const [backendReady, setBackendReady] = useState(false);

  useEffect(() => {
    // pubsubAggregator.start().catch(err => {
    //   console.error('PubSubAggregator 启动失败:', err);
    // });

    // 检测后端服务是否就绪
    let mounted = true;
    const check = async () => {
      try {
        await backendClient.ping();
        if (mounted) setBackendReady(true);
      } catch {
        // 重试
        setTimeout(check, 2000);
      }
    };
    check();

    return () => {
      mounted = false;
      // pubsubAggregator.stop().catch(err => {
      //   console.error('PubSubAggregator 停止失败:', err);
      // });
    };
  }, []);

  if (!backendReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="text-2xl mb-4">⏳ 正在连接后端 OrbitDB 服务...</div>
          <div className="text-gray-500">请确保后端已启动：npm run backend</div>
        </div>
      </div>
    );
  }

  return (
    <SearchProvider>
      <QaChapterProvider>
        <Router>
          <AppRoutes />
        </Router>
      </QaChapterProvider>
    </SearchProvider>
  );
};

export default App;
