import React, { useRef } from 'react';
import axios from '../axiosConfig';
import { API_ENDPOINTS } from '../config/api';
import './FileUploader.css';

const FileUploader = ({ onFileParsed, onError, onLoading }) => {
  const fileInputRef = useRef(null);
  const API_URL = API_ENDPOINTS.UPLOAD;

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // 验证文件类型
    const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx'];
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();

    if (!allowedExtensions.includes(fileExt)) {
      onError('不支持的文件类型。仅支持: TXT, PDF, DOC, DOCX');
      return;
    }

    // 验证文件大小 (50MB)
    if (file.size > 50 * 1024 * 1024) {
      onError('文件大小不能超过 50MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      onLoading(true);
      onError('');

      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true, // 携带 cookie
        timeout: 60000, // 60秒超时
      });

      if (response.data.success) {
        onFileParsed({
          text: response.data.text,
          filename: response.data.filename,
          size: response.data.size
        });
      } else {
        onError(response.data.error || '文件解析失败');
      }
    } catch (error) {
      if (error.response) {
        onError(error.response.data.error || '服务器错误');
      } else if (error.request) {
        onError('无法连接到服务器，请确保后端服务正在运行');
      } else {
        onError(error.message || '上传失败');
      }
    } finally {
      onLoading(false);
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
      const syntheticEvent = {
        target: { files: [file] }
      };
      handleFileSelect(syntheticEvent);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="file-uploader">
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClick}
      >
        <p className="upload-text">点击或拖拽文件到此处上传（TXT / PDF / DOC / DOCX，最大 50MB）</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};

export default FileUploader;

