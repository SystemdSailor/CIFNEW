/**
 * 法律问答章节配置与查询逻辑
 *
 * 共 9 章：出行、恋爱、租房、校园、理财、职场、消费、保险、其他
 * 问答数据已独立存放于 ./QAData
 *
 * 数据采用 QAcard 方式组织：
 * - 问题（LAW_QA_QUESTIONS）用 cid 标记
 * - 回答/建议（LAW_QA_ANSWERS / LAW_QA_SUGGESTIONS）通过 category.label 链接所属问题的 cid
 * - 关联规则：category.label === (question.cid || question.id)
 */

import { LAW_QA_QUESTIONS, LAW_QA_ANSWERS, LAW_QA_SUGGESTIONS } from './QAData';

export const LAW_CHAPTERS = [
  { id: 'travel', name: '出行', icon: '🚗', color: 'bg-blue-500' },
  { id: 'love', name: '恋爱', icon: '💗', color: 'bg-pink-500' },
  { id: 'rental', name: '租房', icon: '🏠', color: 'bg-amber-500' },
  { id: 'campus', name: '校园', icon: '🎓', color: 'bg-indigo-500' },
  { id: 'finance', name: '理财', icon: '💰', color: 'bg-emerald-500' },
  { id: 'work', name: '职场', icon: '💼', color: 'bg-cyan-500' },
  { id: 'consume', name: '消费', icon: '🛍️', color: 'bg-orange-500' },
  { id: 'insurance', name: '保险', icon: '🛡️', color: 'bg-teal-500' },
  { id: 'other', name: '其他', icon: '📦', color: 'bg-gray-600' },
];

// 标题栏横列单选按钮（多选一）：首项「全部」+ 各章节，供 Navigation 与 /qa 页面共用
export const CHAPTER_TABS = [{ id: 'all', name: '全部', icon: '📚' }, ...LAW_CHAPTERS];

// 数据再导出，保持向后兼容（LAW_QA 为兼容导出的扁平结构）
export { LAW_QA } from './QAData';
export { LAW_QA_QUESTIONS, LAW_QA_ANSWERS, LAW_QA_SUGGESTIONS } from './QAData';

/**
 * 获取章节名称
 */
export const getChapterName = (chapterId) => {
  const chapter = LAW_CHAPTERS.find(c => c.id === chapterId);
  return chapter ? chapter.name : '其他';
};

/**
 * 通过章节名称反查章节 id
 * （qa-com 动态问题把章节名称存在 tags/tagObject 中，需要名称 -> id 映射）
 */
export const getChapterIdByName = (name) => {
  if (!name) return null;
  const chapter = LAW_CHAPTERS.find(c => c.name === name || c.id === name);
  return chapter ? chapter.id : null;
};

/**
 * 取问题所在章节 id
 * - 静态问题自带 chapter 字段（如 'travel'）
 * - qa-com 动态问题没有 chapter 字段，章节名存于 tags[0] / tagObject
 */
export const getQuestionChapterId = (question) => {
  if (question && question.chapter) return question.chapter;
  const tagList = (question && (question.tags || [])) || [];
  const tag = tagList[0] || String((question && question.tagObject) || '').split('+')[0] || '';
  return getChapterIdByName(tag) || null;
};

/**
 * 通过 cid 配对回答与建议（与 ALLArticles.getAnswersForQuestion 的规则一致）
 * @param {Object} question - 问题（需有 cid 或 id）
 * @param {Object} [options]
 * @param {Array} [options.answers] - 回答池（默认静态 LAW_QA_ANSWERS，可传入合并后的动态回答）
 * @param {Array} [options.suggestions] - 建议池（默认静态 LAW_QA_SUGGESTIONS）
 * @returns {{ answers: Array, suggestions: Array }}
 */
export const getRelatedForQuestion = (question, { answers = LAW_QA_ANSWERS, suggestions = LAW_QA_SUGGESTIONS } = {}) => {
  const questionId = question.cid || question.id;
  const match = (item) => {
    const cat = item && item.category;
    return typeof cat === 'object' && cat !== null && cat.label === questionId;
  };
  return {
    answers: answers.filter(match),
    suggestions: suggestions.filter(match),
  };
};

/**
 * 按章节分组（返回问题列表）
 */
export const getQAByChapter = (chapterId) => {
  return LAW_QA_QUESTIONS.filter(qa => getQuestionChapterId(qa) === chapterId);
};

/**
 * 全文搜索：匹配问题本身，以及通过 cid 关联的回答与建议
 */
export const searchQA = (keyword) => {
  if (!keyword || !keyword.trim()) return LAW_QA_QUESTIONS;
  const kw = keyword.trim().toLowerCase();

  return LAW_QA_QUESTIONS.filter(qa => {
    const { answers, suggestions } = getRelatedForQuestion(qa);
    return (
      (qa.question || '').toLowerCase().includes(kw) ||
      answers.some(a => (a.content || '').toLowerCase().includes(kw)) ||
      suggestions.some(s => (s.content || '').toLowerCase().includes(kw))
    );
  });
};
