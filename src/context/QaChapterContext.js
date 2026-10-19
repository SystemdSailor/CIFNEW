import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const QaChapterContext = createContext();

export function QaChapterProvider({ children }) {
  // activeChapter：'all' = 不按章节过滤（展示全部问答）
  // version：每次点击章节胶囊自增，用于让页面感知“重复点击同一个胶囊”也应退出搜索态
  const [state, setState] = useState({ activeChapter: 'all', version: 0 });

  const setActiveChapter = useCallback((chapterId) => {
    setState(prev => ({ activeChapter: chapterId, version: prev.version + 1 }));
  }, []);

  const value = useMemo(() => ({
    activeChapter: state.activeChapter,
    version: state.version,
    setActiveChapter,
  }), [state, setActiveChapter]);

  return (
    <QaChapterContext.Provider value={value}>
      {children}
    </QaChapterContext.Provider>
  );
}

export function useQaChapter() {
  return useContext(QaChapterContext);
}
