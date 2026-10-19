import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faUser, faClock, faBuilding, faPaperclip} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import gunService from '../../services/gunDB';

const ArticleDetail = () => {
  const { id } = useParams();
  const location = useLocation();// useLocation() 是 React Router （版本 6）提供的一个 Hook，它的作用是获取当前路由的 location 对象。
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 如果从列表页通过 state 传递了文章数据，直接使用
    if (location.state && location.state.article) {
      setArticle(location.state.article);
      setLoading(false);
      return;
    }

    // 否则从 GunDB 加载（适用于直接访问 URL 的情况）
    const fetchArticle = async () => {
      try {
        const articleData = await gunService.getArticleById(id);
        setArticle(articleData);
        setLoading(false);
      } catch (err) {
        console.error('加载文章失败:', err);
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, location.state]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center text-gray-500 py-10">
          文章不存在或已被删除
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link 
        to="/articles" 
        className="inline-flex items-center text-blue-500 hover:text-blue-700 mb-6"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
        返回文章列表
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold mb-4">
          文档 {article.title}
        </h1>
        
        <div className="flex items-center text-gray-500 mb-6 space-x-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            <span>{article.author || '匿名'}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-2" />
            <span>{new Date(article.timestamp).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex items-center text-gray-500 mb-6 space-x-4">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faBuilding} className="mr-2" />
          
            <span>{article.category.type || '未分类'}</span>
          </div>

          <div className="flex items-center">
            <FontAwesomeIcon icon={faPaperclip} className="mr-2" />
            {
              article.tagObject.indexOf("+") !== -1 ? (
                <div>
                  {Object.entries(article.tagObject.split('+')).map(([key, value], index) => (
                    <span> 
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-md" >   { value }  </span> &nbsp;&nbsp;
                    </span> 
                  ))}
                </div>
              ) : (
                <div>
                  <span>  {article.tagObject}     </span>
                </div>
              )
            }
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            className="markdown-body"
          >
            {article.content}
          </ReactMarkdown>
        </div>

      </div>
    </div>
  );
};

export default ArticleDetail; 