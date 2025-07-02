import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Pagination, Badge, Modal, Spinner, Alert, Card, Row, Col, Dropdown } from 'react-bootstrap';
import { FaEdit, FaTrash, FaFileAlt, FaSearch, FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/adminPost.css';

const AdminPostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState('');
  
  const navigate = useNavigate();
  
  // Hàm fetch danh sách bài viết
  const fetchPosts = async (page = 0, size = 10, sortBy = 'createdAt', direction = 'desc', keyword = '', status = '') => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.get('http://localhost:8080/api/admin/posts', {
        params: {
          page,
          size,
          sortBy,
          direction,
          keyword: keyword || undefined,
          status: status || undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };
  
  // Hàm xóa bài viết
  const deletePost = async (id) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.delete(`http://localhost:8080/api/admin/posts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };
  
  // Hàm cập nhật trạng thái bài viết
  const updatePostStatus = async (id, status) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await axios.patch(`http://localhost:8080/api/admin/posts/${id}/status`, 
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      return response.data;
    } catch (err) {
      throw err;
    }
  };
  
  // Hàm fetch danh sách bài viết
  const fetchPostsList = async (page = 0, search = '', status = '') => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetchPosts(page, 10, 'createdAt', 'desc', search, status);
      
      setPosts(response.data.posts);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load dữ liệu khi component mount
  useEffect(() => {
    fetchPostsList(0, searchTerm, statusFilter);
  }, []);
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchPostsList(0, searchTerm, statusFilter);
  };
  
  // Xử lý lọc theo trạng thái
  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(0);
    fetchPostsList(0, searchTerm, status);
  };
  
  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchPostsList(pageNumber, searchTerm, statusFilter);
  };
  
  // Xử lý xóa bài viết
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      await deletePost(postToDelete.id);
      
      setDeleteSuccess(`Đã xóa bài viết "${postToDelete.title}" thành công`);
      setShowDeleteModal(false);
      setPostToDelete(null);
      
      // Fetch lại danh sách bài viết
      fetchPostsList(currentPage, searchTerm, statusFilter);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Không thể xóa bài viết. Vui lòng thử lại sau.');
      setShowDeleteModal(false);
    }
  };
  
  // Xử lý thay đổi trạng thái bài viết
  const handleStatusChange = async (postId, newStatus) => {
    try {
      await updatePostStatus(postId, newStatus);
      
      setStatusUpdateSuccess(`Đã cập nhật trạng thái bài viết thành công`);
      
      // Fetch lại danh sách bài viết
      fetchPostsList(currentPage, searchTerm, statusFilter);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setStatusUpdateSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error updating post status:', err);
      setError('Không thể cập nhật trạng thái bài viết. Vui lòng thử lại sau.');
    }
  };
  
  // Xử lý xem chi tiết bài viết
  const handleViewPost = (postId) => {
    // Mở trang xem chi tiết bài viết trong tab mới
    window.open(`/post/${postId}`, '_blank');
  };
  
  // Format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Lấy badge cho trạng thái bài viết
  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge bg="success">Đã xuất bản</Badge>;
      case 'DRAFT':
        return <Badge bg="secondary">Bản nháp</Badge>;
      case 'PENDING':
        return <Badge bg="warning" text="dark">Chờ duyệt</Badge>;
      case 'REJECTED':
        return <Badge bg="danger">Từ chối</Badge>;
      default:
        return <Badge bg="light" text="dark">Không xác định</Badge>;
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
    <div className="admin-post-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Quản lý bài viết</h2>
        <div>
          <Button 
            variant="success" 
            onClick={() => navigate('/admin/posts/approval')}
            className="me-2"
          >
            <FaCheck className="me-2" /> Duyệt bài viết
          </Button>
          <Button 
            variant="primary" 
            onClick={() => navigate('/admin/posts/create')}
          >
            <FaFileAlt className="me-2" /> Tạo bài viết
          </Button>
        </div>
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
          <Row className="mb-3">
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <InputGroup>
                  <Form.Control
                    type="text"
                    placeholder="Tìm kiếm bài viết..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" variant="outline-secondary">
                    <FaSearch /> Tìm kiếm
                  </Button>
                </InputGroup>
              </Form>
            </Col>
            <Col md={6}>
              <div className="d-flex justify-content-md-end">
                <Form.Select 
                  className="w-auto" 
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="PUBLISHED">Đã xuất bản</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="PENDING">Chờ duyệt</option>
                  <option value="REJECTED">Từ chối</option>
                </Form.Select>
              </div>
            </Col>
          </Row>
          
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
                      <th>Tiêu đề</th>
                      <th>Tác giả</th>
                      <th>Danh mục</th>
                      <th>Ngày tạo</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.length > 0 ? (
                      posts.map(post => (
                        <tr key={post.id}>
                          <td>{post.id}</td>
                          <td className="title-cell">
                            <div className="text-truncate" title={post.title}>
                              {post.title}
                            </div>
                          </td>
                          <td>{post.author?.fullName || post.author?.email || 'Không xác định'}</td>
                          <td>{post.category?.name || 'Không xác định'}</td>
                          <td>{formatDate(post.createdAt)}</td>
                          <td>{getStatusBadge(post.status)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-info" 
                                size="sm" 
                                onClick={() => handleViewPost(post.id)}
                                title="Xem bài viết"
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => navigate(`/admin/posts/edit/${post.id}`)}
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>
                              <Dropdown>
                                <Dropdown.Toggle variant="outline-secondary" size="sm" id={`dropdown-status-${post.id}`}>
                                  Trạng thái
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item 
                                    onClick={() => handleStatusChange(post.id, 'PUBLISHED')}
                                    disabled={post.status === 'PUBLISHED'}
                                  >
                                    <FaCheck className="text-success me-2" /> Xuất bản
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleStatusChange(post.id, 'DRAFT')}
                                    disabled={post.status === 'DRAFT'}
                                  >
                                    <FaFileAlt className="text-secondary me-2" /> Chuyển thành bản nháp
                                  </Dropdown.Item>
                                  <Dropdown.Item 
                                    onClick={() => handleStatusChange(post.id, 'REJECTED')}
                                    disabled={post.status === 'REJECTED'}
                                  >
                                    <FaTimes className="text-danger me-2" /> Từ chối
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteClick(post)}
                                title="Xóa bài viết"
                              >
                                <FaTrash />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="text-center py-3">
                          Không tìm thấy bài viết nào
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
          <Modal.Title>Xác nhận xóa bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {postToDelete && (
            <>
              <p>Bạn có chắc chắn muốn xóa bài viết "<strong>{postToDelete.title}</strong>"?</p>
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

export default AdminPostList;