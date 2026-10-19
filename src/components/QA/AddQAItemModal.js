import React, { useRef, useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faComments,
  faLightbulb,
  faPaperPlane,
  faSpinner,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';

/**
 * 添加评论 / 实用建议弹窗
 *
 * 通过 category 关联到所属问题（label 由父组件写入问题 cid）：
 * - 评论：  category: { type: 'ans-com', label: <问题cid> }
 * - 建议：  category: { type: 'ans-sug', label: <问题cid> }
 *
 * @param {boolean} isOpen - 是否显示
 * @param {'comment'|'suggestion'} mode - 弹窗模式
 * @param {function} onClose - 关闭回调
 * @param {function} onSubmit - 提交回调，参数为 { content }，返回 { success, message }
 */
const AddQAItemModal = ({ isOpen, mode = 'comment', onClose, onSubmit }) => {
  const [content, setContent] = useState('');
  const [message, setMessage] = useState(null); // 提交提示 { type, content }
  const [isSubmitting, setIsSubmitting] = useState(false); // 提交中状态
  const closeTimerRef = useRef(null);

  const isComment = mode === 'comment';
  const title = isComment ? '添加评论' : '添加实用建议';
  const icon = isComment ? faComments : faLightbulb;
  const placeholder = isComment
    ? '分享你的看法、经验或补充信息…'
    : '给提问者一条可操作、可落地的实用建议…';

  // 组件卸载时清理自动关闭定时器
  useEffect(() => () => clearTimeout(closeTimerRef.current), []);

  if (!isOpen) return null;

  // 关闭并重置表单
  const handleClose = () => {
    if (isSubmitting) return;
    clearTimeout(closeTimerRef.current);
    setContent('');
    setMessage(null);
    onClose && onClose();
  };

  // 提交内容：调用 onSubmit 写入真实存储（category 关联逻辑在父组件 CommonQAPage）
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setMessage({ type: 'error', content: '请填写内容后再提交。' });
      return;
    }

    if (!onSubmit) {
      setMessage({ type: 'success', content: '提交成功！' });
      setContent('');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      const result = await onSubmit({ content: content.trim() });
      if (result && result.success) {
        setMessage({ type: 'success', content: '提交成功！' });
        setContent('');
        // 成功后自动关闭（新条目会立即出现在对应卡片里）
        closeTimerRef.current = setTimeout(() => {
          setIsSubmitting(false);
          setMessage(null);
          setContent('');
          onClose && onClose();
        }, 600);
      } else {
        setMessage({ type: 'error', content: (result && result.message) || '提交失败，请稍后重试。' });
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('提交失败:', err);
      setMessage({ type: 'error', content: `提交失败：${err.message || '未知错误'}` });
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <FontAwesomeIcon icon={icon} className={`mr-2 ${isComment ? 'text-blue-500' : 'text-purple-500'}`} />
            {title}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        {/* 弹窗内容 */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {isComment ? '评论内容' : '建议内容'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                rows={5}
                autoFocus
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-y"
              />
              <p className="mt-1 text-xs text-gray-400">
                {isComment
                  ? '评论将通过 cid 关联到当前问题，发布后立即显示在评论区。'
                  : '建议将通过 cid 关联到当前问题，发布后立即显示在实用建议区。'}
              </p>
            </div>

            {/* 提交提示 */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message.content}
              </div>
            )}
          </div>

          {/* 弹窗底部按钮 */}
          <div className="flex items-center justify-end gap-3 p-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center px-4 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 ${
                isComment ? 'bg-blue-600 hover:bg-blue-700' : 'bg-purple-600 hover:bg-purple-700'
              }`}
            >
              {isSubmitting ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
                  提交中...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                  {isComment ? '提交评论' : '提交建议'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddQAItemModal;

