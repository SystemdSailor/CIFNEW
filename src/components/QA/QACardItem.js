import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGavel,
  faChevronDown,
  faChevronUp,
  faLightbulb,
  faComments,
  faUser,
  faPlus,
} from '@fortawesome/free-solid-svg-icons';
import { getChapterName, getQuestionChapterId } from '../data/lawQA';

// 从 qa 文章的 content 中提取问题标题（兼容 QAEditor/QACard 保存的 qa 文章格式）
const extractQATitle = (content) => {
  if (!content) return null;
  const match = content.match(/## 📌 问题标题\n\n([^#\n]+)/);
  return match ? match[1].trim() : null;
};

// ==================== 单条问答卡片 ====================
// 采用 QAcard 方式的数据组织：
// - article 为问题（静态 LAW_QA_QUESTIONS 或动态 qa-com 文章，均有 cid 标记）
// - answers / suggestions 通过 category.label 链接到问题的 cid
//   （对应 ALLArticles.getAnswersForQuestion 的配对规则）
const QACardItem = ({
  article = {},
  answers = [],
  suggestions = [],
  onAddComment,
  onAddSuggestion,
}) => {
  const [expanded, setExpanded] = useState(false);

  // 问题标题：优先 question，其次 title，再兼容从 content 提取
  const question = article.question || article.title || extractQATitle(article.content) || article.id;
  // 章节：静态问题自带 chapter 字段；qa-com 动态问题章节名存于 tags[0] / tagObject
  const chapterName = getChapterName(getQuestionChapterId(article));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* 问题标题（点击展开/收起） */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start justify-between gap-3 p-5 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center mt-0.5">
            <FontAwesomeIcon icon={faGavel} className="text-indigo-500 text-lg" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base md:text-lg font-semibold text-gray-900 leading-snug">
              {question}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                {chapterName || '其他'}
              </span>
              {article.cid && (
                <span className="px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full font-mono">
                  {article.cid}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 mt-1">
          <FontAwesomeIcon
            icon={expanded ? faChevronUp : faChevronDown}
            className={`text-gray-400 transition-colors ${expanded ? 'text-indigo-500' : ''}`}
          />
        </div>
      </button>

      {/* 展开详情 */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/50">
          {/* 评论区（answers 通过 cid 链接到问题，每条回答独立成条） */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FontAwesomeIcon icon={faComments} className="text-gray-500" />
              <h4 className="text-sm font-bold text-gray-700">评论区</h4>
              {answers.length > 0 && (
                <span className="text-xs text-gray-400">{answers.length} 条回答</span>
              )}
              {onAddComment && (
                <button
                  type="button"
                  onClick={() => onAddComment(article)}
                  title="添加评论"
                  className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                  评论
                </button>
              )}
            </div>
            {answers.length > 0 ? (
              <div className="space-y-4">
                {answers.map((ans) => (
                  <div key={ans.id || ans.cid} className="flex gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                      <FontAwesomeIcon icon={faUser} className="text-gray-500 text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="text-sm font-semibold text-gray-800">
                          {ans.author || '网友'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">{ans.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">暂无回答，快来抢答吧～</p>
            )}
          </div>

          {/* 实用建议（通过 cid 链接到问题） */}
          <div className="bg-white rounded-lg border border-purple-100 p-4">
            <div className="flex items-center gap-2 mb-2">
              <FontAwesomeIcon icon={faLightbulb} className="text-purple-500" />
              <h4 className="text-sm font-bold text-purple-700">💡 实用建议</h4>
              {suggestions.length > 0 && (
                <span className="text-xs text-gray-400">{suggestions.length} 条建议</span>
              )}
              {onAddSuggestion && (
                <button
                  type="button"
                  onClick={() => onAddSuggestion(article)}
                  title="添加实用建议"
                  className="ml-auto flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors"
                >
                  <FontAwesomeIcon icon={faPlus} className="text-[10px]" />
                  建议
                </button>
              )}
            </div>
            {suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((sug) => (
                  <p key={sug.id || sug.cid} className="text-sm text-gray-700 leading-relaxed">
                    {sug.content}
                  </p>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">暂无建议</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QACardItem;
