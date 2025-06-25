import { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaLock, FaEnvelope } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../index';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  
  // Kiểm tra xem có redirect URL không
  const from = location.state?.from?.pathname || '/';

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Clear errors khi unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const emailRef = useRef(null);

  const debouncedSubmit = useCallback(
    async (e) => {
      if (loading) return;
      
      // Di chuyển nội dung của handleSubmit vào đây
      e.preventDefault();
      console.log('Form submit prevented');
      setLocalError(''); // Reset local error

      // Kiểm tra thông tin nhập vào
      if (!email.trim() || !password.trim()) {
        setLocalError('Vui lòng nhập đầy đủ email và mật khẩu.');
        return;
      }

      try {
        console.log('Dispatching loginUser action');
        // Dispatch action đăng nhập
        const result = await dispatch(loginUser({ email, password }));
        console.log('Login result:', result);
        
        if (!result.success) {
          setLocalError('Email hoặc mật khẩu không đúng. Vui lòng thử lại.');
        }
      } catch (err) {
        console.error('Login error in component:', err);
        setLocalError('Đã xảy ra lỗi khi đăng nhập. Vui lòng thử lại sau.');
      }
    },
    [loading, email, password, dispatch] // Thêm đầy đủ các dependencies
  );

  // Focus vào trường email khi có lỗi địa phương
  useEffect(() => {
    if (localError && emailRef.current) {
      emailRef.current.focus();
    }
  }, [localError]);

  // Trong useEffect sau khi component mount
  useEffect(() => {
    // Kiểm tra nếu có query param session_expired=true
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('session_expired') === 'true') {
      setLocalError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
  }, [location.search]);

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold mb-1">Đăng nhập</h2>
                <p className="text-muted">Đăng nhập để truy cập vào tài khoản của bạn</p>
              </div>
              
              {(error || localError) && (
                <Alert 
                  variant="danger" 
                  className="text-center mb-4"
                  style={{
                    animation: 'fadeIn 0.3s',
                    fontWeight: '500'
                  }}
                >
                  {localError || error}
                </Alert>
              )}
              
              <Form onSubmit={debouncedSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaEnvelope />
                    </span>
                    <Form.Control
                      type="email"
                      placeholder="Nhập email của bạn"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={localError ? "border-danger" : ""}
                      ref={emailRef}
                    />
                  </div>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <Form.Label>Mật khẩu</Form.Label>
                    <Link to="/forgot-password" className="text-decoration-none small">
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <div className="input-group">
                    <span className="input-group-text">
                      <FaLock />
                    </span>
                    <Form.Control
                      type="password"
                      placeholder="Nhập mật khẩu của bạn"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
                
                <div className="text-center">
                  <p className="mb-0">
                    Chưa có tài khoản?{' '}
                    <Link to="/register" className="text-decoration-none fw-bold">
                      Đăng ký ngay
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

export default LoginPage;