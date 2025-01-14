import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUser, faLock } from '@fortawesome/free-solid-svg-icons';
import gunService from '../../services/gunDB';


const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await gunService.login(username, password);
      setIsAuthenticated(true);
      navigate('/editor'); 
    } catch (err) {
      setError('登录失败，请检查用户名和密码');
    }
  };

  const handleAnonymousLogin = () => {
    setIsAuthenticated(true);
    navigate('/editor');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <FontAwesomeIcon icon={faSignInAlt} className="text-4xl text-blue-500 mb-4" />
          <h2 className="text-3xl font-bold">用户登录</h2>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">

            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FontAwesomeIcon icon={faUser} />
              </span>
              <input
                type="text"
                required
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">
                <FontAwesomeIcon icon={faLock} />
              </span>
              <input
                type="password"
                required
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faSignInAlt} className="mr-2" />
            登录
          </button>
        </form>

        {/* Anonymous Login Link */}
        <div type="submit" className="mt-4 text-center">
          <div className="text-blue-600 hover:text-blue-700" onClick={handleAnonymousLogin}>
            匿名登录
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login; 