import { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { resetPassword } from '../index';

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [validated, setValidated] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, success } = useSelector((state) => state.auth);
  
  // Lấy token từ query string
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');
    
    if (token) {
      setFormData(prev => ({ ...prev, token }));
    }
  }, [location]);
  
  // Redirect sau khi đặt lại mật khẩu thành công
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        navigate('/login');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success, navigate]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear password error when typing
    if (name === 'newPassword' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    setValidated(true);
    
    // Validate password match
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordError('Mật khẩu xác nhận không khớp');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setPasswordError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    
    if (form.checkValidity() === true) {
      await dispatch(resetPassword({
        token: formData.token,
        newPassword: formData.newPassword
      }));
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Đặt lại mật khẩu</h2>
                <p className="text-muted">Tạo mật khẩu mới cho tài khoản của bạn</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {success && (
                <Alert variant="success">
                  Đặt lại mật khẩu thành công! Bạn sẽ được chuyển đến trang đăng nhập trong vài giây.
                </Alert>
              )}
              
              {!success && (
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  {!formData.token && (
                    <Alert variant="danger">
                      Token không hợp lệ. Vui lòng kiểm tra lại liên kết trong email của bạn.
                    </Alert>
                  )}
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Mật khẩu mới</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                        minLength={6}
                        isInvalid={!!passwordError}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordError || 'Vui lòng nhập mật khẩu có ít nhất 6 ký tự'}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Xác nhận mật khẩu mới</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaLock />
                      </span>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        placeholder="Nhập lại mật khẩu mới"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        isInvalid={!!passwordError}
                      />
                      <Form.Control.Feedback type="invalid">
                        {passwordError || 'Vui lòng xác nhận mật khẩu'}
                      </Form.Control.Feedback>
                    </div>
                  </Form.Group>
                  
                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100 py-2 mb-3"
                    disabled={loading || !formData.token}
                  >
                    {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                  </Button>
                  
                  <div className="text-center">
                    <p className="mb-0">
                      <Link to="/login" className="text-decoration-none">
                        Quay lại đăng nhập
                      </Link>
                    </p>
                  </div>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPassword;