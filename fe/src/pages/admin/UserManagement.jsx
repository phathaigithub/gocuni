import { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Spinner, Badge, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus, FaSearch } from 'react-icons/fa';
import api from '../../service/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    role: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  // Sửa phương thức fetchUsers để sử dụng endpoint đúng
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Debug - kiểm tra token
      const token = localStorage.getItem('token');
      console.log('Token hiện tại:', token ? 'Có token' : 'Không có token');
      
      console.log('Gửi request đến /api/users/getAllUsers');
      
      const response = await api.get('/users/getAllUsers');
      
      if (response.status === 200 && response.data) {
        console.log('Response thành công:', response.data);
        setUsers(response.data.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách người dùng:', error.response || error);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
      
      // Dữ liệu giả để demo UI khi API lỗi
      setUsers([
        { id: 1, email: 'admin2@example.com', fullName: 'Admin User', role: 1, createdAt: '2025-05-01T10:20:30' },
        { id: 2, email: 'user1@example.com', fullName: 'Nguyễn Văn A', role: 0, createdAt: '2025-05-10T14:30:00' },
        { id: 3, email: 'user2@example.com', fullName: 'Trần Thị B', role: 0, createdAt: '2025-05-15T09:45:20' },
        { id: 4, email: 'editor@example.com', fullName: 'Lê Văn C', role: 2, createdAt: '2025-05-18T16:10:15' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (user = null) => {
    setError('');
    if (user) {
      setCurrentUser(user);
      setFormData({
        email: user.email,
        fullName: user.fullName,
        password: '', // Không hiển thị mật khẩu khi chỉnh sửa
        role: user.role
      });
    } else {
      setCurrentUser(null);
      setFormData({
        email: '',
        fullName: '',
        password: '',
        role: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'role' ? parseInt(value, 10) : value
    });
  };

  // Sửa phương thức handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (currentUser) {
        // Cập nhật người dùng
        const userData = {...formData};
        if (!userData.password) delete userData.password; // Không gửi mật khẩu trống
        
        const response = await api.put(`/admin/users/${currentUser.id}`, userData);
        
        if (response.status === 200) {
          fetchUsers();
          handleCloseModal();
        }
      } else {
        // Tạo người dùng mới
        const response = await api.post('/users', formData);
        
        if (response.status === 201) {
          fetchUsers();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu người dùng:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin người dùng');
    }
  };

  // Sửa phương thức handleDelete
  const handleDelete = async (userId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
      try {
        setError('');
        
        const response = await api.delete(`/admin/users/${userId}`);
        
        if (response.status === 200) {
          fetchUsers();
        }
      } catch (error) {
        console.error('Lỗi khi xóa người dùng:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa người dùng');
      }
    }
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Chuyển đổi role number sang text
  const getRoleText = (role) => {
    switch (role) {
      case 1: return 'ADMIN';
      case 2: return 'EDITOR';
      case 0:
      default: return 'USER';
    }
  };

  // Chọn màu sắc cho badge dựa vào role
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 1: return 'danger';
      case 2: return 'warning';
      case 0:
      default: return 'success';
    }
  };

  return (
    <div className="user-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản lý người dùng</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaUserPlus className="me-2" /> Thêm người dùng
        </Button>
      </div>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <div className="search-box position-relative">
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm người dùng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
            </Col>
          </Row>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map(user => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg={getRoleBadgeColor(user.role)}>
                            {getRoleText(user.role)}
                          </Badge>
                        </td>
                        <td>{formatDate(user.createdAt)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleShowModal(user)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.role === 1} // Không cho phép xóa admin
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        Không tìm thấy người dùng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal Thêm/Sửa người dùng */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Vai trò</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value={0}>Người dùng</option>
                <option value={2}>Biên tập viên</option>
                <option value={1}>Quản trị viên</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>{currentUser ? 'Mật khẩu mới (để trống nếu không thay đổi)' : 'Mật khẩu'}</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!currentUser}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {currentUser ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManagement;