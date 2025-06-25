import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Image, Badge, Modal } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaCalendarAlt, FaVenusMars, FaEdit, FaCamera, FaTrash } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserProfile, updateUserProfile } from '../index';
import { useNavigate } from 'react-router-dom';
import { fetchUserPosts } from '../../post/index'; 
import placeholderImage from '../../../assets/images/placeholder.png';
import userPlaceholderImage from '../../../assets/images/user-placeholder.png';
import axios from 'axios';

// Component Modal xác nhận xóa
const DeleteConfirmModal = ({ show, onClose, onConfirm, postTitle }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Xác nhận xóa bài viết</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Bạn có chắc chắn muốn xóa bài viết "<strong>{postTitle}</strong>"?</p>
        <p className="text-danger">Lưu ý: Hành động này không thể hoàn tác.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onClose}>
          Hủy
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Xóa bài viết
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, success } = useSelector((state) => state.user);
  const { userPosts, loadingPosts } = useSelector((state) => state.post);
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    gender: '',
    dateOfBirth: '',
    avatar: null
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // State cho chức năng xóa bài viết
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  
  useEffect(() => {
    dispatch(fetchUserProfile());
    dispatch(fetchUserPosts());
  }, [dispatch]);
  
  useEffect(() => {
    if (user) {
      console.log('User data:', user);
      console.log('Avatar URL:', user.avatarUrl);
      console.log('Processed avatar URL:', user.avatarUrl ? getImageUrl(user.avatarUrl) : 'No avatar');
      
      setFormData({
        fullName: user.fullName || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '',
        avatar: null
      });
    }
  }, [user]);
  
  useEffect(() => {
    if (success) {
      setSuccessMessage('Cập nhật thông tin thành công!');
      setIsEditing(false);
      
      // Ẩn thông báo sau 3 giây
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  // Thêm log để debug
  useEffect(() => {
    console.log("UserPosts data:", userPosts);
    console.log("UserPosts type:", typeof userPosts);
    console.log("Is Array:", Array.isArray(userPosts));
  }, [userPosts]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        avatar: file
      });
      
      // Tạo preview ảnh
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formDataToSend = new FormData();
    formDataToSend.append('fullName', formData.fullName);
    formDataToSend.append('gender', formData.gender);
    
    if (formData.dateOfBirth) {
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
    }
    
    if (formData.avatar) {
      formDataToSend.append('avatar', formData.avatar);
    }
    
    dispatch(updateUserProfile(formDataToSend));
  };
  
  const getGenderLabel = (gender) => {
    switch (gender) {
      case 'MALE': return 'Nam';
      case 'FEMALE': return 'Nữ';
      case 'OTHER': return 'Khác';
      default: return 'Chưa cập nhật';
    }
  };
  
  const getRoleBadge = (role) => {
    switch (role) {
      case 1:
        return <Badge bg="danger">Admin</Badge>;
      case 2:
        return <Badge bg="success">Editor</Badge>;
      default:
        return <Badge bg="secondary">Người dùng</Badge>;
    }
  };
  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/avatars/default-avatar.png';
    
    // Nếu là URL đầy đủ (bắt đầu bằng http hoặc https)
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu bắt đầu với /http hoặc /https (lỗi thường gặp)
    if (imagePath.startsWith('/http')) {
      return imagePath.substring(1); // Loại bỏ dấu / đầu tiên
    }
    
    // Sửa lại đường dẫn cho avatar
    if (imagePath.startsWith('/avatars/')) {
      // Đường dẫn chính xác đến thư mục upload
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Đối với posts
    if (imagePath.startsWith('/posts/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Cho các trường hợp khác
    if (imagePath.startsWith('/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Nếu không có dấu / ở đầu
    return `http://localhost:8080/upload/${imagePath}`;
  };
  
  // Thêm hàm để format ngày tháng
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  // Hàm chuyển hướng đến trang chỉnh sửa bài viết
  const handleEditPost = (postId) => {
    // Ngăn chặn sự kiện nổi bọt (event bubbling)
    console.log("Navigating to edit post:", postId);
    navigate(`/post/edit/${postId}`);
  };
  
  // Thêm hàm mới để xử lý xem bài viết
  const handleViewPost = (postId) => {
    // Ngăn chặn sự kiện nổi bọt (event bubbling)
    console.log("Navigating to view post:", postId);
    navigate(`/post/${postId}`);
  };
  
  // Hàm tạo bài viết mới
  const handleCreatePost = () => {
    navigate('/post/create');
  };
  
  // Cập nhật hàm renderUserPosts()
  const renderUserPosts = () => {
    if (loadingPosts) {
      return (
        <div className="text-center py-4">
          <Spinner animation="border" size="sm" />
          <span className="ms-2">Đang tải bài viết...</span>
        </div>
      );
    }
    
    // Kiểm tra userPosts có phải là mảng hay không
    const postsArray = Array.isArray(userPosts) ? userPosts : [];
    
    if (!postsArray.length) {
      return (
        <div className="text-center py-4">
          <p className="text-muted">Bạn chưa có bài viết nào.</p>
          <Button variant="primary" onClick={handleCreatePost}>
            Tạo bài viết mới
          </Button>
        </div>
      );
    }
    
    return (
      <div className="user-posts">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="card-title m-0">Bài viết của bạn ({postsArray.length})</h5>
          <Button variant="primary" size="sm" onClick={handleCreatePost}>
            Tạo bài viết mới
          </Button>
        </div>
        
        <Row className="g-3">
          {postsArray.map(post => (
            <Col key={post.id} sm={6} md={6} lg={4}>
              <Card className="post-card h-100">
                {/* Thumbnail */}
                <div className="post-thumbnail">
                  <img 
                    src={post.thumbnail ? getImageUrl(post.thumbnail) : placeholderImage} 
                    alt={post.title}
                    className="card-img-top"
                    style={{ height: '160px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/placeholder-image.png';
                    }}
                  />
                </div>
                
                <Card.Body className="d-flex flex-column">
                  {/* Tiêu đề */}
                  <h6 className="card-title mb-2">{post.title}</h6>
                  
                  {/* Thông tin bổ sung */}
                  <div className="d-flex justify-content-between mt-2 text-muted small">
                    <Badge bg={post.published ? 'success' : 'secondary'}>
                      {post.published ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                    <span>{formatDate(post.createdAt)}</span>
                  </div>
                  
                  {/* Nút chỉnh sửa, xem và xóa */}
                  <div className="mt-auto pt-3">
                    <div className="d-flex gap-2 mb-2">
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => handleEditPost(post.id)}
                      >
                        <FaEdit className="me-1" /> Chỉnh sửa
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        size="sm" 
                        className="w-100"
                        onClick={() => handleViewPost(post.id)}
                      >
                        Xem
                      </Button>
                    </div>
                    
                    {/* Thêm nút xóa */}
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      className="w-100"
                      onClick={() => handleDeleteClick(post)}
                    >
                      <FaTrash className="me-1" /> Xóa
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    );
  };
  
  // Hàm xử lý khi người dùng click nút Xóa
  const handleDeleteClick = (post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  // Hàm xử lý khi người dùng đóng modal xác nhận xóa
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  // Hàm xử lý khi người dùng xác nhận xóa bài viết
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/posts/${postToDelete.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Hiển thị thông báo thành công
      setDeleteSuccess(`Đã xóa bài viết "${postToDelete.title}" thành công`);
      
      // Ẩn modal xác nhận
      setShowDeleteModal(false);
      
      // Reset state
      setPostToDelete(null);
      
      // Cập nhật lại danh sách bài viết
      dispatch(fetchUserPosts());
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Lỗi khi xóa bài viết:', error);
      alert('Có lỗi xảy ra khi xóa bài viết. Vui lòng thử lại sau.');
    }
  };
  
  // Phần return bổ sung thông báo xóa thành công
  return (
    <Container className="py-5">
      <Row>
        <Col lg={4} md={5}>
          <Card className="mb-4">
            <Card.Body className="text-center">
              <div className="mb-3 position-relative d-inline-block">
                {isEditing ? (
                  <>
                    <Image 
                      src={avatarPreview || (user?.avatarUrl ? getImageUrl(user.avatarUrl) : userPlaceholderImage)} 
                      alt="Avatar" 
                      roundedCircle 
                      width={150}
                      height={150}
                      className="mb-3"
                      style={{ objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Avatar load error:', user?.avatarUrl);
                        e.target.onerror = null;
                        e.target.src = '/images/avatars/default-avatar.png';
                      }}
                    />
                    <div className="position-absolute bottom-0 end-0">
                      <label htmlFor="avatar-upload" className="btn btn-sm btn-primary rounded-circle">
                        <FaCamera />
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="d-none"
                          onChange={handleAvatarChange}
                        />
                      </label>
                    </div>
                  </>
                ) : (
                  <Image 
                    src={user?.avatarUrl ? getImageUrl(user.avatarUrl) : userPlaceholderImage} 
                    alt="Avatar" 
                    roundedCircle 
                    width={150}
                    height={150}
                    className="mb-3"
                    style={{ objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Avatar load error:', user?.avatarUrl);
                      e.target.onerror = null; // Tránh vòng lặp vô hạn
                      e.target.src = '/images/avatars/default-avatar.png';
                    }}
                  />
                )}
              </div>
              
              <h5 className="mb-1">{user?.fullName || 'Chưa cập nhật'}</h5>
              <p className="text-muted mb-3">{user?.email}</p>
              
              <div className="mb-3">
                {user && getRoleBadge(user.role)}
              </div>
              
              {!isEditing && (
                <Button 
                  variant="outline-primary" 
                  onClick={() => setIsEditing(true)}
                  className="w-100 d-flex align-items-center justify-content-center"
                >
                  <FaEdit className="me-2" /> Chỉnh sửa thông tin
                </Button>
              )}
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Body>
              <h5 className="card-title mb-3">Thông tin cá nhân</h5>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaUser className="text-primary me-2" />
                  <strong>Tên đầy đủ:</strong>
                </div>
                <p className="text-muted ms-4">{user?.fullName || 'Chưa cập nhật'}</p>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaEnvelope className="text-primary me-2" />
                  <strong>Email:</strong>
                </div>
                <p className="text-muted ms-4">{user?.email}</p>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaVenusMars className="text-primary me-2" />
                  <strong>Giới tính:</strong>
                </div>
                <p className="text-muted ms-4">{user?.gender ? getGenderLabel(user.gender) : 'Chưa cập nhật'}</p>
              </div>
              
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <FaCalendarAlt className="text-primary me-2" />
                  <strong>Ngày sinh:</strong>
                </div>
                <p className="text-muted ms-4">
                  {user?.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={8} md={7}>
          {isEditing ? (
            <Card>
              <Card.Body>
                <h5 className="card-title mb-4">Chỉnh sửa thông tin</h5>
                
                {error && <Alert variant="danger">{error}</Alert>}
                {successMessage && <Alert variant="success">{successMessage}</Alert>}
                
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tên đầy đủ</Form.Label>
                    <Form.Control
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
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
                      <option value="MALE">Nam</option>
                      <option value="FEMALE">Nữ</option>
                      <option value="OTHER">Khác</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-4">
                    <Form.Label>Ngày sinh</Form.Label>
                    <Form.Control
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                  <div className="d-flex gap-2">
                    <Button variant="primary" type="submit" disabled={loading}>
                      {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => {
                        setIsEditing(false);
                        setAvatarPreview(null);
                        if (user) {
                          setFormData({
                            fullName: user.fullName || '',
                            gender: user.gender || '',
                            dateOfBirth: user.dateOfBirth ? user.dateOfBirth.substring(0, 10) : '',
                            avatar: null
                          });
                        }
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          ) : (
            <Card>
              <Card.Body>
                {/* Hiển thị thông báo xóa thành công */}
                {deleteSuccess && (
                  <Alert variant="success" className="mb-3">
                    {deleteSuccess}
                  </Alert>
                )}
                {renderUserPosts()}
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>
      
      {/* Modal xác nhận xóa bài viết */}
      <DeleteConfirmModal 
        show={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        postTitle={postToDelete?.title || ''}
      />
    </Container>
  );
};

export default UserProfile;