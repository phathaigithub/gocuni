import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, clearSuccess, authFailure } from '../index';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { loading, error, success } = useSelector((state) => state.auth);
  

  // Chuyển đến trang đăng nhập sau khi đăng ký thành công
  useEffect(() => {
    
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [success, navigate]);

  // useEffect riêng biệt cho việc cleanup khi unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
      dispatch(clearSuccess());
    };
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (formData.password !== formData.confirmPassword) {
      dispatch(authFailure('Mật khẩu xác nhận không khớp'));
      return;
    }
    
    if (formData.password.length < 6) {
      dispatch(authFailure('Mật khẩu phải có ít nhất 6 ký tự'));
      return;
    }
    
    try {
      // Dispatch action đăng ký và log kết quả
      const result = await dispatch(registerUser({
        email: formData.email,
        password: formData.password
      }));
      
      
      // Nếu đăng ký thành công, thông báo cho người dùng
      if (result && result.success) {
        // Thông báo sẽ được hiển thị qua useEffect dựa vào trạng thái success
        console.log("Đăng ký thành công, chuẩn bị chuyển hướng");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Đăng ký tài khoản</h2>
                <p className="text-muted">Tạo tài khoản mới để truy cập đầy đủ tính năng</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Đăng ký thành công! Bạn có thể đăng nhập ngay bây giờ.</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaEnvelope />
                    </span>
                    <Form.Control
                      type="email"
                      name="email"
                      placeholder="Nhập email của bạn"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      name="password"
                      placeholder="Tạo mật khẩu (ít nhất 6 ký tự)"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      minLength={6}
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Xác nhận mật khẩu</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      placeholder="Nhập lại mật khẩu"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Đăng ký'}
                </Button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Đã có tài khoản?{' '}
                    <Link to="/login" className="text-decoration-none fw-bold">
                      Đăng nhập
                    </Link>
                  </p>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Register;