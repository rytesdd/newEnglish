import React, { useState, useEffect } from 'react';
import { Button, Card, Space, Typography } from 'antd';
import './WordMemory.css';

const { Title, Text } = Typography;

const WordMemory = ({ group, onExit }) => {
  const [words] = useState(group.words || []);
  const [currentWordIndex, setCurrentWordIndex] = useState(0); // 当前正在背的新单词索引
  const [reviewQueue, setReviewQueue] = useState([]); // 当前需要复习的单词队列
  const [rememberedWords, setRememberedWords] = useState(new Set()); // 已记住的单词索引
  const [showTranslation, setShowTranslation] = useState(false); // 是否显示翻译
  const [state, setState] = useState('LEARN'); // 状态机：'LEARN' | 'INTERIM_REVIEW'
  const [pendingNextIndex, setPendingNextIndex] = useState(null); // 复习完成后要跳转的索引

  // 获取当前显示的单词
  const getCurrentWord = () => {
    if (state === 'INTERIM_REVIEW') {
      // 复习模式：显示复习队列中的第一个单词
      if (reviewQueue.length > 0) {
        return words[reviewQueue[0]];
      }
      return null;
    } else {
      // 学习模式：显示当前索引的单词
      if (currentWordIndex < words.length) {
        return words[currentWordIndex];
      }
      return null;
    }
  };

  // 构建复习队列：包含从0到endIndex-1的所有单词
  // 规则：在背下一个新单词之前，需要复习所有之前背过的单词（不管是否记住）
  // eslint-disable-next-line no-unused-vars
  const buildReviewQueue = (endIndex) => {
    const queue = [];
    for (let i = 0; i < endIndex; i++) {
      // 包含所有已背过的单词，因为即使"保持"了，也需要复习
      queue.push(i);
    }
    return queue;
  };

  // 处理"显示意思"
  const handleShowTranslation = () => {
    setShowTranslation(true);
  };

  // 处理"保持"按钮 - 表示"暂时记住，但还要继续复习"
  const handleKeep = () => {
    setShowTranslation(false);
    
    if (state === 'INTERIM_REVIEW') {
      // 复习模式：不标记为已记住，从复习队列中移除（本次复习结束后还会再出现）
      const newQueue = reviewQueue.slice(1);
      if (newQueue.length === 0) {
        // 复习完成，切换回学习模式
        if (pendingNextIndex !== null && pendingNextIndex < words.length) {
          // 还有新单词要学
          setState('LEARN');
          setCurrentWordIndex(pendingNextIndex);
          setPendingNextIndex(null);
          setReviewQueue([]);
        } else {
          // 所有新单词都学完了，进入循环复习模式
          const allUnremembered = [];
          for (let i = 0; i < words.length; i++) {
            if (!rememberedWords.has(i)) {
              allUnremembered.push(i);
            }
          }
          if (allUnremembered.length > 0) {
            setReviewQueue(allUnremembered);
            setPendingNextIndex(null);
          } else {
            // 所有单词都记住了
            setState('LEARN');
            setCurrentWordIndex(words.length);
            setPendingNextIndex(null);
            setReviewQueue([]);
          }
        }
      } else {
        // 继续复习下一个
        setReviewQueue(newQueue);
      }
    } else {
      // 学习模式：不标记为已记住，进入下一个单词
      const currentIndex = currentWordIndex;
      const nextIndex = currentIndex + 1;
      
      if (nextIndex >= words.length) {
        // 所有新单词都学完了，进入循环复习模式
        const reviewQueueForNext = [];
        for (let i = 0; i < words.length; i++) {
          if (!rememberedWords.has(i)) {
            reviewQueueForNext.push(i);
          }
        }
        
        if (reviewQueueForNext.length > 0) {
          setReviewQueue(reviewQueueForNext);
          setPendingNextIndex(null);
          setState('INTERIM_REVIEW');
        } else {
          // 所有单词都"记住了"，学习完成
          setCurrentWordIndex(nextIndex);
        }
        return;
      }
      
      // 判断是否需要复习（规则：nextIndex >= 2 时需要复习）
      if (nextIndex >= 2) {
        // 需要复习 W[0..nextIndex-1]，但排除已"记住了"的单词
        const reviewQueueForNext = [];
        for (let i = 0; i < nextIndex; i++) {
          if (!rememberedWords.has(i)) {
            reviewQueueForNext.push(i);
          }
        }
        
        if (reviewQueueForNext.length > 0) {
          setReviewQueue(reviewQueueForNext);
          setPendingNextIndex(nextIndex);
          setState('INTERIM_REVIEW');
        } else {
          // 所有之前的单词都"记住了"，直接学习下一个
          setCurrentWordIndex(nextIndex);
        }
      } else {
        // 不需要复习，直接学习下一个
        setCurrentWordIndex(nextIndex);
      }
    }
  };

  // 处理"记住了"按钮 - 从本轮记忆中永久移除
  const handleRemember = () => {
    setShowTranslation(false);
    
    if (state === 'INTERIM_REVIEW') {
      // 复习模式：标记为已记住，从本轮记忆中移除
      const currentReviewIndex = reviewQueue[0];
      setRememberedWords(prev => new Set([...prev, currentReviewIndex]));
      
      const newQueue = reviewQueue.slice(1);
      if (newQueue.length === 0) {
        // 复习队列为空
        if (pendingNextIndex !== null && pendingNextIndex < words.length) {
          // 还有新单词要学，切换回学习模式
          setState('LEARN');
          setCurrentWordIndex(pendingNextIndex);
          setPendingNextIndex(null);
          setReviewQueue([]);
        } else {
          // 所有单词都学完了，且复习队列也空了（所有单词都"记住了"）
          // 显示完成界面
          setState('LEARN');
          setCurrentWordIndex(words.length);
          setPendingNextIndex(null);
          setReviewQueue([]);
        }
      } else {
        // 继续复习下一个
        setReviewQueue(newQueue);
      }
    } else {
      // 学习模式：标记为已记住，从本轮记忆中移除
      const currentIndex = currentWordIndex;
      setRememberedWords(prev => new Set([...prev, currentIndex]));
      
      const nextIndex = currentIndex + 1;
      
      if (nextIndex >= words.length) {
        // 所有新单词都学完了，进入循环复习模式
        // 构建复习队列：包含所有未"记住了"的单词
        const reviewQueueForNext = [];
        for (let i = 0; i < words.length; i++) {
          if (!rememberedWords.has(i) && i !== currentIndex) {
            reviewQueueForNext.push(i);
          }
        }
        
        if (reviewQueueForNext.length > 0) {
          setReviewQueue(reviewQueueForNext);
          setPendingNextIndex(null);
          setState('INTERIM_REVIEW');
        } else {
          // 所有单词都"记住了"，学习完成
          setCurrentWordIndex(nextIndex);
        }
        return;
      }
      
      // 判断是否需要复习（规则：nextIndex >= 2 时需要复习）
      if (nextIndex >= 2) {
        // 需要复习 W[0..nextIndex-1]，但排除已"记住了"的单词
        const reviewQueueForNext = [];
        for (let i = 0; i < nextIndex; i++) {
          if (!rememberedWords.has(i)) {
            reviewQueueForNext.push(i);
          }
        }
        
        if (reviewQueueForNext.length > 0) {
          setReviewQueue(reviewQueueForNext);
          setPendingNextIndex(nextIndex);
          setState('INTERIM_REVIEW');
        } else {
          // 所有之前的单词都"记住了"，直接学习下一个
          setCurrentWordIndex(nextIndex);
        }
      } else {
        // 不需要复习，直接学习下一个
        setCurrentWordIndex(nextIndex);
      }
    }
  };

  // 重置翻译显示状态
  const reviewQueueKey = reviewQueue.join(',');
  useEffect(() => {
    setShowTranslation(false);
  }, [state, currentWordIndex, reviewQueueKey]);

  const currentWord = getCurrentWord();
  const isAllRemembered = currentWordIndex >= words.length && reviewQueue.length === 0 && state === 'LEARN' && rememberedWords.size === words.length;

  // 只有当所有单词都"记住了"时，才显示完成界面
  if (isAllRemembered) {
    return (
      <div className="word-memory-container">
        <Card className="memory-card">
          <div className="memory-header">
            <Button type="text" onClick={onExit}>← 退出记忆</Button>
          </div>
          <div className="memory-finished">
            <Title level={2}>🎉 恭喜完成一轮！</Title>
            <Text>所有单词都已学习完成！</Text>
            <div style={{ marginTop: '24px' }}>
              <Space size="large" direction="vertical">
                <Button 
                  type="primary" 
                  size="large" 
                  onClick={() => {
                    // 重新开始：重置状态，从头开始
                    setCurrentWordIndex(0);
                    setReviewQueue([]);
                    setRememberedWords(new Set());
                    setShowTranslation(false);
                    setState('LEARN');
                    setPendingNextIndex(null);
                  }}
                >
                  再来一轮
                </Button>
                <Button size="large" onClick={onExit}>
                  退出记忆
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentWord) {
    return (
      <div className="word-memory-container">
        <Card className="memory-card">
          <div className="memory-finished">
            <Text>加载中...</Text>
          </div>
        </Card>
      </div>
    );
  }

  const progress = {
    total: words.length,
    remembered: rememberedWords.size,
    current: state === 'INTERIM_REVIEW'
      ? `复习中 (${reviewQueue.length} 个待复习)` 
      : currentWordIndex < words.length
        ? `新单词 ${currentWordIndex + 1}/${words.length}`
        : '完成'
  };

  return (
    <div className="word-memory-container">
      <Card className="memory-card">
        <div className="memory-header">
          <Button type="text" onClick={onExit}>← 退出记忆</Button>
          <div className="memory-progress">
            <Text type="secondary">
              {progress.current} | 已记住: {progress.remembered}/{progress.total}
            </Text>
          </div>
        </div>

        <div className="memory-content">
          <div className="word-display">
            <div className="word-text">
              <Title level={1}>{currentWord.text}</Title>
              {currentWord.isPhrase && (
                <Text type="secondary" className="phrase-tag">[短语]</Text>
              )}
            </div>
            
            {showTranslation ? (
              <div className="translation-display">
                <Text className="translation-label">翻译：</Text>
                <Text className="translation-text">{currentWord.translation || '暂无翻译'}</Text>
              </div>
            ) : (
              <div className="translation-placeholder">
                <Button type="link" onClick={handleShowTranslation} className="show-translation-btn">
                  显示意思
                </Button>
              </div>
            )}
          </div>

          <div className="memory-actions">
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                onClick={handleRemember}
                className="action-btn remember-btn"
              >
                记住了
              </Button>
              <Button 
                size="large" 
                onClick={handleKeep}
                className="action-btn keep-btn"
              >
                保持
              </Button>
            </Space>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WordMemory;
