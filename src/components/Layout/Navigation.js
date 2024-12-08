import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faSignInAlt,
  faUserPlus,
  faUser,
  faSignOutAlt,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import gunService from '../../services/gunDB';
import BigSearch from './BigSearch';
import Button from '../ui/Button';
import Input from '../ui/Input';

const Navigation = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(true);

  if (location.pathname === '/') {
    return <BigSearch />;
  }

  const handleLogout = () => {
    gunService.logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md p-4" expl="bg-gray-800 p-4 fixed top-0 left-0 right-0 z-50 bg-red shadow-md">
      <div className="container mx-auto flex justify-between items-center">

        <div className="flex items-center space-x-4">
          <Button
            onClick={() => { navigate('/'); }} variant="ghost"
            className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
          >
            <FontAwesomeIcon icon={faHome} className="mr-2" />首页
          </Button>
          <Button
            onClick={() => { navigate('/articles'); }} variant="ghost"
            className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
          >
            <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 文章列表
          </Button>
          <Button
            onClick={() => { navigate('/searchtree'); }} variant="ghost"
            className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
          >
            <FontAwesomeIcon icon={faNewspaper} className="mr-2" /> 节点索引
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button onClick={() => { navigate('/editor'); }} variant="ghost"
                className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                编辑内容
              </Button>
              <Button onClick={() => { navigate('/profile'); }} variant="ghost"
                className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
              >
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                个人信息
                </Button>
              <Button
                onClick={handleLogout}
                className="text-white hover:text-gray-300"
              >
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
                退出
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => { navigate('/login'); }} variant="ghost"
                className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
              >
                <FontAwesomeIcon icon={faSignInAlt} className="mr-2" /> 登录
              </Button>
              <Button
                onClick={() => { navigate('/register'); }} variant="ghost"
                className={`hover:bg-white/20 ${isScrolled ? 'text-black hover:bg-gray-100' : 'text-white'}`}
              >
                <FontAwesomeIcon icon={faUserPlus} className="mr-2" /> 加入
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 