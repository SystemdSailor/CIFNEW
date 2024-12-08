import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faBuilding, 
  faClock,
  faSearch,
  faFilter,
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import gunService from '../../services/gunDB';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchParams, setSearchParams] = useState({
    keyword: '',
    author: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest',
    category: '',
    tags: ''
  });

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const allArticles = await gunService.getAllArticles();
        setArticles(allArticles);
        setLoading(false);
      } catch (err) {
        console.error('加载文章失败:', err);
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  const filteredAndSortedArticles = articles
    .filter(article => {
      const matchesKeyword = article.content?.toLowerCase().includes(searchParams.keyword.toLowerCase());
      
      if (!showAdvancedSearch) {
        return matchesKeyword;
      }

      // 高级搜索条件
      const matchesAuthor = searchParams.author === '' || 
        article.author?.toLowerCase().includes(searchParams.author.toLowerCase());
      const articleDate = new Date(article.timestamp);
      const matchesDateFrom = !searchParams.dateFrom || 
        articleDate >= new Date(searchParams.dateFrom);
      const matchesDateTo = !searchParams.dateTo || 
        articleDate <= new Date(searchParams.dateTo);
      
      const matchesCategory = !searchParams.category || 
        article.category.toLowerCase().includes(searchParams.category.toLowerCase());// === searchParams.category;
      
      const matchesTags = !searchParams.tags || searchParams.tags.split(',').every(tag => 
        article.tagObject?.includes(tag.trim())
      );

      return matchesKeyword && matchesAuthor && matchesDateFrom && 
             matchesDateTo && matchesCategory && matchesTags;
    })
    .sort((a, b) => {
      if (!showAdvancedSearch) {
        return b.timestamp - a.timestamp; 
      }

      switch (searchParams.sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp;
        case 'oldest':
          return a.timestamp - b.timestamp;
        default:
          return 0;
      }
    });

  const handleSearchChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetSearch = () => {
    setSearchParams({
      keyword: '',
      author: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'newest',
      category: '',
      tags: ''
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 搜索区域 */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        {/* 基本搜索 */}
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="搜索文章内容..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg"
            value={searchParams.keyword}
            onChange={(e) => handleSearchChange('keyword', e.target.value)}
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-3 text-gray-400"
          />
        </div>

        {/* 高级搜索切换按钮 */}
        <button
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2" />
          高级搜索
          <FontAwesomeIcon 
            icon={showAdvancedSearch ? faChevronUp : faChevronDown} 
            className="ml-2"
          />
        </button>

        {/* 高级搜索面板 */}
        {showAdvancedSearch && (
          
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作者
                </label>
                <input
                  type="text"
                  placeholder="搜索作者..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchParams.author}
                  onChange={(e) => handleSearchChange('author', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  排序方式
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchParams.sortBy}
                  onChange={(e) => handleSearchChange('sortBy', e.target.value)}
                >
                  <option value="newest">最新发布</option>
                  <option value="oldest">最早发布</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchParams.dateFrom}
                  onChange={(e) => handleSearchChange('dateFrom', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchParams.dateTo}
                  onChange={(e) => handleSearchChange('dateTo', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  节点信息
                </label>
                <input
                  type="text"
                  placeholder="输入节点信息..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchParams.category}
                  onChange={(e) => handleSearchChange('category', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  标签
                </label>
                <input
                  type="text"
                  placeholder="输入标签，多个标签用逗号分隔"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  value={searchParams.tags}
                  onChange={(e) => handleSearchChange('tags', e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={resetSearch}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                重置
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 text-gray-600">
        找到 {filteredAndSortedArticles.length} 篇文章
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedArticles.map((article) => (
          <Link
            to={`/article/${article.id}`}
            key={article.id}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-500" />
                文档 {article.title}
              </h3>
              <div className="text-gray-600 mb-4 line-clamp-3">
                {article.content}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faBuilding} className="mr-1" />
                  <span>{article.category.split('+')[0]}</span>
                </div>
                <div className="flex items-center">
                  <FontAwesomeIcon icon={faClock} className="mr-1" />
                  <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredAndSortedArticles.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          没有找到相关文章
        </div>
      )}
    </div>
  );
};

export default ArticleList; 