/**
 * CommonQAPage 章节过滤 / 搜索互斥单元测试
 *
 * 重点验证（标题栏章节胶囊 → 页面列表的联动）：
 * 1. 默认展示「全部问答」，条数等于静态问答总数；
 * 2. 标题栏切换章节后只展示该章节的问答；
 * 3. 在某一章节下提交搜索：搜索生效且章节归零为「全部」，刚提交的关键词不会被清空；
 * 4. 搜索态下切换章节：搜索被清空，回到该章节的列表（含清空输入框草稿）。
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CommonQAPage from './CommonQAPage';
import { QaChapterProvider, useQaChapter } from '../../context/QaChapterContext';
import { LAW_QA_QUESTIONS } from '../data/QAData';
import { getQuestionChapterId } from '../data/lawQA';

// 页面仅依赖这两处外部数据源，mock 掉即可得到确定性的静态问答集合
jest.mock('../data/mockArticles', () => ({
  fetchMockArticles: jest.fn(async () => []),
}));
jest.mock('../../services/documentService', () => ({
  __esModule: true,
  default: { save: jest.fn(async () => ({ success: true })) },
}));

const SEARCH_PLACEHOLDER = /搜索问题、案例或建议关键词/;

/** 模拟标题栏的章节胶囊：点击即写入共享章节状态 */
const ChapterSwitcher = () => {
  const { activeChapter, setActiveChapter } = useQaChapter();
  return (
    <div>
      <span data-testid="active-chapter">{activeChapter}</span>
      <button type="button" onClick={() => setActiveChapter('love')}>切到恋爱</button>
      <button type="button" onClick={() => setActiveChapter('all')}>切到全部</button>
    </div>
  );
};

const countOf = (chapterId) => LAW_QA_QUESTIONS.filter(
  (q) => getQuestionChapterId(q) === chapterId
).length;

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * 条数文案所在的 <span>：分区说明为「— 共 N 个问答」，搜索为「关键词 "kw" 共 N 条」。
 * 用 selector 限定在 span 上，避免匹配到同样包含该文案的祖先节点。
 */
const countSpan = (pattern) => screen.getByText(pattern, { selector: 'span' });

const chapterCount = (n) => new RegExp(`^— 共 ${n} 个问答$`);

/** 搜索命中 ≥ 1 条，且关键词原样展示（用于验证刚提交的关键词没有被清空） */
const searchCount = (keyword) => new RegExp(`^关键词 " ${escapeRegExp(keyword)} " 共 [1-9]\\d* 条$`);

const renderPage = async () => {
  render(
    <QaChapterProvider>
      <ChapterSwitcher />
      <CommonQAPage />
    </QaChapterProvider>
  );
  // 等待动态问答加载结束（mock 返回空数组），避免异步 setState 触发 act 警告
  await waitFor(() => expect(screen.queryByText('正在加载问答...')).toBeNull());
};

describe('CommonQAPage 章节过滤与搜索互斥', () => {
  test('默认「全部」：展示全部问答与总条数', async () => {
    await renderPage();

    expect(screen.getByTestId('active-chapter')).toHaveTextContent('all');
    expect(screen.getByRole('heading', { name: /📚 全部问答/ })).toBeInTheDocument();
    expect(countSpan(chapterCount(LAW_QA_QUESTIONS.length))).toBeInTheDocument();
  });

  test('标题栏切换章节后，列表只保留该章节的问答', async () => {
    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: '切到恋爱' }));

    expect(screen.getByTestId('active-chapter')).toHaveTextContent('love');
    expect(countOf('love')).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /恋爱专题/ })).toBeInTheDocument();
    expect(countSpan(chapterCount(countOf('love')))).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /📚 全部问答/ })).toBeNull();
  });

  test('章节下提交搜索：搜索生效、章节归零为「全部」，关键词不被清空', async () => {
    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: '切到恋爱' }));
    expect(screen.getByTestId('active-chapter')).toHaveTextContent('love');

    // 取首个问题的第一个词（3 个字）作为关键词，保证一定能命中且不含正则特殊字符
    const keyword = (LAW_QA_QUESTIONS[0].question || LAW_QA_QUESTIONS[0].title || '')
      .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, ' ')
      .trim()
      .split(/\s+/)[0]
      .slice(0, 3);
    expect(keyword.length).toBeGreaterThan(0);

    const input = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
    fireEvent.change(input, { target: { value: keyword } });
    fireEvent.click(screen.getByRole('button', { name: '搜索问题' }));

    // 章节已归零（标题栏胶囊高亮回到「全部」），但搜索结果与关键词都保留
    expect(screen.getByTestId('active-chapter')).toHaveTextContent('all');
    expect(screen.getByRole('heading', { name: /🔍 搜索结果/ })).toBeInTheDocument();
    expect(countSpan(searchCount(keyword))).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /恋爱专题/ })).toBeNull();
  });

  test('搜索态下切换章节：清空搜索与输入草稿，回到该章节列表', async () => {
    await renderPage();

    const input = screen.getByPlaceholderText(SEARCH_PLACEHOLDER);
    fireEvent.change(input, { target: { value: '不存在的关键词xyz' } });
    fireEvent.click(screen.getByRole('button', { name: '搜索问题' }));
    expect(screen.getByRole('heading', { name: /🔍 搜索结果/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '切到全部' }));

    expect(screen.queryByRole('heading', { name: /🔍 搜索结果/ })).toBeNull();
    expect(screen.getByRole('heading', { name: /📚 全部问答/ })).toBeInTheDocument();
    expect(countSpan(chapterCount(LAW_QA_QUESTIONS.length))).toBeInTheDocument();
    expect(input).toHaveValue('');
  });
});
