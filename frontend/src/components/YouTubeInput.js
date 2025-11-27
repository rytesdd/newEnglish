import React, { useState, useRef } from 'react';
import axios from '../axiosConfig';
import { Input, Form, message } from 'antd';
import { API_ENDPOINTS } from '../config/api';
import './YouTubeInput.css';

const YouTubeInput = ({ onTranscriptParsed, onError, onLoading }) => {
  const [form] = Form.useForm();
  const API_URL = API_ENDPOINTS.YOUTUBE_TRANSCRIPT;
  const submitTimeoutRef = useRef(null);

  const fetchTranscript = async (urlToFetch) => {
    try {
      onLoading(true);
      onError('');

      const response = await axios.post(API_URL, { url: urlToFetch.trim() }, {
        withCredentials: true, // 携带 cookie
        timeout: 60000,
      });

      if (response.data.success) {
        onTranscriptParsed({
          text: response.data.text,
          filename: response.data.filename,
          size: response.data.text.length,
          videoId: response.data.videoId
        });
        message.success('字幕获取成功');
      } else {
        const errorMsg = response.data.error || '获取字幕失败';
        onError(errorMsg);
        message.error(errorMsg);
      }
    } catch (error) {
      let errorMsg = '获取字幕失败';
      if (error.response) {
        errorMsg = error.response.data.error || '服务器错误';
      } else if (error.request) {
        errorMsg = '无法连接到服务器，请确保后端服务正在运行';
      } else {
        errorMsg = error.message || '获取字幕失败';
      }
      onError(errorMsg);
      message.error(errorMsg);
    } finally {
      onLoading(false);
    }
  };

  // 已移除 handleSubmit，现在使用自动解析

  const handleInputChange = (e) => {
    const newUrl = e.target.value;
    // Form.Item 会自动管理状态
    
    // 清除之前的定时器
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    
    // 检查是否是YouTube链接，如果是则自动提交
    if (newUrl.trim().match(/youtube\.com|youtu\.be/)) {
      submitTimeoutRef.current = setTimeout(() => {
        fetchTranscript(newUrl);
      }, 500);
    }
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <Form
        form={form}
        layout="inline"
        style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}
      >
        <Form.Item
          name="url"
          style={{ flex: 1, margin: 0 }}
          initialValue=""
        >
          <Input
            size="large"
            onChange={handleInputChange}
            placeholder="粘贴 YouTube 视频链接（例如：https://www.youtube.com/watch?v=...）"
            allowClear
            className="youtube-input-custom"
          />
        </Form.Item>
      </Form>
      <p style={{ marginTop: 8, marginBottom: 0, fontSize: '0.9rem', color: '#666', textAlign: 'center' }}>
        支持 YouTube 视频链接，自动获取字幕并显示
      </p>
    </div>
  );
};

export default YouTubeInput;
