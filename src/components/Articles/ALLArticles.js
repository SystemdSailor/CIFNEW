import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBook, 
  faUser, 
  faClock,
  faBuilding,
  faTimes,
  faPaperclip,
  faQuestionCircle,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AsyncBase64Image from '../ui/AsyncBase64Image';
import { useSearch } from '../../context/SearchContext';
import { fetchMockArticles } from '../data/mockArticles';
import QACard from './QACard';
import { useSensitiveWordFilter } from '../../services/sensitiveWordService';

// ==================== 文章详情弹窗组件 ====================
const ArticleDetailModal = ({ article, onClose }) => {
  const { filter } = useSensitiveWordFilter();
  const filteredTitle = filter(article.title);
  const filteredContent = filter(article.content);

  // 点击遮罩背景关闭弹窗
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ESC 键关闭弹窗
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 头部：标题 + 关闭按钮 */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-2xl font-bold text-gray-900 truncate">
              文档 {filteredTitle}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} className="text-lg" />
          </button>
        </div>

        {/* 元数据信息 */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center">
              <FontAwesomeIcon icon={faUser} className="mr-2 text-blue-500" />
              <span>{article.author || '匿名'}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-500" />
              <span>{new Date(article.timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-500" />
              <span>{article.category.type || '未分类'}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faPaperclip} className="mr-2 text-blue-500" />
              <div className="flex flex-wrap gap-1">
                {article.tagObject.indexOf("+") !== -1 ? (
                  article.tagObject.split('+').map((tag, index) => (
                    <span key={index} className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-md">
                      {tag}
                    </span>
                  ))
                ) : (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-md">
                    {article.tagObject}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 文章内容（可滚动） */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="prose prose-slate max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              className="markdown-body"
              components={{
                img: (props) => <AsyncBase64Image {...props} />,
              }}
            >
              {filteredContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

const ALLArticles = ({ companyId }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [viewMode, setViewMode] = useState('article'); // 'article' | 'qa'
  const { searchQuery } = useSearch();

  useEffect(() => {
    const loadArticles = async () => {
      try {
        setLoading(true);
        // 从模拟 API /api/getallarticles/ 获取文章数据，传入 companyId
        const data = await fetchMockArticles(companyId);
        console.log("ALLArticles - 从模拟 API 获取文章:", data);
        setArticles(data);
      } catch (err) {
        console.error('加载文章失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [companyId]);

  // 判断文章是否为 QA 类型（包含普通问答与 是/否 问答）
  const isQAArticle = (article) => {
    const cat = article.category;
    // 对象格式: { type: 'qa', ... } 或 { type: 'qa-tf', ... }
    if (typeof cat === 'object' && cat !== null) {
      return cat.type === 'qa' || cat.type === 'qa-tf';
    }
    // 字符串格式: 包含 '问答'
    if (typeof cat === 'string') {
      return cat.includes('问答');
    }
    return false;
  };

  // 判断文章是否为答案类型
  const isAnsArticle = (article) => {
    const cat = article.category;
    if (typeof cat === 'object' && cat !== null) {
      return cat.type === 'ans';
    }
    return false;
  };

  // 过滤文章：根据搜索关键词和公司 ID 过滤
  const filteredArticles = articles.filter(article => {
    // 按搜索关键词过滤
    const matchesSearch = searchQuery === '' || (article.content && article.content.toLowerCase().includes(searchQuery.toLowerCase()));
    // 按公司 ID 精确过滤（如果传入companyId）
    const matchesCompany = !companyId || (article.companyId === companyId);
    // 按视图模式过滤：article 模式显示非QA文章，qa 模式显示 QA 问题和答案
    const matchesMode = viewMode === 'article' ? !isQAArticle(article) : (isQAArticle(article) || isAnsArticle(article));
    return matchesSearch && matchesCompany && matchesMode;
  });

  // 在 QA 视图模式下，将答案按问题 ID 分组
  const qaQuestions = viewMode === 'qa' 
    ? filteredArticles.filter(a => isQAArticle(a))
    : [];
  const qaAnswers = viewMode === 'qa'
    ? filteredArticles.filter(a => isAnsArticle(a))
    : [];
  
  // 为每个问题找到对应的答案
  const getAnswersForQuestion = (question) => {
    const questionId = question.cid || question.id;
    return qaAnswers.filter(a => {
      const cat = a.category;
      if (typeof cat === 'object' && cat !== null) {
        return cat.label === questionId;
      }
      return false;
    });
  };

  // 点击文章，弹出详情弹窗
  const handleArticleClick = (article) => {
    console.log("点击文章，弹出详情弹窗");
    setSelectedArticle(article);
  };

  // 关闭详情弹窗
  const handleCloseDetail = () => {
    setSelectedArticle(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      {/* 视图切换按钮 */}
      <div className="flex items-center mb-6 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setViewMode('article')}
          className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
            viewMode === 'article'
              ? 'bg-white text-blue-600 shadow-sm font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
          文章
        </button>
        <button
          onClick={() => setViewMode('qa')}
          className={`flex items-center px-4 py-2 text-sm rounded-md transition-colors ${
            viewMode === 'qa'
              ? 'bg-white text-purple-600 shadow-sm font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <FontAwesomeIcon icon={faQuestionCircle} className="mr-2" />
          问答
        </button>
      </div>

      {/* QA 列表 */}
      {viewMode === 'qa' && (
        <div className="grid grid-cols-1 gap-6">
          {qaQuestions.map((question) => (
            <QACard 
              key={question.id} 
              article={question} 
              onClick={handleArticleClick}
              answers={getAnswersForQuestion(question)}
              onAnswerSubmitted={() => {
                // 重新加载文章以获取最新的回答数据
                console.log('回答已提交，刷新文章列表');
                const loadArticles = async () => {
                  try {
                    setLoading(true);
                    const data = await fetchMockArticles(companyId);
                    setArticles(data);
                  } catch (err) {
                    console.error('刷新文章失败:', err);
                  } finally {
                    setLoading(false);
                  }
                };
                loadArticles();
              }}
            />
          ))}
        </div>
      )}

      {/* 普通文章列表 */}
      {viewMode === 'article' && (
        <div className="grid grid-cols-1 gap-6">
          {filteredArticles.map((article) => (
            !isQAArticle(article) && !isAnsArticle(article) && (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="p-6 relative">
                  <h3 className="text-xl font-semibold mb-2 flex items-center">
                    <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-500" />
                    文档 {article.title || article.id}
                  </h3>
                  {
                    article.tagObject && article.tagObject.indexOf("+") !== -1 ? (
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
                      <span>{article.category ? article.category.type : '未分类'}</span>
                    </div>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-1" />
                      <span>{new Date(article.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>
      )}

      {filteredArticles.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          {viewMode === 'article' ? '没有找到相关文章' : '没有找到相关问答'}
        </div>
      )}

      {/* 文章详情弹窗 */}
      {selectedArticle && (
        <ArticleDetailModal
          article={selectedArticle}
          onClose={handleCloseDetail}
        />
      )}
    </div>
  );
};

export default ALLArticles;