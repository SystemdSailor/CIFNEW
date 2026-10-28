import React, { useState, useEffect } from 'react';
import NewsTooltip from './NewsTooltip';
import ArchiveTooltip from './ArchiveTooltip';
import Button from '../ui/Button';
import {  useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSignInAlt,
  faUserPlus,
  faBox,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import { faGithubAlt } from '@fortawesome/free-brands-svg-icons';
import { useSearch } from '../../context/SearchContext';
import '../../index.css';

const BigSearch = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showArchiveTooltip, setShowArchiveTooltip] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { setSearchQuery, setIndustry, setCity } = useSearch();

  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCityInput, setSelectedCityInput] = useState('');
  const [showNews, setShowNews] = useState(false);
  const [cityIsInput, setCityIsInput] = useState(false);

  const handleSearch = () => {
    // 如果当前处于输入模式，同步输入内容到 selectedCity
    if (cityIsInput) {
      setSelectedCity(selectedCityInput || '');
    }
    setSearchQuery(searchInput);
    setIndustry(selectedIndustry);
    setCity(selectedCity);
    //navigate('/');
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}>
        <div className="container mx-auto flex items-center justify-between p-4">
          {/* 左侧归档按钮 */}
          <div className="flex items-center">
            <div className={`mr-4 text-xl font-custom font-bold ${isScrolled ? 'text-black' : 'text-green'}`}> CIFNEW </div>
            <div className="relative">
              <Button
                onClick={() => setShowArchiveTooltip(!showArchiveTooltip)} variant="ghost"
                className={`hover:bg-white/20 ${showArchiveTooltip ? (isScrolled ? 'bg-gray-100' : 'bg-white/20') : ''} ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
              >
                <FontAwesomeIcon icon={faBox} className="mr-2" explain="其他可选faFileZipper，faBoxesStacked"/>归档
              </Button>
              {showArchiveTooltip && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowArchiveTooltip(false)}></div>
                  <ArchiveTooltip />
                </>
              )}
            </div>
          </div>

          {/* 右侧其他按钮 */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={()=>{navigate('/');}} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />首页
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                className={`hover:bg-white/20 ${showNews ? (isScrolled ? 'bg-gray-100' : 'bg-white/20') : ''} ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
                onClick={() => setShowNews(!showNews)}
              >
                <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 新闻
              </Button>
              {showNews && (
                <>
                  <div className="fixed inset-0 z-[9998]" onClick={() => setShowNews(false)}></div>
                  <NewsTooltip onClose={() => setShowNews(false)} />
                </>
              )}
            </div>

             <Button
                onClick={()=>{navigate('/qa');}} 
                variant="ghost"
                className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
             >
               <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> 问答
             </Button>
             <Button
                onClick={() => navigate('/standardize')}
                variant="ghost"
                className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
              >
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> 标准化
              </Button>
            <Button
              onClick={() => window.open('https://github.com/', '_blank')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {/* <Upload className="w-4 h-4 mr-2" />  检索 */}
              <FontAwesomeIcon icon={faGithubAlt} /> &thinsp; Github
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative  h-[65vh]" expl="其他可选效果 aspect-[16/9] 或者绝对值h-[550px]">
        <div className="absolute inset-0">
          <img
            src="./img/maisan-provincial-park-6693310.jpg"
            alt="Scenery background"
            className="object-cover w-full h-full"
          />
          <div className="absolute inset-0 bg-black/30" expl="在图片上叠加一层 30% 透明度的黑色遮罩，增加图片的深度感和对比度"/> 
        </div>
        <div className="relative flex flex-col items-center justify-center h-full px-4 text-white pt-16">
          <p className="mb-8 text-lg">Career Information For NewFish , 致力于降低职业风险与减少不确定性</p>
          
          {/* CompanySearchBar 风格搜索卡片 */}
          <div className="backdrop-blur-md bg-white/30 rounded-3xl px-6 py-5 flex items-center gap-4 shadow-xl w-[1000px]">
            {/* 关键词 */}
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-700 mb-1">公司 / 关键词</span>
              <input
                type="text"
                placeholder="请输入公司名称或关键词"
                className="bg-transparent outline-none text-lg font-semibold placeholder-gray-500 text-white"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>

            {/* 分隔线 */}
            <div className="h-10 w-px bg-gray-300"></div>

            {/* 行业 */}
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-700 mb-1">行业</span>
              <select
                className="bg-transparent outline-none text-lg font-semibold text-gray-700"
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
              >
                <option value="">全部行业</option>
                <option value="互联网">互联网</option>
                <option value="金融">金融</option>
                <option value="制造业">制造业</option>
                <option value="医疗">医疗</option>
              </select>
            </div>

            {/* 分隔线 */}
            <div className="h-10 w-px bg-gray-300"></div>

            {/* 地区 */}
            <div className="flex flex-col flex-1">
              <span className="text-xs text-gray-700 mb-1">
                地区
                {cityIsInput && <span className="text-gray-400 ml-1 text-[10px]">(当前可输入)</span>}
              </span>
              {cityIsInput ? (
                <input
                  type="text"
                  placeholder="请输入地区"
                  className="bg-transparent outline-none text-lg font-semibold placeholder-gray-400 text-gray-700"
                  value={selectedCityInput}
                  onDoubleClick={() => {
                    // 双击切换到 select 模式并同步值
                    setCityIsInput(false);
                    setSelectedCity(selectedCityInput || '');
                  }}
                  onChange={(e) => setSelectedCityInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setCityIsInput(false);
                      setSelectedCity(selectedCityInput || '');
                    }
                  }}
                  autoFocus
                />
              ) : (
                <select
                  className="bg-transparent outline-none text-lg font-semibold text-gray-700"
                  value={selectedCity}
                  onDoubleClick={() => {
                    setCityIsInput(true);
                    setSelectedCityInput(selectedCity);
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '其他') {
                      setCityIsInput(true);
                      setSelectedCityInput('');
                    } else {
                      setSelectedCity(val);
                    }
                  }}
                >
                  <option value="">全国</option>
                  <option value="北京">北京</option>
                  <option value="上海">上海</option>
                  <option value="深圳">深圳</option>
                  <option value="其他">其他</option>
                </select>
              )}
            </div>

            {/* 搜索按钮 */}
            <button 
              className="bg-black text-white px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-gray-800 transition"
              onClick={handleSearch}
            >
              🔍 搜索
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BigSearch;
