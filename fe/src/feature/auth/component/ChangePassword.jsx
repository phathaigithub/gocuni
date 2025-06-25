import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaLock } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { changePassword } from '../index';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [successMessage, setSuccessMessage] = useState('');
  const dispatch = useDispatch();
  
  const { loading, error } = useSelector((state) => state.auth);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset messages
    setSuccessMessage('');
    
    // Validate form
    if (formData.newPassword !== formData.confirmPassword) {
      dispatch({ 
        type: 'auth/authFailure', 
        payload: 'Mật khẩu xác nhận không khớp' 
      });
      return;
    }
    
    if (formData.newPassword.length < 6) {
      dispatch({ 
        type: 'auth/authFailure', 
        payload: 'Mật khẩu mới phải có ít nhất 6 ký tự' 
      });
      return;
    }
    
    try {
      // Dispatch action đổi mật khẩu
      const result = await dispatch(changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }));
      
      if (result.success) {
        setSuccessMessage(result.message || 'Đổi mật khẩu thành công!');
        // Reset form
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        
        // Hiển thị thông báo thành công và giữ phiên đăng nhập
        console.log('Mật khẩu đã được thay đổi thành công. Phiên đăng nhập của bạn vẫn được duy trì.');
      }
    } catch (err) {
      console.error('Error changing password:', err);
    }
  };
  
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Đổi mật khẩu</h2>
                <p className="text-muted">Cập nhật mật khẩu mới để bảo vệ tài khoản của bạn</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu hiện tại</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      name="oldPassword"
                      placeholder="Nhập mật khẩu hiện tại"
                      value={formData.oldPassword}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </Form.Group>
                
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
                    />
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
                    />
                  </div>
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 py-2 mb-3"
                  disabled={loading}
                >
                  {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ChangePassword;