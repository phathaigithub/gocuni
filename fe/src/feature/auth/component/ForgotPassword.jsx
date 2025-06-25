import { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaEnvelope } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { forgotPassword } from '../index';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return;
    }
    
    const result = await dispatch(forgotPassword(email));
    
    if (result.success) {
      setSubmitted(true);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Quên mật khẩu</h2>
                <p className="text-muted">Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu</p>
              </div>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              {submitted ? (
                <Alert variant="success">
                  Nếu email của bạn tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.
                  Vui lòng kiểm tra hộp thư đến của bạn.
                </Alert>
              ) : (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-4">
                    <Form.Label>Email</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FaEnvelope />
                      </span>
                      <Form.Control
                        type="email"
                        placeholder="Nhập email đã đăng ký"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                    {loading ? 'Đang xử lý...' : 'Gửi yêu cầu'}
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

export default ForgotPassword;