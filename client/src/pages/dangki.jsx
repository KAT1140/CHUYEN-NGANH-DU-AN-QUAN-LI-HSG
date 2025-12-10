import React, { useState } from 'react';
import axios from 'axios'; // Đảm bảo bạn đã cài đặt: npm install axios

// Địa chỉ API của bạn
const REGISTER_API_URL = '/api/auth/register'; 

const DangKi = () => {
  // 1. STATE - Quản lý dữ liệu form và trạng thái tải
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false); // Trạng thái khi đang gửi API
  const [message, setMessage] = useState('');     // Thông báo thành công/lỗi

  // 2. HANDLER - Cập nhật state khi người dùng nhập liệu
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // 3. HANDLER - Xử lý gửi form và kết nối API
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Reset thông báo và bắt đầu tải
    setMessage(''); 
    setIsLoading(true);

    try {
      // Gửi yêu cầu POST đến API
      const response = await axios.post(REGISTER_API_URL, formData);
      
      // Xử lý thành công
      console.log('Đăng ký thành công:', response.data);
      setMessage('✅ Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
      
      // Xóa form sau khi đăng ký thành công
      setFormData({
        username: '',
        email: '',
        password: '',
      });

    } catch (error) {
      // Xử lý lỗi (Lỗi server, lỗi validation,...)
      console.error('Đăng ký thất bại:', error);
      
      const errorMessage = error.response 
        ? (error.response.data.message || 'Lỗi từ Server. Vui lòng thử lại.') 
        : 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường dẫn API.';

      setMessage(`❌ Đăng ký thất bại: ${errorMessage}`);

    } finally {
      setIsLoading(false); // Kết thúc tải
    }
  };

  return (
    <div style={styles.container}>
      <h2>Đăng Ký Tài Khoản</h2>
      
      {/* Hiển thị thông báo */}
      {message && <p style={message.startsWith('✅') ? styles.success : styles.error}>{message}</p>}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Trường Tên người dùng */}
        <div style={styles.formGroup}>
          <label htmlFor="username" style={styles.label}>Tên người dùng:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* Trường Email */}
        <div style={styles.formGroup}>
          <label htmlFor="email" style={styles.label}>Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* Trường Mật khẩu */}
        <div style={styles.formGroup}>
          <label htmlFor="password" style={styles.label}>Mật khẩu:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {/* Nút Đăng ký */}
        <button 
          type="submit" 
          disabled={isLoading} 
          style={styles.button}
        >
          {isLoading ? 'Đang Xử Lý...' : 'Đăng Ký'}
        </button>
      </form>
    </div>
  );
};

// CSS cơ bản (dùng inline style cho ví dụ đơn giản)
const styles = {
  container: {
    maxWidth: '400px',
    margin: '50px auto',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontWeight: 'bold',
  },
  input: {
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    fontSize: '16px',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  success: {
    color: 'green',
    backgroundColor: '#e6ffe6',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid green'
  },
  error: {
    color: 'red',
    backgroundColor: '#ffe6e6',
    padding: '10px',
    borderRadius: '4px',
    border: '1px solid red'
  }
};

export default DangKi;