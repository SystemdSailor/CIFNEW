import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
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

import {  Search } from 'lucide-react';
import { useSearch } from '../../context/SearchContext';
import '../../index.css';

const BigSearch = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const { setSearchQuery } = useSearch();

  const handleSearch = () => {
    setSearchQuery(searchInput);
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
            <Button
              onClick={()=>{navigate('/');}} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faBox} className="mr-2" explain="其他可选faFileZipper，faBoxesStacked"/>归档
            </Button>
          </div>

          {/* 右侧其他按钮 */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={()=>{navigate('/');}} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />首页
            </Button>
            <Button
              onClick={()=>{navigate('/articles');}} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 探索
            </Button>

            <Button
               onClick={()=>{navigate('/login');}} variant="ghost"
               className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> 登录
            </Button>
            <Button
              onClick={()=>{navigate('/register');}} variant="ghost"
              className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
            >
              <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> 加入
            </Button>
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-white">
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
          {/* <h1 className="mb-4 text-3xl font-bold">MEET 公开网关</h1>  */}
          {/* <p className="mb-8 text-lg">CIFNEW</p> */}
          {/* <div className="relative flex flex-col items-left justify-center w-full pl-12"> */}
          <p className="mb-8 text-lg">Career Information For NewFish , 致力于降低职业风险与减少不确定性</p>
          {/* </div> */}
          <div className="flex w-full max-w-3xl">
            <div className="relative flex-1">
              <Input
                className="w-full h-12 pl-12 bg-white text-black"
                placeholder="搜索公开文档"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Search className="absolute w-6 h-6 text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
            </div>
            <Button 
              className="h-12 ml-2"
              onClick={handleSearch}
            >
              确定
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default BigSearch;
