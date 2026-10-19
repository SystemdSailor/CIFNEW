import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faUser, faClock, faPencilAlt, faChevronDown, faChevronUp, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { v4 as uuidv4 } from 'uuid';
import documentService from '../../services/documentService';

const QACard = ({ article, onClick, answers = [], onAnswerSubmitted = () => {} }) => {
  const [showAnswers, setShowAnswers] = useState(false);
  const [showAnswerModal, setShowAnswerModal] = useState(false);
  const [answerContent, setAnswerContent] = useState('');
  const [answerAuthor, setAnswerAuthor] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', content: '' });
  // 长按防误触状态
  const pressTimerRef = useRef(null);
  const [pressing, setPressing] = useState(null);        // 当前长按的值: '是' | '否' | null
  const [pressProgress, setPressProgress] = useState(0); // 长按进度 0-100

  // 从 qa 文章的 content 中提取问题标题
  const extractQATitle = (content) => {
    const match = content.match(/## 📌 问题标题\n\n([^#\n]+)/);
    return match ? match[1].trim() : null;
  };

  // 从 qa 文章的 content 中提取问题描述
  const extractQADescription = (content) => {
    const match = content.match(/## 📝 问题描述\n\n([^#]+)/);
    return match ? match[1].trim().substring(0, 200) : null;
  };

  // 从 qa 文章的 content 中提取问题类型
  const extractQAType = (content) => {
    const match = content.match(/- \*\*问题类型\*\*: ([^\n]+)/);
    return match ? match[1].trim() : null;
  };

  const qaTitle = extractQATitle(article.content);
  const qaDesc = extractQADescription(article.content);
  const qaType = extractQAType(article.content);

  const handleWriteAnswer = (e) => {
    e.stopPropagation();
    setAnswerContent('');
    setAnswerAuthor('');
    setSaveMessage({ type: '', content: '' });
    setShowAnswerModal(true);
  };

  const handleSaveAnswer = async () => {
    if (!answerContent.trim()) {
      setSaveMessage({ type: 'error', content: '回答内容不能为空' });
      return;
    }

    setIsSaving(true);
    setSaveMessage({ type: '', content: '' });

    try {
      const result = await documentService.save({
        id: uuidv4(),
        title: `A:${qaTitle || article.title || article.id}`,
        content: answerContent,
        tags: [],
        category: { type: 'ans', label: article.cid },
        isPublic: true,
        companyId: article.companyId,
        author: answerAuthor.trim() || '匿名',
      });

      if (result.success) {
        setSaveMessage({ type: 'success', content: '回答提交成功！' });
        setTimeout(() => {
          setShowAnswerModal(false);
          setAnswerContent('');
          setAnswerAuthor('');
          onAnswerSubmitted();
        }, 1000);
      } else {
        setSaveMessage({ type: 'error', content: result.message || '保存失败' });
      }
    } catch (err) {
      console.error('保存回答失败:', err);
      setSaveMessage({ type: 'error', content: `保存失败：${err.message || '未知错误'}` });
    } finally {
      setIsSaving(false);
    }
  };

  // 提交「是/否」快捷回答（用于 qa-tf 类型问题）
  const handleYesNoAnswer = async (value) => {
    if (isSaving) return;
    setIsSaving(true);
    try {
      const result = await documentService.save({
        id: uuidv4(),
        title: `A:${qaTitle || article.title || article.id}`,
        content: value,
        tags: [],
        category: { type: 'ans', label: article.cid },
        isPublic: true,
        companyId: article.companyId,
        author: '匿名',
      });

      if (result.success) {
        onAnswerSubmitted();
      } else {
        console.error('提交是/否回答失败:', result.message);
      }
    } catch (err) {
      console.error('提交是/否回答失败:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // ===== 长按防误触逻辑（是/否按钮需长按 3 秒才提交） =====
  const PRESS_DURATION = 3000; // 3 秒

  const startPressTimer = (value) => {
    if (isSaving) return;
    cancelPressTimer();
    setPressing(value);
    setPressProgress(0);
    const startTime = Date.now();
    pressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / PRESS_DURATION) * 100, 100);
      setPressProgress(progress);
      if (elapsed >= PRESS_DURATION) {
        clearInterval(pressTimerRef.current);
        pressTimerRef.current = null;
        setPressing(null);
        setPressProgress(0);
        handleYesNoAnswer(value);
      }
    }, 50);
  };

  const cancelPressTimer = () => {
    if (pressTimerRef.current) {
      clearInterval(pressTimerRef.current);
      pressTimerRef.current = null;
    }
    setPressing(null);
    setPressProgress(0);
  };

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearInterval(pressTimerRef.current);
      }
    };
  }, []);

  const handleCloseModal = () => {
    if (answerContent.trim() && !window.confirm('回答尚未保存，确定要关闭吗？')) {
      return;
    }
    setShowAnswerModal(false);
    setAnswerContent('');
    setAnswerAuthor('');
    setSaveMessage({ type: '', content: '' });
  };

  return (
    <div className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-purple-500">
      <div
        onClick={() => {onClick(article);console.log("QACard 参数：",article)}}
        className="p-6 relative cursor-pointer"
      >
        <h3 className="text-xl font-semibold mb-2 flex items-center text-purple-700">
          <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-purple-500" />
          {qaTitle || article.title || article.id}
        </h3>
        <div className="absolute top-4 right-4 flex gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs rounded-full">
            问答
          </span>
          {qaType && (
            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
              {qaType}
            </span>
          )}
        </div>
        <div className="text-gray-600 mb-4 line-clamp-3">
          {qaDesc || article.content}
        </div>
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div className="flex items-center">
            <FontAwesomeIcon icon={faUser} className="mr-1" />
            <span>{article.author || '匿名'}</span>
          </div>
          <div className="flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-1" />
            <span>{new Date(article.timestamp).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="px-6 pb-4 flex flex-wrap gap-2">
        {article.category?.type === 'qa-tf' && (
          <>
            <button
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                startPressTimer('是');
              }}
              onTouchStart={(e) => { e.stopPropagation(); startPressTimer('是'); }}
              onMouseUp={cancelPressTimer}
              onMouseLeave={cancelPressTimer}
              onTouchEnd={cancelPressTimer}
              onTouchCancel={cancelPressTimer}
              onClick={(e) => e.stopPropagation()}
              disabled={isSaving}
              className="relative flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 overflow-hidden select-none"
            >
              {pressing === '是' && (
                <span
                  className="absolute inset-y-0 left-0 bg-white/40"
                  style={{ width: `${pressProgress}%` }}
                />
              )}
              <span className="relative">是</span>
            </button>
            <button
              onMouseDown={(e) => {
                if (e.button !== 0) return;
                e.preventDefault();
                e.stopPropagation();
                startPressTimer('否');
              }}
              onTouchStart={(e) => { e.stopPropagation(); startPressTimer('否'); }}
              onMouseUp={cancelPressTimer}
              onMouseLeave={cancelPressTimer}
              onTouchEnd={cancelPressTimer}
              onTouchCancel={cancelPressTimer}
              onClick={(e) => e.stopPropagation()}
              disabled={isSaving}
              className="relative flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 overflow-hidden select-none"
            >
              {pressing === '否' && (
                <span
                  className="absolute inset-y-0 left-0 bg-white/40"
                  style={{ width: `${pressProgress}%` }}
                />
              )}
              <span className="relative">否</span>
            </button>
          </>
        )}
        <button
          onClick={handleWriteAnswer}
          className="flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
        >
          <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
          写回答
        </button>
      </div>

      {/* 答案列表（可折叠） */}
      {answers.length > 0 && (
        <div className="border-t border-gray-200">
          <button
            onClick={(e) => { e.stopPropagation(); setShowAnswers(!showAnswers); }}
            className="w-full flex items-center justify-between px-6 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm text-gray-700 font-medium"
          >
            <span className="flex items-center">
              <FontAwesomeIcon icon={faQuestionCircle} className="mr-2 text-purple-500" />
              回答 ({answers.length})
            </span>
            <FontAwesomeIcon icon={showAnswers ? faChevronUp : faChevronDown} className="text-gray-400" />
          </button>
          {showAnswers && (
            <div className="px-6 py-4 bg-gray-50 space-y-3">
              {answers.map((answer) => (
                <div key={answer.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <FontAwesomeIcon icon={faUser} className="mr-1" />
                      <span>{answer.author || '匿名'}</span>
                      <FontAwesomeIcon icon={faClock} className="ml-3 mr-1" />
                      <span>{new Date(answer.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {answer.content}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 写回答弹窗 */}
      {showAnswerModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
        >
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <FontAwesomeIcon icon={faPencilAlt} className="mr-2 text-purple-500" />
                写回答
              </h2>
              <button
                onClick={handleCloseModal}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>

            {/* 弹窗内容 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* 问题标题（只读提示） */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-700">
                  <span className="font-medium">回答问题：</span>
                  {qaTitle || article.title || article.id}
                </p>
              </div>

              {/* 作者输入 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  作者 <span className="text-gray-400">（可选）</span>
                </label>
                <input
                  type="text"
                  value={answerAuthor}
                  onChange={(e) => setAnswerAuthor(e.target.value)}
                  placeholder="输入作者名，留空为匿名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                />
              </div>

              {/* 回答编辑器 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  回答内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="输入你的回答，支持 Markdown 格式..."
                  rows={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm resize-vertical font-mono"
                />
                <p className="mt-1 text-xs text-gray-400">支持 Markdown 格式</p>
              </div>

              {/* 保存消息 */}
              {saveMessage.content && (
                <div className={`p-3 rounded-lg text-sm ${
                  saveMessage.type === 'success'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {saveMessage.content}
                </div>
              )}
            </div>

            {/* 弹窗底部按钮 */}
            <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCloseModal}
                disabled={isSaving}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                取消
              </button>
              <button
                onClick={handleSaveAnswer}
                disabled={isSaving}
                className="flex items-center px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:bg-purple-400"
              >
                {isSaving ? (
                  <>
                    <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                    提交中...
                  </>
                ) : (
                  <>
                    <FontAwesomeIcon icon={faPencilAlt} className="mr-2" />
                    提交回答
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QACard;
