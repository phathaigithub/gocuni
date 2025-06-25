import { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Spinner, Badge, Row, Col, InputGroup } from 'react-bootstrap';
import { FaEdit, FaTrash, FaFileMedical, FaSearch, FaEye, FaComment } from 'react-icons/fa';
import api from '../../service/api';

const PostManagement = () => {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    thumbnail: '',
    categoryId: '',
    published: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/posts');
      
      if (response.status === 200 && response.data) {
        setPosts(response.data.data.content || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách bài viết:', error);
      setError('Không thể tải danh sách bài viết. Vui lòng thử lại sau.');
      
      // Dữ liệu giả để demo UI khi API lỗi
      setPosts([
        { 
          id: 1, 
          title: 'Xu hướng công nghệ năm 2025', 
          content: 'Nội dung bài viết...', 
          categoryId: 1, 
          categoryName: 'Công nghệ', 
          authorName: 'Admin User', 
          createdAt: '2025-05-15T10:30:00', 
          viewCount: 320, 
          commentCount: 15, 
          published: true 
        },
        { 
          id: 2, 
          title: 'Đánh giá iPhone 18 Pro Max', 
          content: 'Nội dung bài viết...', 
          categoryId: 1, 
          categoryName: 'Công nghệ', 
          authorName: 'Nguyễn Văn A', 
          createdAt: '2025-05-16T14:20:00', 
          viewCount: 450, 
          commentCount: 23, 
          published: true 
        },
        { 
          id: 3, 
          title: 'Bài viết đang soạn thảo', 
          content: 'Nội dung bài viết...', 
          categoryId: 2, 
          categoryName: 'Thể thao', 
          authorName: 'Trần Thị B', 
          createdAt: '2025-05-17T09:45:00', 
          viewCount: 0, 
          commentCount: 0, 
          published: false 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      
      if (response.status === 200 && response.data) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách danh mục:', error);
      
      // Dữ liệu giả cho danh mục
      setCategories([
        { id: 1, name: 'Công nghệ' },
        { id: 2, name: 'Thể thao' },
        { id: 3, name: 'Sức khỏe' },
        { id: 4, name: 'Giải trí' }
      ]);
    }
  };

  const handleShowModal = (post = null) => {
    setError('');
    if (post) {
      setCurrentPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        thumbnail: post.thumbnail || '',
        categoryId: post.categoryId,
        published: post.published
      });
    } else {
      setCurrentPost(null);
      setFormData({
        title: '',
        content: '',
        thumbnail: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        published: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (currentPost) {
        // Cập nhật bài viết
        const response = await api.put(`/posts/${currentPost.id}`, formData);
        
        if (response.status === 200) {
          fetchPosts();
          handleCloseModal();
        }
      } else {
        // Tạo bài viết mới
        const response = await api.post('/posts', formData);
        
        if (response.status === 201) {
          fetchPosts();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu bài viết:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin bài viết');
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
      try {
        setError('');
        
        const response = await api.delete(`/posts/${postId}`);
        
        if (response.status === 200) {
          fetchPosts();
        }
      } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa bài viết');
      }
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'published') return matchesSearch && post.published;
    if (filter === 'draft') return matchesSearch && !post.published;
    
    return matchesSearch;
  });

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

  return (
    <div className="post-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản lý bài viết</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaFileMedical className="me-2" /> Thêm bài viết
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
                  placeholder="Tìm kiếm bài viết..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <FaSearch className="search-icon" />
              </div>
            </Col>
            <Col md={6} className="d-flex justify-content-md-end mt-3 mt-md-0">
              <Form.Select 
                className="filter-select" 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="all">Tất cả bài viết</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
              </Form.Select>
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
                    <th>Tiêu đề</th>
                    <th>Tác giả</th>
                    <th>Danh mục</th>
                    <th>Trạng thái</th>
                    <th><FaEye /></th>
                    <th><FaComment /></th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.length > 0 ? (
                    filteredPosts.map(post => (
                      <tr key={post.id}>
                        <td>{post.id}</td>
                        <td>
                          <div className="post-title text-truncate" style={{ maxWidth: '250px' }}>
                            {post.title}
                          </div>
                        </td>
                        <td>{post.authorName}</td>
                        <td>{post.categoryName}</td>
                        <td>
                          <Badge bg={post.published ? 'success' : 'secondary'}>
                            {post.published ? 'Đã xuất bản' : 'Bản nháp'}
                          </Badge>
                        </td>
                        <td>{post.viewCount}</td>
                        <td>{post.commentCount}</td>
                        <td>{formatDate(post.createdAt)}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleShowModal(post)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(post.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-3">
                        Không tìm thấy bài viết nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal Thêm/Sửa bài viết */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {currentPost ? 'Chỉnh sửa bài viết' : 'Thêm bài viết mới'}
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
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Nội dung</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={formData.content}
                onChange={handleChange}
                rows={6}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Thumbnail URL</Form.Label>
              <Form.Control
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="/images/posts/ten-anh.jpg"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check 
                type="checkbox"
                id="published"
                name="published"
                label="Xuất bản ngay"
                checked={formData.published}
                onChange={handleChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {currentPost ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default PostManagement;