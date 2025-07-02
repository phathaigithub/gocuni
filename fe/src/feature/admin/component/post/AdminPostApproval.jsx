import React, { useState, useEffect } from 'react';
import { Table, Button, Badge, Modal, Spinner, Alert, Form, Card, Row, Col } from 'react-bootstrap';
import { FaEye, FaCheck, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import '../../styles/adminPost.css';

const AdminPostApproval = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  
  // Fetch pending posts
  useEffect(() => {
    const fetchPendingPosts = async () => {
      setLoading(true);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/posts/pending', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setPosts(response.data.data.posts);
      } catch (err) {
        console.error('Error fetching pending posts:', err);
        setError('Không thể tải danh sách bài viết chờ duyệt. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPendingPosts();
  }, []);
  
  // Approve post
  const handleApprove = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:8080/api/admin/posts/${postId}/status`, 
        { status: 'PUBLISHED' },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove approved post from list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
      
      setSuccess('Đã duyệt bài viết thành công');
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error approving post:', err);
      setError('Không thể duyệt bài viết. Vui lòng thử lại sau.');
    }
  };
  
  // Show reject modal
  const handleShowRejectModal = (post) => {
    setSelectedPost(post);
    setRejectReason('');
    setShowRejectModal(true);
  };
  
  // Close reject modal
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedPost(null);
    setRejectReason('');
  };
  
  // Reject post
  const handleReject = async () => {
    if (!selectedPost || !rejectReason.trim()) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:8080/api/admin/posts/${selectedPost.id}/reject`, 
        { reason: rejectReason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      // Remove rejected post from list
      setPosts(prevPosts => prevPosts.filter(post => post.id !== selectedPost.id));
      
      setSuccess('Đã từ chối bài viết thành công');
      handleCloseRejectModal();
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error rejecting post:', err);
      setError('Không thể từ chối bài viết. Vui lòng thử lại sau.');
      handleCloseRejectModal();
    }
  };
  
  // View post
  const handleViewPost = (postId) => {
    window.open(`/post/${postId}`, '_blank');
  };
  
  // Format date
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
  
  return (
    <div className="admin-post-approval">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Duyệt bài viết</h2>
      </div>
      
      {success && (
        <Alert variant="success" className="mb-3">
          {success}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Card>
        <Card.Body>
          <Row className="mb-4">
            <Col>
              <h5>
                Bài viết chờ duyệt <Badge bg="warning" text="dark">{posts.length}</Badge>
              </h5>
              <p className="text-muted">Các bài viết đang chờ duyệt từ người dùng.</p>
            </Col>
          </Row>
          
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            posts.length > 0 ? (
              <div className="table-responsive">
                <Table hover bordered className="align-middle">
                  <thead className="bg-light">
                    <tr>
                      <th>ID</th>
                      <th>Tiêu đề</th>
                      <th>Tác giả</th>
                      <th>Danh mục</th>
                      <th>Ngày gửi</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id}>
                        <td>{post.id}</td>
                        <td className="text-truncate" style={{maxWidth: '200px'}}>{post.title}</td>
                        <td>{post.author?.fullName || post.author?.email || 'Không xác định'}</td>
                        <td>{post.category?.name || 'Không xác định'}</td>
                        <td>{formatDate(post.createdAt)}</td>
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
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => handleApprove(post.id)}
                              title="Duyệt bài viết"
                            >
                              <FaCheck />
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => handleShowRejectModal(post)}
                              title="Từ chối bài viết"
                            >
                              <FaTimes />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            ) : (
              <Alert variant="info">
                Không có bài viết nào đang chờ duyệt.
              </Alert>
            )
          )}
        </Card.Body>
      </Card>
      
      {/* Modal từ chối bài viết */}
      <Modal show={showRejectModal} onHide={handleCloseRejectModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Từ chối bài viết</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPost && (
            <>
              <p>Bạn đang từ chối bài viết: <strong>{selectedPost.title}</strong></p>
              <Form.Group className="mb-3">
                <Form.Label>Lý do từ chối</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối để gửi cho tác giả..."
                />
                <Form.Text className="text-muted">
                  Lý do từ chối sẽ được gửi đến tác giả bài viết.
                </Form.Text>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseRejectModal}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleReject} disabled={!rejectReason.trim()}>
            <FaTimes className="me-1" /> Từ chối bài viết
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminPostApproval;