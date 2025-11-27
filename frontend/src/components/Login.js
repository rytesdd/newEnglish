import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const API_URL = API_ENDPOINTS.LOGIN;

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      const response = await axios.post(
        API_URL,
        { password: values.password },
        {
          withCredentials: true, // 重要：允许携带 cookie
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        message.success('登录成功');
        // 等待一下确保 Cookie 被浏览器保存
        setTimeout(() => {
          onLoginSuccess();
        }, 100);
      } else {
        message.error(response.data.error || '登录失败');
      }
    } catch (error) {
      let errorMsg = '登录失败';
      if (error.response) {
        errorMsg = error.response.data.error || '密码错误';
      } else if (error.request) {
        errorMsg = '无法连接到服务器，请确保后端服务正在运行';
      } else {
        errorMsg = error.message || '登录失败';
      }
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="login-title">文件解析工具</h1>
        <p className="login-subtitle">请输入密码以继续</p>
        <Form
          form={form}
          onFinish={handleLogin}
          layout="vertical"
          className="login-form"
        >
          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' }
            ]}
          >
            <Input.Password
              size="large"
              placeholder="请输入密码"
              autoFocus
              onPressEnter={() => form.submit()}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              block
              className="login-button"
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default Login;



