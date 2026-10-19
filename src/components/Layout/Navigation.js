import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faUser,
  faNewspaper,
  faSignInAlt
} from '@fortawesome/free-solid-svg-icons';
import BigSearch from './BigSearch';
import Button from '../ui/Button';
import UserProfileModal from '../User/UserProfileModal';
import { CHAPTER_TABS } from '../data/lawQA';
import { useQaChapter } from '../../context/QaChapterContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const navRef = useRef(null);
  const { activeChapter, setActiveChapter } = useQaChapter();

  // 章节横列仅在 /qa（问答页）显示
  const isQaPage = location.pathname === '/qa';

  // 把标题栏实测高度写入 CSS 变量 --nav-h，供 /qa 页面的吸顶搜索栏做 top 偏移，避免被吸顶导航栏遮挡
  useEffect(() => {
    const el = navRef.current;
    const setVar = (h) => document.documentElement.style.setProperty('--nav-h', `${h}px`);
    if (!el) {
      setVar(0); // '/' 路由渲染 BigSearch，此处无导航栏
      return undefined;
    }
    setVar(el.offsetHeight);
    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => setVar(el.offsetHeight))
      : null;
    if (ro) ro.observe(el);
    return () => {
      if (ro) ro.disconnect();
    };
  }, [location.pathname]);

  if (location.pathname === '/') {
    return <BigSearch />;
  }else{
    return (
      <nav ref={navRef} className="sticky top-0 z-50 bg-white shadow-md p-4">
        <div className="container mx-auto flex items-center gap-4">

          <div className="flex items-center space-x-4 flex-shrink-0">
            <Button
              onClick={() => { navigate('/'); }} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />首页
            </Button>
            <Button
              onClick={() => { navigate('/qa'); }} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> 问答
            </Button>
                        <Button
              onClick={() => { navigate('/articles'); }} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 文章列表
            </Button>
            {/* <Button
              onClick={() => { navigate('/searchtree'); }} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 节点索引
            </Button> */}
          </div>

          {/* 章节横列单选按钮（多选一）：位于导航链接旁边，横向滚动切换 /qa 页面下方列表 */}
          {isQaPage && (
            <div
              role="tablist"
              aria-label="问答章节"
              className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto py-1"
            >
              {CHAPTER_TABS.map((chapter) => {
                const isActive = activeChapter === chapter.id;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveChapter(chapter.id)}
                    className={`flex-shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full border text-sm transition-all ${
                      isActive
                        ? `${chapter.color || 'bg-indigo-600'} text-white border-transparent shadow-sm`
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }`}
                  >
                    <span className="mr-1">{chapter.icon}</span>
                    {chapter.name}
                  </button>
                );
              })}
            </div>
          )}

          <div className="flex items-center space-x-4 flex-shrink-0 ml-auto">
            <Button onClick={() => { setShowProfile(true); }} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              帐号数据
            </Button>
            <UserProfileModal
              isOpen={showProfile}
              onClose={() => setShowProfile(false)}
            />
          </div>
        </div>
      </nav>
    );
  }
};

export default Navigation; 
