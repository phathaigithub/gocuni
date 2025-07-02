import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Pagination, Badge, Modal, Spinner, Alert, Container, Card, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUserPlus, FaSearch, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/adminUser.css';

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  
  const navigate = useNavigate();
  
  // Hàm fetch danh sách users
  const fetchUsers = async (page = 0, search = '') => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/admin/users`, {
        params: {
          page,
          size: 10,
          sortBy: 'id',
          direction: 'desc',
          keyword: search || undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUsers(response.data.data.users);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchUsers();
  }, []);
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(0, searchTerm);
  };
  
  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    fetchUsers(pageNumber, searchTerm);
  };
  
  // Xử lý xóa người dùng
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setUserToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeleteSuccess(`Đã xóa người dùng "${userToDelete.fullName}" thành công`);
      setShowDeleteModal(false);
      setUserToDelete(null);
      
      // Fetch lại danh sách người dùng
      fetchUsers(currentPage, searchTerm);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Không thể xóa người dùng. Vui lòng thử lại sau.');
      setShowDeleteModal(false);
    }
  };
  
  // Xử lý thay đổi trạng thái người dùng
  const handleToggleStatus = async (user) => {
    try {
      const token = localStorage.getItem('token');
      const newStatus = !user.enable;
      
      await axios.patch(`http://localhost:8080/api/admin/users/${user.id}/status?enable=${newStatus}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Fetch lại danh sách người dùng
      fetchUsers(currentPage, searchTerm);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setStatusUpdateSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Không thể thay đổi trạng thái người dùng. Vui lòng thử lại sau.');
    }
  };
  
  // Render pagination
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const items = [];
    
    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
        disabled={currentPage === 0}
      />
    );
    
    // Page numbers
    for (let i = 0; i < totalPages; i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i + 1}
        </Pagination.Item>
      );
    }
    
    // Next button
    items.push(
      <Pagination.Next
        key="next"
        onClick={() => handlePageChange(Math.min(totalPages - 1, currentPage + 1))}
        disabled={currentPage === totalPages - 1}
      />
    );
    
    return <Pagination className="justify-content-center mt-4">{items}</Pagination>;
  };
  
  return (
    <div className="admin-user-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Quản lý người dùng</h2>
        <Button 
          variant="primary" 
          onClick={() => navigate('/admin/users/create')}
        >
          <FaUserPlus className="me-2" /> Thêm người dùng
        </Button>
      </div>
      
      {deleteSuccess && (
        <Alert variant="success" className="mb-3">
          {deleteSuccess}
        </Alert>
      )}
      
      {statusUpdateSuccess && (
        <Alert variant="success" className="mb-3">
          {statusUpdateSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch} className="mb-4">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo email hoặc tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="outline-secondary">
                <FaSearch /> Tìm kiếm
              </Button>
            </InputGroup>
          </Form>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover bordered className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Email</th>
                      <th>Tên đầy đủ</th>
                      <th>Vai trò</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length > 0 ? (
                      users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.email}</td>
                          <td>{user.fullName || 'Chưa cập nhật'}</td>
                          <td>
                            <Badge bg={user.role?.name === 'ROLE_ADMIN' ? 'danger' : 'info'}>
                              {user.role?.name === 'ROLE_ADMIN' ? 'Admin' : 'User'}
                            </Badge>
                          </td>
                          <td>
                            <Badge bg={user.enable ? 'success' : 'secondary'}>
                              {user.enable ? 'Hoạt động' : 'Vô hiệu hóa'}
                            </Badge>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant={user.enable ? 'warning' : 'success'} 
                                size="sm"
                                onClick={() => handleToggleStatus(user)}
                                title={user.enable ? 'Vô hiệu hóa tài khoản' : 'Kích hoạt tài khoản'}
                              >
                                {user.enable ? <FaToggleOff /> : <FaToggleOn />}
                              </Button>
                              <Button 
                                variant="danger" 
                                size="sm"
                                onClick={() => handleDeleteClick(user)}
                                disabled={user.role?.name === 'ROLE_ADMIN'}
                                title={user.role?.name === 'ROLE_ADMIN' ? 'Không thể xóa tài khoản Admin' : 'Xóa tài khoản'}
                              >
                                <FaTrash />
                              </Button>
                            </div>
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
              
              {renderPagination()}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {userToDelete && (
            <>
              <p>Bạn có chắc chắn muốn xóa người dùng "<strong>{userToDelete.fullName}</strong>" (Email: {userToDelete.email})?</p>
              <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseDeleteModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUserList;