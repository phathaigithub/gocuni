import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Pagination, Badge, Modal, Spinner, Alert, Card, Row, Col, Image } from 'react-bootstrap';
import { FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminCommentList = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  
  const navigate = useNavigate();
  
  // Hàm xử lý đường dẫn hình ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/150?text=No+Image';
    
    // Nếu là URL đầy đủ
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Xử lý đường dẫn avatar
    if (imagePath.includes('/avatars/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Xử lý đường dẫn media của bình luận
    if (imagePath.includes('/comments/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Nếu chỉ là tên file, giả định là file bình luận
    return `http://localhost:8080/upload/comments/${imagePath}`;
  };
  
  // Fetch danh sách bình luận
  const fetchComments = async (page = 0, search = '') => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/comments', {
        params: {
          page,
          size: 10,
          sortBy: 'createdAt',
          direction: 'desc',
          keyword: search || undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setComments(response.data.data.comments);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Không thể tải danh sách bình luận. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load danh sách bình luận khi component mount
  useEffect(() => {
    fetchComments(0, searchTerm);
  }, []);
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchComments(0, searchTerm);
  };
  
  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchComments(pageNumber, searchTerm);
  };
  
  // Xử lý xóa bình luận
  const handleDeleteClick = (comment) => {
    setCommentToDelete(comment);
    setShowDeleteModal(true);
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCommentToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!commentToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/comments/${commentToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeleteSuccess(`Đã xóa bình luận thành công`);
      setShowDeleteModal(false);
      setCommentToDelete(null);
      
      // Fetch lại danh sách bình luận
      fetchComments(currentPage, searchTerm);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Không thể xóa bình luận. Vui lòng thử lại sau.');
      setShowDeleteModal(false);
    }
  };
  
  // Xử lý xem chi tiết bình luận
  const handleViewComment = async (commentId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8080/api/admin/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Thay đổi từ response.data thành response.data.data
      setSelectedComment(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      console.error('Error fetching comment details:', err);
      let errorMsg = 'Không thể lấy thông tin chi tiết bình luận. Vui lòng thử lại sau.';
      
      // Hiển thị lỗi chi tiết hơn từ server nếu có
      if (err.response && err.response.data && err.response.data.message) {
        errorMsg = `Lỗi: ${err.response.data.message}`;
      }
      
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý đóng modal chi tiết
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedComment(null);
  };
  
  // Xử lý chuyển hướng đến bài viết
  const handleGoToPost = (postId) => {
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
  
  // Thêm CSS cho grid hiển thị media
  const commentMediaGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
    gap: '10px',
    marginTop: '10px'
  };

  const commentImageContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    padding: '5px',
    height: '120px'
  };
  
  return (
    <div className="admin-comment-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Quản lý bình luận</h2>
      </div>
      
      {deleteSuccess && (
        <Alert variant="success" className="mb-3">
          {deleteSuccess}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-3">
          {error}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={handleSearch} className="mb-3">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm bình luận..."
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
                      <th>Nội dung</th>
                      <th>Người dùng</th>
                      <th>Bài viết</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comments.length > 0 ? (
                      comments.map(comment => (
                        <tr key={comment.id}>
                          <td>{comment.id}</td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comment.content}</td>
                          <td>{comment.user?.fullName || comment.user?.email || 'Không xác định'}</td>
                          <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comment.post?.title || 'Không xác định'}</td>
                          <td>{formatDate(comment.createdAt)}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-info" 
                                size="sm" 
                                onClick={() => handleViewComment(comment.id)}
                                title="Xem chi tiết"
                              >
                                <FaEye />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteClick(comment)}
                                title="Xóa bình luận"
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
                          Không tìm thấy bình luận nào
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
          <Modal.Title>Xác nhận xóa bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {commentToDelete && (
            <>
              <p>Bạn có chắc chắn muốn xóa bình luận này?</p>
              <div className="p-3 bg-light rounded">
                <p className="mb-0"><strong>Nội dung:</strong> {commentToDelete.content}</p>
              </div>
              <p className="mt-3 text-danger">Lưu ý: Hành động này không thể hoàn tác và sẽ xóa cả các phản hồi của bình luận này (nếu có).</p>
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
      
      {/* Modal chi tiết bình luận */}
      <Modal show={showDetailModal} onHide={handleCloseDetailModal} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết bình luận</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComment && (
            <div>
              <Row className="mb-3">
                <Col xs={12}>
                  <Card>
                    <Card.Body>
                      <div className="d-flex mb-3">
                        <div className="me-3">
                          {selectedComment.user?.avatarUrl ? (
                            <Image 
                              src={getImageUrl(selectedComment.user.avatarUrl)} 
                              roundedCircle 
                              width={50} 
                              height={50} 
                              className="object-fit-cover"
                              onError={(e) => {
                                console.log("Avatar load error:", selectedComment.user.avatarUrl);
                                e.target.onerror = null;
                                e.target.src = 'https://via.placeholder.com/50?text=?';
                              }}
                            />
                          ) : (
                            <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center" style={{width: '50px', height: '50px'}}>
                              <span className="text-white">{selectedComment.user?.fullName?.charAt(0) || '?'}</span>
                            </div>
                          )}
                        </div>
                        <div>
                          <h5 className="mb-1">{selectedComment.user?.fullName || selectedComment.user?.email}</h5>
                          <p className="text-muted mb-0 small">{formatDate(selectedComment.createdAt)}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="mb-2"><strong>Nội dung bình luận:</strong></p>
                        <div className="p-3 bg-light rounded">
                          {selectedComment.content}
                        </div>
                      </div>
                      
                      {selectedComment.media && selectedComment.media.length > 0 && (
                        <div className="mb-3">
                          <p className="mb-2"><strong>File đính kèm:</strong></p>
                          <div style={commentMediaGridStyle}>
                            {selectedComment.media.map(media => (
                              <div key={media.id}>
                                {media.mediaType === 'image' ? (
                                  <div style={commentImageContainerStyle}>
                                    <Image 
                                      src={getImageUrl(media.mediaUrl)} 
                                      thumbnail 
                                      style={{
                                        maxWidth: '110px',
                                        maxHeight: '110px',
                                        width: 'auto',
                                        height: 'auto',
                                        objectFit: 'contain',
                                        cursor: 'pointer'
                                      }}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/110?text=Error';
                                      }}
                                      onClick={() => window.open(getImageUrl(media.mediaUrl), '_blank')}
                                    />
                                  </div>
                                ) : (
                                  <a 
                                    href={getImageUrl(media.mediaUrl)} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-primary btn-sm"
                                  >
                                    Xem file
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <Badge bg="primary" className="me-2">
                            {selectedComment.likeCount || 0} lượt thích
                          </Badge>
                          <Badge bg="info">
                            {selectedComment.replies?.length || 0} phản hồi
                          </Badge>
                        </div>
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleGoToPost(selectedComment.post?.id)}
                        >
                          Xem bài viết
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
              
              {selectedComment.replies && selectedComment.replies.length > 0 && (
                <div>
                  <h5 className="mb-3">Phản hồi ({selectedComment.replies.length})</h5>
                  {selectedComment.replies.map(reply => (
                    <Card key={reply.id} className="mb-2">
                      <Card.Body>
                        <div className="d-flex mb-2">
                          <div className="me-2">
                            <div className="bg-secondary rounded-circle d-flex justify-content-center align-items-center" style={{width: '40px', height: '40px'}}>
                              <span className="text-white">{reply.userName?.charAt(0) || '?'}</span>
                            </div>
                          </div>
                          <div>
                            <h6 className="mb-1">{reply.userName}</h6>
                            <p className="text-muted mb-0 small">{formatDate(reply.createdAt)}</p>
                          </div>
                        </div>
                        <p className="mb-0 ms-5">{reply.content}</p>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetailModal}>
            Đóng
          </Button>
          {selectedComment && (
            <Button 
              variant="danger" 
              onClick={() => {
                handleCloseDetailModal();
                handleDeleteClick(selectedComment);
              }}
            >
              Xóa bình luận
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminCommentList;