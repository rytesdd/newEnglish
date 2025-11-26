import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, message } from 'antd';
import './App.css';
import Login from './components/Login';
import FileUploader from './components/FileUploader';
import YouTubeInput from './components/YouTubeInput';
import TextDisplay from './components/TextDisplay';
import WordGroups from './components/WordGroups';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentPage, setCurrentPage] = useState('parser'); // 'parser' 或 'wordgroups'
  const [parsedText, setParsedText] = useState('');
  const [filename, setFilename] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('file'); // 'file' 或 'youtube'
  const [refreshWordGroups, setRefreshWordGroups] = useState(0);

  // 检查登录状态
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/check-auth', {
        withCredentials: true
      });
      setIsAuthenticated(response.data.isAuthenticated);
    } catch (error) {
      setIsAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/api/logout', {}, {
        withCredentials: true
      });
      setIsAuthenticated(false);
      message.success('已登出');
      // 清空当前内容
      setParsedText('');
      setFilename('');
      setError('');
    } catch (error) {
      message.error('登出失败');
    }
  };

  const handleFileParsed = (data) => {
    setParsedText(data.text);
    setFilename(data.filename);
    setError('');
  };

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setParsedText('');
    setFilename('');
  };

  const handleLoading = (isLoading) => {
    setLoading(isLoading);
  };

  // 如果正在检查登录状态，显示加载中
  if (checkingAuth) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  // 如果未登录，显示登录页面
  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const handleWordsSaved = () => {
    // 当单词保存成功后，触发背单词页面刷新
    setRefreshWordGroups(prev => prev + 1);
  };

  // 已登录，显示主应用
  return (
    <div className="App">
      <div className="container">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <div className="tabs" style={{ flex: 1 }}>
            <button
              className={`tab-button ${currentPage === 'parser' ? 'active' : ''}`}
              onClick={() => setCurrentPage('parser')}
            >
              📄 文件解析
            </button>
            <button
              className={`tab-button ${currentPage === 'wordgroups' ? 'active' : ''}`}
              onClick={() => setCurrentPage('wordgroups')}
            >
              📚 背单词
            </button>
          </div>
          <Button 
            type="default" 
            onClick={handleLogout}
            style={{ marginLeft: '16px' }}
          >
            登出
          </Button>
        </div>

        {currentPage === 'wordgroups' ? (
          <WordGroups refreshTrigger={refreshWordGroups} />
        ) : (
          <>
            <div className="button-group" style={{ marginBottom: '20px' }}>
              <button
                className={`switch-button ${activeTab === 'file' ? 'active' : ''}`}
                onClick={() => setActiveTab('file')}
              >
                📄 上传文件
              </button>
              <button
                className={`switch-button ${activeTab === 'youtube' ? 'active' : ''}`}
                onClick={() => setActiveTab('youtube')}
              >
                🎥 YouTube 链接
              </button>
            </div>

            {activeTab === 'file' ? (
              <FileUploader
                onFileParsed={handleFileParsed}
                onError={handleError}
                onLoading={handleLoading}
              />
            ) : (
              <YouTubeInput
                onTranscriptParsed={handleFileParsed}
                onError={handleError}
                onLoading={handleLoading}
              />
            )}

            {loading && (
              <div className="loading">
                <div className="spinner"></div>
                <p>{activeTab === 'file' ? '正在解析文件...' : '正在获取字幕...'}</p>
              </div>
            )}

            {error && (
              <div className="error-message">
                <p>❌ {error}</p>
              </div>
            )}

            {parsedText && (
              <TextDisplay
                text={parsedText}
                filename={filename}
                onWordsSaved={handleWordsSaved}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;

