import React, { useState, useMemo, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faSignInAlt,
  faLightbulb,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { LAW_QA_QUESTIONS, LAW_QA_ANSWERS, LAW_QA_SUGGESTIONS } from '../data/QAData';
import { LAW_CHAPTERS, getChapterName, getQuestionChapterId, getRelatedForQuestion } from '../data/lawQA';
import { fetchMockArticles } from '../data/mockArticles';
import AskQuestionModal from './AskQuestionModal';
import AddQAItemModal from './AddQAItemModal';
import QACardItem from './QACardItem';
import ChapterWidgetSlot, { ChapterWidgetToggle } from './ChapterWidgetSlot';
import documentService from '../../services/documentService';
import { useQaChapter } from '../../context/QaChapterContext';

// ==================== 主页面 ====================
const CommonQAPage = () => {
  // 章节状态由标题栏（Navigation）的横列单选按钮驱动，经 Context 共享；'all' 表示不按章节过滤
  const { activeChapter, version, setActiveChapter } = useQaChapter();
  const [searchKeyword, setSearchKeyword] = useState(''); // 已提交的搜索关键词（点击“搜索问题”后更新）
  const [searchInput, setSearchInput] = useState(''); // 输入框草稿（打字时不触发搜索）
  const [askMenuOpen, setAskMenuOpen] = useState(false); // 胶囊按钮下拉菜单开关
  const capsuleRef = useRef(null);
  const skipChapterSyncRef = useRef(false); // 搜索提交会把章节归零，用它跳过随之而来的清空
  const [askModalOpen, setAskModalOpen] = useState(false); // “提问题”弹窗开关
  const [addItemModal, setAddItemModal] = useState(null); // 评论/建议弹窗：{ mode: 'ans-com'|'ans-sug', article }
  const [chapterWidgetView, setChapterWidgetView] = useState('qa'); // 「保险」章节配套工具视图：'qa' | 'calculator'

  // 点击下拉菜单外部时自动关闭
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (capsuleRef.current && !capsuleRef.current.contains(e.target)) {
        setAskMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 标题栏点击章节胶囊时清除页面内的搜索态（搜索与章节互斥）；重复点击同一胶囊也会触发（version 变化）
  useEffect(() => {
    // 章节/版本变化即把「保险」配套工具复位到问答视图（放在提前 return 之前，搜索归零也生效）
    setChapterWidgetView('qa');
    if (skipChapterSyncRef.current) {
      skipChapterSyncRef.current = false;
      return;
    }
    setSearchKeyword('');
    setSearchInput('');
  }, [activeChapter, version]);

  // 左侧“搜索问题”按钮：提交搜索关键词，点击后才显示搜索结果
  const handleSearch = () => {
    setAskMenuOpen(false);
    if (activeChapter !== 'all') {
      // 章节归零会触发上面的 effect 清空搜索，这里打标记跳过，避免刚提交的关键词被清掉
      skipChapterSyncRef.current = true;
      setActiveChapter('all'); // 搜索面向全部章节，避免章节胶囊停留在旧的高亮态
    }
    setSearchKeyword(searchInput.trim());
  };

  // 右侧下拉箭头：切换下拉菜单
  const toggleAskMenu = () => {
    setAskMenuOpen(prev => !prev);
  };

  // 下拉中的“提问题”按钮：打开提问弹窗
  const handleAskClick = () => {
    setAskMenuOpen(false);
    setAskModalOpen(true);
  };

  // 动态问答（用户提交的 qa-com 问题 + 通过 cid 关联的回答/建议，存于 IndexedDB/IPFS）
  const [dynamicQA, setDynamicQA] = useState({ questions: [], answers: [], suggestions: [] });
  const [qaLoading, setQaLoading] = useState(true);

  // 从 fetchMockArticles（IndexedDB + mock）中筛出问答相关文章
  const loadDynamicQA = async () => {
    setQaLoading(true);
    try {
      const articles = await fetchMockArticles();
      const catType = (a) => (a && a.category && typeof a.category === 'object' ? a.category.type : null);
      setDynamicQA({
        questions: articles.filter((a) => catType(a) === 'qa-com'),
        // 评论区 = 静态回答 + 动态 ans / ans-com（用户通过“评论”按钮新增，label 指向问题 cid）
        answers: articles.filter((a) => catType(a) === 'ans' || catType(a) === 'ans-com'),
        // 实用建议 = 静态建议 + 动态 sug / ans-sug（用户通过“建议”按钮新增，label 指向问题 cid）
        suggestions: articles.filter((a) => catType(a) === 'sug' || catType(a) === 'ans-sug'),
      });
    } catch (err) {
      console.error('CommonQAPage - 加载用户提问失败:', err);
    } finally {
      setQaLoading(false);
    }
  };

  useEffect(() => {
    loadDynamicQA();
  }, []);

  // 提问题弹窗提交：写入问答文章（category.type = 'qa-com'，tags 记录所属分区），成功后刷新列表
  const handleAskSubmit = async ({ title, content, chapter }) => {
    const result = await documentService.save({
      id: uuidv4(),
      title: title.trim(),
      content: content.trim(),
      tags: chapter ? [chapter] : [],
      category: { type: 'qa-com', label: '问答' },
      isPublic: true,
    });
    if (result && result.success) {
      await loadDynamicQA();
    }
    return result;
  };

  // 打开评论/建议弹窗（QACardItem 传入被操作的问题）
  const handleAddComment = (article) => setAddItemModal({ mode: 'ans-com', article });
  const handleAddSuggestion = (article) => setAddItemModal({ mode: 'ans-sug', article });

  // 提交评论/建议：category.type 区分 ans-com / ans-sug，label 指向问题的 cid（cid 兜底用 id）
  const handleAddItemSubmit = async ({ content }) => {
    if (!addItemModal) return { success: false, message: '缺少关联的问题信息' };
    const { mode, article } = addItemModal;
    const questionCid = article.cid || article.id;
    if (!questionCid) {
      return { success: false, message: '问题缺少 cid，无法关联评论/建议' };
    }
    const result = await documentService.save({
      id: uuidv4(),
      title: mode === 'ans-com' ? '评论' : '建议',
      content: content.trim(),
      tags: [],
      category: { type: mode, label: questionCid },
      isPublic: true,
    });
    if (result && result.success) {
      await loadDynamicQA();
    }
    return result;
  };

  // 合并静态问题与用户动态提问（qa-com）
  const allQuestions = useMemo(
    () => [...LAW_QA_QUESTIONS, ...dynamicQA.questions],
    [dynamicQA.questions]
  );
  // 回答/建议池：静态 LAW_QA_ANSWERS/LAW_QA_SUGGESTIONS + 动态 ans/ans-com、sug/ans-sug 文章，均通过 category.label 链接问题 cid
  const answerPool = useMemo(() => [...LAW_QA_ANSWERS, ...dynamicQA.answers], [dynamicQA.answers]);
  const suggestionPool = useMemo(
    () => [...LAW_QA_SUGGESTIONS, ...dynamicQA.suggestions],
    [dynamicQA.suggestions]
  );

  // 搜索过滤：匹配问题本身，以及通过 cid 关联的回答与建议
  const filteredAll = useMemo(() => {
    if (!searchKeyword.trim()) return [];
    const kw = searchKeyword.trim().toLowerCase();

    return allQuestions.filter(qa => {
      const { answers, suggestions } = getRelatedForQuestion(qa, {
        answers: answerPool,
        suggestions: suggestionPool,
      });
      return (
        (qa.question || qa.title || '').toLowerCase().includes(kw) ||
        answers.some(a => (a.content || '').toLowerCase().includes(kw)) ||
        suggestions.some(s => (s.content || '').toLowerCase().includes(kw))
      );
    });
  }, [searchKeyword, allQuestions, answerPool, suggestionPool]);

  // 当前章节的问答（章节 id：静态问题取 chapter 字段，qa-com 动态问题从 tags/tagObject 解析章节名称）
  const currentQAs = useMemo(() => {
    if (searchKeyword.trim()) return filteredAll;
    if (activeChapter === 'all') return allQuestions;
    return allQuestions.filter(qa => getQuestionChapterId(qa) === activeChapter);
  }, [activeChapter, searchKeyword, filteredAll, allQuestions]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部吸顶搜索栏：紧贴吸顶导航栏之下（top 由 --nav-h 提供），始终可见，随时可搜 */}
      <div
        className="sticky z-40 bg-white/95 backdrop-blur border-b border-gray-200 shadow-sm"
        style={{ top: 'var(--nav-h, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            {/* 搜索框 */}
            <div className="relative flex-1 min-w-0">
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
                placeholder="搜索问题、案例或建议关键词，如：社保、公积金、人才公寓..."
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 text-sm outline-none transition focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {/* Quora 风格胶囊按钮：蓝色胶囊 + 白色文字 + 深蓝分隔线 + 下拉箭头 */}
            <div ref={capsuleRef} className="relative flex-shrink-0">
              <div className="inline-flex items-center overflow-hidden rounded-full bg-blue-600 shadow-sm hover:bg-blue-700 transition-colors">
                {/* 左侧：搜索问题 */}
                <button
                  type="button"
                  onClick={handleSearch}
                  title="搜索问题"
                  className="px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  搜索问题
                </button>

                {/* 中间：深蓝分隔线 */}
                <span className="w-px h-6 bg-blue-800" aria-hidden="true" />

                {/* 右侧：下拉箭头 */}
                <button
                  type="button"
                  onClick={toggleAskMenu}
                  title="更多操作"
                  aria-expanded={askMenuOpen}
                  aria-haspopup="true"
                  className={`px-3 py-3 text-white transition-colors ${
                    askMenuOpen ? 'bg-blue-800' : 'hover:bg-blue-700'
                  }`}
                >
                  <FontAwesomeIcon
                    icon={faChevronDown}
                    className={`text-xs transition-transform ${askMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>
              </div>

              {/* 下拉菜单 */}
              {askMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border border-gray-200 py-1.5 z-50">
                  <button
                    type="button"
                    onClick={handleAskClick}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors text-left"
                  >
                    <FontAwesomeIcon icon={faLightbulb} className="text-blue-500 text-sm" />
                    提问题
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 分区说明 */}
        {!searchKeyword.trim() && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">
              {activeChapter === 'all'
                ? '📚 全部问答'
                : `${LAW_CHAPTERS.find(c => c.id === activeChapter)?.icon || ''} ${getChapterName(activeChapter)}专题`}
            </h2>
            <span className="text-sm text-gray-400">
              — 共 {currentQAs.length} 个问答
            </span>
            {/* 章节配套工具的视图切换：与「分区说明」并列同行（仅「保险」章节） */}
            {activeChapter === 'insurance' && (
              <ChapterWidgetToggle
                value={chapterWidgetView}
                onChange={setChapterWidgetView}
              />
            )}
          </div>
        )}

        {/* 搜索结果提示 */}
        {searchKeyword.trim() && (
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-lg font-bold text-gray-800">🔍 搜索结果</h2>
            <span className="text-sm text-gray-400">
              关键词 " {searchKeyword} " 共 {currentQAs.length} 条
            </span>
            <button
              onClick={() => {
                setSearchKeyword('');
                setSearchInput('');
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              清除搜索
            </button>
          </div>
        )}

        {/* 章节配套工具：内容插槽（受控），「保险」章节按视图显示问答或社保养老金计算器 */}
        <ChapterWidgetSlot activeChapter={activeChapter} view={chapterWidgetView}>
          {/* 问答列表 */}
          <div className="space-y-4" data-testid="qa-list">
            {qaLoading ? (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin mb-3" />
                <p className="text-gray-400">正在加载问答...</p>
              </div>
            ) : currentQAs.length > 0 ? (
              currentQAs.map((qa) => {
                // 通过 cid 配对回答与建议（静态与动态问答统一处理）
                const { answers, suggestions } = getRelatedForQuestion(qa, {
                  answers: answerPool,
                  suggestions: suggestionPool,
                });
                return (
                  <QACardItem
                    key={qa.id || qa.cid}
                    article={qa}
                    answers={answers}
                    suggestions={suggestions}
                    onAddComment={handleAddComment}
                    onAddSuggestion={handleAddSuggestion}
                  />
                );
              })
            ) : (
              <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500">
                  {searchKeyword.trim()
                    ? '未找到相关问答，换个关键词试试'
                    : '该分类下暂无问答，试试其他分类'}
                </p>
              </div>
            )}
          </div>
        </ChapterWidgetSlot>

        {/* 底部说明 */}
        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          <div className="flex items-start gap-2">
            <FontAwesomeIcon icon={faSignInAlt} className="mt-0.5 flex-shrink-0" />
            <p>
              <span className="font-semibold">免责声明：</span>
              本页面内容为常识科普，基于常见生活场景编写，仅供参考，不构成正式法律意见。遇到具体纠纷时，请及时咨询专业律师或拨打法律热线（12348）。
            </p>
          </div>
        </div>
      </div>

      {/* 提问题弹窗 */}
      <AskQuestionModal
        isOpen={askModalOpen}
        onClose={() => setAskModalOpen(false)}
        onSubmit={handleAskSubmit}
      />

      {/* 评论/实用建议弹窗 */}
      <AddQAItemModal
        isOpen={!!addItemModal}
        mode={addItemModal ? (addItemModal.mode === 'ans-com' ? 'comment' : 'suggestion') : 'comment'}
        onClose={() => setAddItemModal(null)}
        onSubmit={handleAddItemSubmit}
      />
    </div>
  );
};

export default CommonQAPage;