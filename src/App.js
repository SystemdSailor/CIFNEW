import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Layout/Navigation';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import UserProfile from './components/Auth/UserProfile';
import MarkdownEditor from './components/Editor/MarkdownEditor';
import ALLArticles from './components/Articles/ALLArticles';
import ArticleList from './components/Articles/ArticleList';
import HappyFooter from './components/Articles/AppFooter';
import ArticleDetail from './components/Articles/ArticleDetail';
import { SearchProvider } from './context/SearchContext';
import { loadAndStoreData } from "./services/loadCompInfo";

import CytoscapeTree from './components/Editor/CytoscapeTree_NA';

// 在使用时删除
import gunDBPreInsert from './services/gunDBPreInsert';


const ProtectedRoute = ({ children, isAuthenticated }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  useEffect(() => {
    loadAndStoreData(); // 加载爬取的上市公司json数据
  }, []);

  return (
    <SearchProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navigation
            isAuthenticated={isAuthenticated}
            setIsAuthenticated={setIsAuthenticated}
          />

          <main className="container mx-auto py-6">
            <Routes>
              <Route
                path="/"
                element={
                  <div>
                    <ALLArticles />
                    <HappyFooter />
                  </div>
                }
              />
              <Route
                path="/login"
                element={
                  <Login setIsAuthenticated={setIsAuthenticated} />
                }
              />
              <Route path="/register" element={<Register />} />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editor"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <MarkdownEditor />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/searchtree"
                element={
                  <CytoscapeTree />
                }
              />

              <Route
                path="/articles"
                element={<ArticleList />}
              />
              <Route path="/article/:id" element={<ArticleDetail />} />
            </Routes>
          </main>
        </div>
      </Router>
    </SearchProvider>
  );
};

export default App;
