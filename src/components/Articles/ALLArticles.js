import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faUser, 
  faClock,
  faBuilding
} from '@fortawesome/free-solid-svg-icons';
import gunService from '../../services/gunDB';
import { useSearch } from '../../context/SearchContext';

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { searchQuery } = useSearch();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const allArticles = await gunService.getAllArticles();
        console.log("ArticleList",allArticles)
        if (Array.isArray(allArticles)) {
          console.log("是ARRAY ArticleList",allArticles)
        }
        setArticles(allArticles);
        setLoading(false);
      } catch (err) {
        console.error('加载文章失败:', err);
        setLoading(false);
      }
    };
    setTimeout(() => {
      console.log("延迟了 1 秒。");
      fetchArticles();
    }, "1000");
    fetchArticles();
  }, []);

  // 过滤文章
  const filteredArticles = 
  articles.filter(article => 
    article.content && article.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 文章列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <Link
            to={`/article/${article.id}`}
            key={article.id}
            className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6 relative">
              <h3 className="text-xl font-semibold mb-2 flex items-center">
                <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-500" />
                文档 {article.title || article.id}
              </h3>
              {
                article.tagObject.indexOf("+") !== -1 ? (
                  <div className="absolute top-4 right-4 flex gap-2">
                    {Object.entries(article.tagObject.split('+')).map(([key, value], index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                        {value}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 flex gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                          {article.tagObject}
                    </span>
                  </div>
                )
              }
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

      {filteredArticles.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          没有找到相关文章
        </div>
      )}
    </div>
  );
};

export default ArticleList; 

