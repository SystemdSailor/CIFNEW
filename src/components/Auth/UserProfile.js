import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faSave, 
  faExclamationCircle 
} from '@fortawesome/free-solid-svg-icons';
import gunService from '../../services/gunDB';

const UserProfile = () => {
  const [profile, setProfile] = useState({
    displayName: '',
    email: '',
    phone: '',
    bio: ''
  });
  const [message, setMessage] = useState({ type: '', content: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await gunService.getUserProfile();
        if (data) {
          setProfile(data);
        }
        setLoading(false);
      } catch (err) {
        setMessage({ type: 'error', content: '获取用户信息失败' });
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await gunService.saveUserProfile(profile);
      setMessage({ type: 'success', content: '个人信息更新成功' });
      // 3秒后清除消息
      setTimeout(() => setMessage({ type: '', content: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', content: '更新失败，请重试' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-8">

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold">个人信息设置</h2>
        </div>

        {message.content && (
          <div className={`mb-4 p-4 rounded ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            <FontAwesomeIcon 
              icon={message.type === 'success' ? faSave : faExclamationCircle} 
              className="mr-2" 
            />
            {message.content}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faUser} className="mr-2" />
              显示名称
            </label>
            <input
              type="text"
              name="displayName"
              value={profile.displayName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
              邮箱
            </label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FontAwesomeIcon icon={faPhone} className="mr-2" />
              电话
            </label>
            <input
              type="tel"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              个人简介
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            保存修改
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfile; 