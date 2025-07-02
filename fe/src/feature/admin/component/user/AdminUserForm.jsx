import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Image } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminUserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    gender: '',
    dateOfBirth: '',
    role: 'ROLE_USER',
    enable: true
  });
  
  const [roles, setRoles] = useState([]);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Fetch roles khi component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/users/roles', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setRoles(response.data.data);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Không thể tải danh sách vai trò. Vui lòng thử lại sau.');
      }
    };
    
    fetchRoles();
  }, []);
  
  // Fetch user data khi ở chế độ edit
  useEffect(() => {
    if (isEditMode) {
      const fetchUserData = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8080/api/admin/users/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const userData = response.data.data;
          setFormData({
            email: userData.email || '',
            password: '', // Không hiển thị mật khẩu
            fullName: userData.fullName || '',
            gender: userData.gender || '',
            dateOfBirth: userData.dateOfBirth ? userData.dateOfBirth.substring(0, 10) : '',
            role: userData.role?.name || 'ROLE_USER',
            enable: userData.enable !== undefined ? userData.enable : true
          });
          
          if (userData.avatarUrl) {
            setAvatarPreview(`http://localhost:8080/upload${userData.avatarUrl}`);
          }
        } catch (err) {
          console.error('Error fetching user:', err);
          setError('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchUserData();
    }
  }, [id, isEditMode]);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (isEditMode) {
        // Chế độ chỉnh sửa
        const formDataToSend = new FormData();
        formDataToSend.append('fullName', formData.fullName);
        formDataToSend.append('gender', formData.gender);
        
        if (formData.dateOfBirth) {
          formDataToSend.append('dateOfBirth', formData.dateOfBirth);
        }
        
        formDataToSend.append('role', formData.role);
        formDataToSend.append('enable', formData.enable);
        
        if (formData.password) {
          formDataToSend.append('password', formData.password);
        }
        
        if (avatar) {
          formDataToSend.append('avatar', avatar);
        }
        
        await axios.put(`http://localhost:8080/api/admin/users/${id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        
        setSuccess('Cập nhật người dùng thành công!');
      } else {
        // Chế độ tạo mới
        await axios.post('http://localhost:8080/api/admin/users', formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setSuccess('Tạo người dùng thành công!');
        
        // Reset form nếu ở chế độ tạo mới
        if (!isEditMode) {
          setFormData({
            email: '',
            password: '',
            fullName: '',
            gender: '',
            dateOfBirth: '',
            role: 'ROLE_USER',
            enable: true
          });
          setAvatar(null);
          setAvatarPreview(null);
        }
      }
      
      // Chuyển hướng về trang danh sách sau 2 giây
      setTimeout(() => {
        navigate('/admin/users');
      }, 2000);
    } catch (err) {
      console.error('Error saving user:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEditMode && !formData.email) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }
  
  return (
    <div className="admin-user-form">
      <h2 className="mb-4">{isEditMode ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}</h2>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      
      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isEditMode}
                    required={!isEditMode}
                  />
                  {isEditMode && (
                    <Form.Text className="text-muted">
                      Email không thể thay đổi sau khi tạo.
                    </Form.Text>
                  )}
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>{isEditMode ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu'}</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditMode}
                    minLength={6}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Tên đầy đủ</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Giới tính</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày sinh</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <Form.Group className="mb-3">
                  <Form.Label>Vai trò</Form.Label>
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    required
                  >
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>
                        {role.name === 'ROLE_ADMIN' ? 'Admin' : 'User'} - {role.description}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                {isEditMode && (
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="switch"
                      id="enable-switch"
                      label="Kích hoạt tài khoản"
                      name="enable"
                      checked={formData.enable}
                      onChange={handleChange}
                    />
                  </Form.Group>
                )}
                
                <Form.Group className="mb-3">
                  <Form.Label>Ảnh đại diện</Form.Label>
                  {avatarPreview && (
                    <div className="mb-2">
                      <Image
                        src={avatarPreview}
                        alt="Avatar preview"
                        thumbnail
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <div className="d-flex gap-2 mt-3">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Đang xử lý...
                  </>
                ) : (
                  isEditMode ? 'Cập nhật' : 'Tạo người dùng'
                )}
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/admin/users')}>
                Hủy
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminUserForm;