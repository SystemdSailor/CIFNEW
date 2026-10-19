import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBook,
  faUser,
  faClock,
  faBuilding,
  faTimes,
  faFolderOpen,
  faPlus,
  faTrash,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AsyncBase64Image from '../ui/AsyncBase64Image';
import { useSearch } from '../../context/SearchContext';
import { fetchMockArticles } from '../data/mockArticles';
import { v4 as uuidv4 } from 'uuid';
import signatureService from '../../services/signatureService';
import documentService from '../../services/documentService';
import { syncMonthlyToIndexedDB } from '../../services/orbitUpdateService';
import { useSensitiveWordFilter } from '../../services/sensitiveWordService';

// 统一从文档对象解析分类展示文案
const getCategoryLabel = (doc) => {
  const cat = doc && doc.category;
  if (typeof cat === 'object' && cat !== null) {
    return cat.label || cat.type || '未分类';
  }
  return cat || '未分类';
};

// ==================== 我的文档详情弹窗（独立实现） ====================
const MyDocumentModal = ({ document: doc, onClose }) => {
  const { filter } = useSensitiveWordFilter();
  const filteredTitle = filter(doc.title);
  const filteredContent = filter(doc.content);

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
              <span>{doc.author || '匿名'}</span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faClock} className="mr-2 text-blue-500" />
              <span>
                {doc.timestamp ? new Date(doc.timestamp).toLocaleString() : '—'}
              </span>
            </div>
            <div className="flex items-center">
              <FontAwesomeIcon icon={faBuilding} className="mr-2 text-blue-500" />
              <span>{getCategoryLabel(doc)}</span>
            </div>
          </div>
        </div>

        {/* 内容（可滚动） */}
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

// ==================== 我的文档列表 ====================
const MyDocuments = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const { searchQuery } = useSearch();
  const mountedRef = useRef(true);

  // 加载「我的文档」：先把当月 OrbitDB 数据同步到 IndexedDB，
  // 再读取全部文档（fetchMockArticles 会过滤 category.type==='del' 的删除标记），
  // 仅保留当前用户 owner 的文档
  const loadMyDocuments = useCallback(async () => {
    try {
      setLoading(true);

      // 1. 同步当月 OrbitDB 数据到 IndexedDB（容错），
      //    保证刚保存（尚未被启动时同步拉取）的文档也能立刻显示
      try {
        await syncMonthlyToIndexedDB();
      } catch (syncErr) {
        console.error('OrbitDB 月度同步失败（继续加载本地列表）:', syncErr.message);
      }

      // 2. 获取当前浏览器用户的签名公钥（身份标识）
      const pubKey = await signatureService.getCurrentPublicKey();

      // 3. 获取全部文档（IndexedDB 记录 + mock），仅保留当前用户 owner 的文档
      const all = await fetchMockArticles();
      const mine = all.filter(
        (article) => article.owner && article.owner.publicKey === pubKey
      );

      console.log(`MyDocuments - 全部 ${all.length} 条，当前用户 owner ${mine.length} 条`);
      if (mountedRef.current) setDocuments(mine);
    } catch (err) {
      console.error('加载我的文档失败:', err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    loadMyDocuments();
    return () => {
      mountedRef.current = false;
    };
  }, [loadMyDocuments]);

  // 删除文档：与 QA 的 category.type==='ans' 关联机制类似，
  // 在同数据库写入 category.type==='del' 删除标记（label 指向被删文档的 cid），
  // 读取端 fetchMockArticles() 识别该标记后过滤掉被删除文章
  const handleDeleteDocument = async (doc, e) => {
    e.stopPropagation();
    const targetId = doc.cid || doc.id;
    const displayName = doc.title || targetId;
    if (!window.confirm(`确定要删除文档「${displayName}」吗？删除后将不再显示。`)) {
      return;
    }

    setDeletingId(targetId);
    try {
      // content 为对目标 cid 的数字签名（证明删除请求由文档 owner 发起）
      const sig = await signatureService.signContent(targetId);

      const result = await documentService.save({
        id: uuidv4(),
        title: `删除:${displayName}`,
        content: sig.signature,
        tags: [],
        category: { type: 'del', label: targetId },
        isPublic: false,
        companyId: doc.companyId,
        author: doc.author || '匿名',
        owner: doc.owner,
      });

      if (result.success) {
        console.log(`删除标记已写入，目标: ${targetId} (删除标记 cid: ${result.cid})`);
        // 本地先立即移除，再重新同步加载（读取端会过滤删除标记及其目标）
        setDocuments((prev) => prev.filter((d) => (d.cid || d.id) !== targetId));
        loadMyDocuments();
      } else {
        window.alert(`删除失败：${result.message || '未知错误'}`);
      }
    } catch (err) {
      console.error('删除文档失败:', err);
      window.alert(`删除失败：${err.message || '未知错误'}`);
    } finally {
      setDeletingId(null);
    }
  };

  // 按搜索关键词过滤（标题 / 内容）
  const filteredDocuments = documents.filter((doc) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (doc.title && doc.title.toLowerCase().includes(q)) ||
      (doc.content && doc.content.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="w-full p-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <FontAwesomeIcon icon={faFolderOpen} className="mr-3 text-blue-500" />
          我的文档
          <span className="ml-3 text-sm font-normal text-gray-500">
            （共 {filteredDocuments.length} 篇）
          </span>
        </h1>
        <button
          onClick={() => navigate('/')}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          新建文档
        </button>
      </div>

      {/* 文档列表 */}
      {filteredDocuments.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id || doc.cid}
              onClick={() => setSelectedDoc(doc)}
              className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="p-6 relative">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold flex items-center min-w-0">
                    <FontAwesomeIcon icon={faBook} className="mr-2 text-blue-500 flex-shrink-0" />
                    <span className="truncate">文档 {doc.title || doc.id}</span>
                  </h3>
                  <button
                    onClick={(e) => handleDeleteDocument(doc, e)}
                    disabled={deletingId !== null}
                    title="删除文档"
                    className="flex-shrink-0 ml-3 w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-40"
                  >
                    {deletingId === (doc.cid || doc.id) ? (
                      <FontAwesomeIcon icon={faSpinner} spin />
                    ) : (
                      <FontAwesomeIcon icon={faTrash} />
                    )}
                  </button>
                </div>
                <div className="text-gray-600 mb-4 line-clamp-3">
                  {doc.content}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faBuilding} className="mr-1" />
                    <span>{getCategoryLabel(doc)}</span>
                  </div>
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faClock} className="mr-1" />
                    <span>
                      {doc.timestamp ? new Date(doc.timestamp).toLocaleDateString() : '—'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center bg-white rounded-lg shadow-md py-16">
          <FontAwesomeIcon icon={faFolderOpen} className="text-5xl text-gray-300 mb-4" />
          <div className="text-lg text-gray-600 mb-2">
            你还没有保存过文档
          </div>
          <div className="text-sm text-gray-400 mb-6">
            去编辑器创建一篇文档，它就会以你的 owner 签名出现在这里
          </div>
        </div>
      )}

      {/* 详情弹窗 */}
      {selectedDoc && (
        <MyDocumentModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};

export default MyDocuments;
