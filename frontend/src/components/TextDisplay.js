import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import { message } from 'antd';
import './TextDisplay.css';

const TextDisplay = ({ text, filename, onWordsSaved }) => {
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const [selectedWords, setSelectedWords] = useState(new Set());
  const [spaceSelectedWords, setSpaceSelectedWords] = useState(new Set());
  const [translations, setTranslations] = useState(new Map()); // 存储翻译结果: key -> translation
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const textContentRef = useRef(null);
  const isSpaceSelectingRef = useRef(false);

  // 监听空格键，禁用页面滚动
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        // 如果焦点在输入框等元素上，不阻止默认行为
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        e.preventDefault(); // 阻止空格键滚动页面
        e.stopPropagation(); // 阻止事件传播
        
        if (!isSpacePressed) {
          setIsSpacePressed(true);
          isSpaceSelectingRef.current = true;
        }
      }
    };

    const handleKeyUp = (e) => {
      if (e.code === 'Space' || e.key === ' ') {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }
        
        e.preventDefault();
        setIsSpacePressed(false);
        isSpaceSelectingRef.current = false;
      }
    };

    // 使用捕获阶段确保能够捕获到事件
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [isSpacePressed]);

  // 将文本分割成单词和分隔符（保留换行符）
  const splitTextIntoWords = (textValue) => {
    if (!textValue) return [];
    
    const parts = [];
    // 正则匹配：单词、空格（包括换行符）
    const regex = /(\S+|\s+)/g;
    let match;
    let wordIndex = 0; // 只有单词有索引

    while ((match = regex.exec(textValue)) !== null) {
      const text = match[0];
      const isWord = /\S/.test(text);
      parts.push({
        text: text,
        isWord: isWord,
        index: isWord ? wordIndex++ : -1, // 只有单词有索引，空格和换行符为-1
        start: match.index,
        end: match.index + text.length
      });
    }

    return parts;
  };

  const parts = useMemo(() => splitTextIntoWords(text), [text]);

  // 文本变化时重置选择
  useEffect(() => {
    setSelectedWords(new Set());
    setSpaceSelectedWords(new Set());
    setTranslations(new Map());
  }, [text]);

  const wordTextMap = useMemo(() => {
    const map = new Map();
    parts.forEach(part => {
      if (part.isWord && part.index >= 0) {
        map.set(part.index, part.text);
      }
    });
    return map;
  }, [parts]);

  // 提取包含指定单词索引的完整句子（只提取一句话）
  const extractSentence = useCallback((wordIndex) => {
    if (!text || wordIndex < 0) return '';

    // 找到该单词在原文中的位置
    let wordStart = -1;
    let wordEnd = -1;
    for (const part of parts) {
      if (part.isWord && part.index === wordIndex) {
        wordStart = part.start;
        wordEnd = part.end;
        break;
      }
    }

    if (wordStart === -1) return '';

    // 更精确的句子边界识别：查找句子结束标记（. ! ? \n）
    // 注意：需要排除一些特殊情况，比如数字中的小数点、缩写等
    const sentenceEnders = ['.', '!', '?', '\n'];
    
    // 向后查找第一个句子结束标记
    let sentenceEnd = -1;
    for (let i = wordEnd; i < text.length; i++) {
      const char = text[i];
      if (sentenceEnders.includes(char)) {
        // 检查是否是小数点（前后都是数字）
        if (char === '.') {
          const prevChar = i > 0 ? text[i - 1] : '';
          const nextChar = i < text.length - 1 ? text[i + 1] : '';
          if (/\d/.test(prevChar) && /\d/.test(nextChar)) {
            continue; // 是小数点，继续查找
          }
        }
        sentenceEnd = i + 1;
        break;
      }
    }
    
    // 如果没找到句子结束标记，使用单词后100个字符作为边界
    if (sentenceEnd === -1) {
      sentenceEnd = Math.min(text.length, wordEnd + 120);
    }

    // 向前查找第一个句子开始标记
    let sentenceStart = -1;
    for (let i = wordStart - 1; i >= 0; i--) {
      const char = text[i];
      if (sentenceEnders.includes(char)) {
        // 检查是否是小数点
        if (char === '.') {
          const prevChar = i > 0 ? text[i - 1] : '';
          const nextChar = i < text.length - 1 ? text[i + 1] : '';
          if (/\d/.test(prevChar) && /\d/.test(nextChar)) {
            continue; // 是小数点，继续查找
          }
        }
        sentenceStart = i + 1;
        break;
      }
    }
    
    // 如果没找到句子开始标记，使用单词前100个字符作为边界
    if (sentenceStart === -1) {
      sentenceStart = Math.max(0, wordStart - 100);
    }

    // 提取句子
    let sentence = text.substring(sentenceStart, sentenceEnd).trim();
    
    // 只清理句子开头的多余空格（保留所有标点符号，包括逗号、句号等）
    sentence = sentence.replace(/^\s+/, ''); // 只移除开头的空白字符
    
    // 如果句子太短（可能是提取边界有问题），使用固定范围
    if (sentence.length < 10) {
      const contextStart = Math.max(0, wordStart - 60);
      const contextEnd = Math.min(text.length, wordEnd + 80);
      sentence = text.substring(contextStart, contextEnd).trim();
      sentence = sentence.replace(/^\s+/, ''); // 只移除开头的空白字符
    }

    // 再次检查：如果句子中包含多个句子结束标记，只保留第一个完整句子
    // 从单词位置开始向后查找第一个句子结束标记
    const wordText = text.substring(wordStart, wordEnd);
    const wordPosInSentence = sentence.indexOf(wordText);
    
    if (wordPosInSentence >= 0) {
      // 在单词之后查找第一个句子结束标记
      let firstEndAfterWord = -1;
      for (let i = wordPosInSentence + wordText.length; i < sentence.length; i++) {
        const char = sentence[i];
        if (char === '!' || char === '?' || char === '\n') {
          firstEndAfterWord = i + 1;
          break;
        }
        if (char === '.') {
          // 检查是否是小数点或缩写
          const prevChar = i > 0 ? sentence[i - 1] : '';
          const nextChar = i < sentence.length - 1 ? sentence[i + 1] : '';
          if (!(/\d/.test(prevChar) && /\d/.test(nextChar)) && nextChar !== ' ') {
            // 可能是缩写，检查下一个字符
            if (nextChar && /[a-z]/.test(nextChar)) {
              continue; // 是缩写，继续
            }
          }
          if (!(/\d/.test(prevChar) && /\d/.test(nextChar))) {
            firstEndAfterWord = i + 1;
            break;
          }
        }
      }
      
      if (firstEndAfterWord > 0) {
        sentence = sentence.substring(0, firstEndAfterWord);
      }
    } else {
      // 如果找不到单词在句子中的位置，查找第一个句子结束标记
      let firstSentenceEnd = -1;
      for (let i = 0; i < sentence.length; i++) {
        const char = sentence[i];
        if (char === '!' || char === '?' || char === '\n') {
          firstSentenceEnd = i + 1;
          break;
        }
        if (char === '.') {
          const prevChar = i > 0 ? sentence[i - 1] : '';
          const nextChar = i < sentence.length - 1 ? sentence[i + 1] : '';
          if (!(/\d/.test(prevChar) && /\d/.test(nextChar)) && nextChar !== ' ') {
            if (nextChar && /[a-z]/.test(nextChar)) {
              continue;
            }
            firstSentenceEnd = i + 1;
            break;
          }
        }
      }
      
      if (firstSentenceEnd > 0 && firstSentenceEnd < sentence.length) {
        sentence = sentence.substring(0, firstSentenceEnd);
      }
    }

    // 只清理句子开头和结尾的空白字符（保留所有标点符号：句号、逗号、问号等）
    sentence = sentence.replace(/^\s+/, '').replace(/\s+$/, '');
    
    // 限制句子长度，最多120字符（一句话）
    if (sentence.length > 120) {
      const wordPos = sentence.indexOf(wordText);
      if (wordPos >= 0) {
        // 在单词前后各截取60个字符
        const startPos = Math.max(0, wordPos - 60);
        const endPos = Math.min(sentence.length, wordPos + wordText.length + 60);
        let truncated = sentence.substring(startPos, endPos);
        // 只清理前后空白，保留所有标点
        truncated = truncated.trim();
        truncated = (startPos > 0 ? '...' : '') + truncated;
        // 如果截断后还有句子结束标记，保留到第一个结束标记（包括句号、问号、感叹号）
        const lastDot = truncated.lastIndexOf('.');
        const lastExclamation = truncated.lastIndexOf('!');
        const lastQuestion = truncated.lastIndexOf('?');
        const lastEnd = Math.max(lastDot, lastExclamation, lastQuestion);
        if (lastEnd > truncated.length - 20 && lastEnd > 0) {
          truncated = truncated.substring(0, lastEnd + 1);
        }
        sentence = truncated.trim();
      } else {
        // 找不到单词，直接截断到120字符，但要保留最后一个句子结束标记
        let truncatePos = 120;
        const lastDot = sentence.substring(0, 120).lastIndexOf('.');
        const lastExclamation = sentence.substring(0, 120).lastIndexOf('!');
        const lastQuestion = sentence.substring(0, 120).lastIndexOf('?');
        const lastEnd = Math.max(lastDot, lastExclamation, lastQuestion);
        if (lastEnd > 100) {
          truncatePos = lastEnd + 1;
        }
        sentence = sentence.substring(0, truncatePos).trim();
        // 如果原句还有内容，但已经包含了句号，就不加省略号了
        if (sentence.length < text.substring(sentenceStart, sentenceEnd).length && !/[.!?]$/.test(sentence)) {
          sentence += '...';
        }
      }
    }
    
    // 确保句子保持原有的所有标点符号（逗号、句号、问号、感叹号等）
    // 只移除多余的空白字符，保留所有标点

    return sentence || '';
  }, [text, parts]);

  // 提取短语所在句子（取短语的第一个词）
  const extractPhraseSentence = useCallback((wordIndices) => {
    if (!wordIndices || wordIndices.length === 0) return '';
    // 使用短语的第一个词的索引来提取句子
    return extractSentence(wordIndices[0]);
  }, [extractSentence]);

  const selectedPhrases = useMemo(() => {
    if (!wordTextMap.size || selectedWords.size === 0) return [];

    const sortedIndices = Array.from(selectedWords)
      .map(id => Number(id.replace('word-', '')))
      .filter((num) => Number.isFinite(num))
      .sort((a, b) => a - b);

    if (!sortedIndices.length) return [];

    const items = [];

    const flushGroup = (group, groupIsPhrase) => {
      if (!group.length) return;
      if (groupIsPhrase && group.length > 1) {
        const phraseText = group
          .map(idx => wordTextMap.get(idx) || '')
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        if (phraseText) {
          const sentence = extractPhraseSentence(group);
          items.push({
            key: group.join('-'),
            text: phraseText,
            isPhrase: true,
            wordIndices: group,
            sentence: sentence,
          });
        }
      } else {
        group.forEach(idx => {
          const wordText = (wordTextMap.get(idx) || '').trim();
          if (wordText) {
            const sentence = extractSentence(idx);
            items.push({
              key: String(idx),
              text: wordText,
              isPhrase: false,
              wordIndex: idx,
              sentence: sentence,
            });
          }
        });
      }
    };

    let currentGroup = [sortedIndices[0]];
    let currentGroupIsPhrase =
      spaceSelectedWords.has(`word-${sortedIndices[0]}`);

    for (let i = 1; i < sortedIndices.length; i++) {
      const current = sortedIndices[i];
      const prev = sortedIndices[i - 1];
      const currentIsSpace = spaceSelectedWords.has(`word-${current}`);
      const prevIsSpace = spaceSelectedWords.has(`word-${prev}`);

      const canGroupAsPhrase =
        current === prev + 1 && currentIsSpace && prevIsSpace && currentGroupIsPhrase;

      if (canGroupAsPhrase) {
        currentGroup.push(current);
      } else {
        flushGroup(currentGroup, currentGroupIsPhrase);
        currentGroup = [current];
        currentGroupIsPhrase = currentIsSpace;
      }
    }
    flushGroup(currentGroup, currentGroupIsPhrase);

    return items;
  }, [selectedWords, wordTextMap, spaceSelectedWords, extractSentence, extractPhraseSentence]);

  // 保存到背单词
  const handleSaveToWordGroups = useCallback(async () => {
    if (selectedPhrases.length === 0 || isSaving) return;

    try {
      setIsSaving(true);
      
      // 生成分组名称：格式为"单词+当前日期（年月日）"
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const groupName = `单词${year}${month}${day}`;
      
      // 准备单词数据（包含翻译信息）
      const words = selectedPhrases.map(item => ({
        key: item.key,
        text: item.text,
        isPhrase: item.isPhrase,
        sentence: item.sentence || '',
        translation: translations.get(item.key) || ''
      }));

      const response = await axios.post(
        'http://localhost:3001/api/word-groups/add',
        { groupName, words },
        { withCredentials: true }
      );

      if (response.data.success) {
        message.success(`已成功保存 ${words.length} 个单词/短语到"${groupName}"`);
        if (onWordsSaved) {
          onWordsSaved();
        }
      } else {
        message.error('保存失败：' + (response.data.error || '未知错误'));
      }
    } catch (error) {
      console.error('保存到背单词失败:', error);
      message.error('保存失败：' + (error.response?.data?.error || error.message || '网络错误'));
    } finally {
      setIsSaving(false);
    }
  }, [selectedPhrases, filename, translations, isSaving, onWordsSaved]);

  // 翻译处理函数
  const handleTranslate = useCallback(async () => {
    if (selectedPhrases.length === 0 || isTranslating) return;

    // 过滤出尚未翻译的单词/短语
    const itemsToTranslate = selectedPhrases.filter(item => !translations.has(item.key));
    
    // 如果所有词都已经翻译过，提示用户
    if (itemsToTranslate.length === 0) {
      alert('所有选中的单词/短语已经翻译过了，无需重复翻译');
      return;
    }

    setIsTranslating(true);
    
    try {
      // 准备翻译请求数据（只包含未翻译的）
      const translateRequest = itemsToTranslate.map(item => ({
        key: item.key,
        text: item.text,
        isPhrase: item.isPhrase
      }));

      const response = await axios.post('http://localhost:3001/api/translate', {
        items: translateRequest,
        context: text // 传递上下文原文
      }, {
        withCredentials: true, // 携带 cookie
        timeout: 60000 // 60秒超时
      });

      if (response.data.success) {
        // 将新的翻译结果合并到现有的 Map 中（保留已翻译的，添加新翻译的）
        const newTranslations = new Map(translations); // 复制现有的翻译
        response.data.translations.forEach(({ key, translation }) => {
          newTranslations.set(key, translation);
        });
        setTranslations(newTranslations);
      } else {
        alert(`翻译失败: ${response.data.error || '未知错误'}`);
      }
    } catch (error) {
      console.error('翻译错误:', error);
      if (error.response) {
        alert(`翻译失败: ${error.response.data.error || '服务器错误'}`);
      } else if (error.request) {
        alert('无法连接到服务器，请确保后端服务正在运行');
      } else {
        alert(`翻译失败: ${error.message}`);
      }
    } finally {
      setIsTranslating(false);
    }
  }, [selectedPhrases, text, isTranslating, translations]);

  // 点击单词：切换选中 / 取消选中
  const handleWordClick = useCallback((wordIndex) => {
    const wordId = `word-${wordIndex}`;
    const isSpaceMode = isSpaceSelectingRef.current;

    // 更新选中状态
    setSelectedWords(prev => {
      const newSet = new Set(prev);
      const wasSelected = newSet.has(wordId);
      
      if (wasSelected) {
        newSet.delete(wordId);
      } else {
        newSet.add(wordId);
      }
      
      // 同时更新空格模式标记
      setSpaceSelectedWords(spacePrev => {
        const spaceNewSet = new Set(spacePrev);
        if (isSpaceMode) {
          // 空格模式：选中时标记为空格模式选中（用于形成短语），取消选中时移除
          if (wasSelected) {
            spaceNewSet.delete(wordId);
          } else {
            spaceNewSet.add(wordId);
          }
        } else {
          // 普通模式：取消选中时，如果之前是空格模式选中的，也要移除
          if (wasSelected && spacePrev.has(wordId)) {
            spaceNewSet.delete(wordId);
          }
        }
        return spaceNewSet;
      });
      
      return newSet;
    });
  }, []);

  // 渲染文本内容
  const renderTextContent = () => {
    if (!text) return '（无内容）';
    
    return parts.map((part, arrayIndex) => {
      if (part.isWord && part.index >= 0) {
        const wordId = `word-${part.index}`;
        const isSelected = selectedWords.has(wordId);
        
        return (
          <span
            key={`word-${arrayIndex}-${part.index}`}
            id={wordId}
            className={`word ${isSelected ? 'word-selected' : ''}`}
            onClick={() => handleWordClick(part.index)}
            data-word-index={part.index}
          >
            {part.text}
          </span>
        );
      }
      // 空格和换行符会通过 white-space: pre-wrap 自动处理，直接渲染
      return <span key={`space-${arrayIndex}`}>{part.text}</span>;
    });
  };

  return (
    <div className="result-layout">
      <div className="text-display">
        <div className="text-display-header">
          <div className="file-info">
            <h3>解析结果</h3>
            <p className="filename">文件: {filename}</p>
            <p className="text-stats">
              字符数: {text.length.toLocaleString()} | 
              行数: {text.split('\n').length}
              {selectedWords.size > 0 && (
                <span className="selection-info">
                  {' | '}已选中: {selectedWords.size} 个单词
                </span>
              )}
            </p>
          </div>
        </div>
        <div 
          className={`text-content ${isSpacePressed ? 'space-mode' : ''}`}
          ref={textContentRef}
        >
          <pre>{renderTextContent()}</pre>
        </div>
      </div>

      <div className="candidate-panel">
        <div className="candidate-header">
          <h3>候选词</h3>
          <div className="candidate-header-right">
            <span className="candidate-count">
              {selectedPhrases.length} 个条目
              {selectedPhrases.length > 0 && translations.size > 0 && (
                <span className="translated-count">
                  （已翻译: {Array.from(selectedPhrases).filter(item => translations.has(item.key)).length}）
                </span>
              )}
            </span>
            {selectedPhrases.length > 0 && (
              <>
                <button
                  className="translate-btn"
                  onClick={handleTranslate}
                  disabled={isTranslating || selectedPhrases.every(item => translations.has(item.key))}
                >
                  {isTranslating ? '翻译中...' : 
                   selectedPhrases.every(item => translations.has(item.key)) ? '已全部翻译' : 
                   '翻译'}
                </button>
                <button
                  className="save-btn"
                  onClick={handleSaveToWordGroups}
                  disabled={isSaving}
                  style={{ marginLeft: '8px' }}
                >
                  {isSaving ? '保存中...' : '保存到背单词'}
                </button>
              </>
            )}
          </div>
        </div>
        <div className="candidate-body">
          {selectedPhrases.length > 0 ? (
            <ul className="candidate-list">
              {selectedPhrases.map((item) => (
                <li key={item.key} className="candidate-item">
                  <div className="candidate-content">
                    <div className="candidate-word-section">
                      <span className="candidate-text">{item.text}</span>
                      {item.isPhrase && (
                        <span className="candidate-tag">短语</span>
                      )}
                    </div>
                    {translations.has(item.key) && (
                      <span className="candidate-translation">
                        {translations.get(item.key)}
                      </span>
                    )}
                    {item.sentence && (
                      <div className="candidate-sentence">
                        <span className="sentence-label">例句：</span>
                        <span className="sentence-text">{item.sentence}</span>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="candidate-empty">
              选中单词或短语后将显示在这里
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextDisplay;

