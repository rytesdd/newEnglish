import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, List, Typography, Space, message, Empty, Collapse } from 'antd';
import { API_ENDPOINTS } from '../config/api';
import WordMemory from './WordMemory';
import './WordGroups.css';

const { Text } = Typography;
const { Panel } = Collapse;

const WordGroups = ({ refreshTrigger }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [memoryGroup, setMemoryGroup] = useState(null); // 当前正在记忆的分组

  useEffect(() => {
    fetchWordGroups();
  }, [refreshTrigger]);

  const fetchWordGroups = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.WORD_GROUPS, {
        withCredentials: true,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      if (response.data.success) {
        setGroups(response.data.groups || []);
      } else {
        console.error('获取背单词分组失败:', response.data);
        message.error(response.data.error || '获取背单词分组失败');
      }
    } catch (error) {
      console.error('获取背单词分组失败:', error);
      let errorMsg = '获取背单词分组失败';
      if (error.response) {
        // 服务器返回了错误响应
        if (error.response.status === 401) {
          errorMsg = '请先登录';
        } else {
          errorMsg = error.response.data?.error || `服务器错误: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMsg = '无法连接到服务器';
      } else {
        errorMsg = error.message || '获取背单词分组失败';
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  const handleStartMemory = (group) => {
    if (!group.words || group.words.length === 0) {
      message.warning('该分组没有单词，无法开始记忆');
      return;
    }
    setMemoryGroup(group);
  };

  const handleExitMemory = () => {
    setMemoryGroup(null);
  };

  // 如果正在记忆模式，显示记忆组件
  if (memoryGroup) {
    return <WordMemory group={memoryGroup} onExit={handleExitMemory} />;
  }

  if (loading) {
    return (
      <div className="word-groups-container">
        <div className="loading-spinner">加载中...</div>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="word-groups-container">
        <Empty 
          description="还没有背单词分组，快去解析文件并保存单词吧！"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </div>
    );
  }

  return (
    <div className="word-groups-container">
      <div className="word-groups-header">
        <Text type="secondary">共 {groups.length} 个分组</Text>
      </div>

      <div className="word-groups-list">
        <Collapse
          defaultActiveKey={groups.map((g, index) => String(index))}
          ghost
        >
          {groups.map((group, groupIndex) => (
            <Panel
              key={groupIndex}
              header={
                <div className="group-header">
                  <span className="group-name">{group.groupName}</span>
                  <Space>
                    <span className="group-count">{group.words?.length || 0} 个单词/短语</span>
                    {group.words && group.words.length > 0 && (
                      <Button 
                        type="primary" 
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartMemory(group);
                        }}
                      >
                        记忆
                      </Button>
                    )}
                  </Space>
                </div>
              }
            >
              {group.words && group.words.length > 0 ? (
                <List
                  dataSource={group.words}
                  renderItem={(word, wordIndex) => (
                    <List.Item
                      key={word.key || wordIndex}
                      className="word-item"
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{word.text}</Text>
                            {word.isPhrase && (
                              <Text type="secondary" style={{ fontSize: '12px' }}>[短语]</Text>
                            )}
                          </Space>
                        }
                        description={
                          word.translation ? (
                            <div className="word-details">
                              <div className="word-translation">
                                <Text>{word.translation}</Text>
                              </div>
                            </div>
                          ) : null
                        }
                      />
                    </List.Item>
                  )}
                />
              ) : (
                <Empty 
                  description="这个分组还没有单词"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  style={{ margin: '20px 0' }}
                />
              )}
            </Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};

export default WordGroups;

