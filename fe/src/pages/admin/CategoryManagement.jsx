import { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Modal, Spinner, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaFolderPlus, FaSearch } from 'react-icons/fa';
import api from '../../service/api';

const CategoryManagement = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Gọi API thực tế
      const response = await api.get('/categories');
      
      if (response.status === 200 && response.data) {
        // Cần đếm số bài viết cho mỗi danh mục
        // Thường sẽ được trả về từ API nhưng nếu không có thì sẽ thêm thuộc tính giả
        const categoriesWithPostCount = response.data.data.map(category => ({
          ...category,
          postCount: 0 // Giả sử không có thông tin số bài viết
        }));
        
        setCategories(categoriesWithPostCount);
      }
    } catch (error) {
      console.error('Lỗi khi tải danh sách danh mục:', error);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
      
      // Dữ liệu giả để demo UI khi API lỗi
      setCategories([
        { id: 1, name: 'Công nghệ', description: 'Tin tức về công nghệ, máy tính và AI', postCount: 45 },
        { id: 2, name: 'Thể thao', description: 'Thông tin các sự kiện thể thao lớn', postCount: 32 },
        { id: 3, name: 'Sức khỏe', description: 'Mẹo vặt và kiến thức về sức khỏe', postCount: 28 },
        { id: 4, name: 'Giải trí', description: 'Tin tức giải trí, phim ảnh', postCount: 56 }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleShowModal = (category = null) => {
    setError('');
    if (category) {
      setCurrentCategory(category);
      setFormData({
        name: category.name,
        description: category.description || ''
      });
    } else {
      setCurrentCategory(null);
      setFormData({
        name: '',
        description: ''
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
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError('');
      
      if (currentCategory) {
        // Cập nhật danh mục
        const response = await api.put(`/categories/${currentCategory.id}`, formData);
        
        if (response.status === 200) {
          fetchCategories();
          handleCloseModal();
        }
      } else {
        // Tạo danh mục mới
        const response = await api.post('/categories', formData);
        
        if (response.status === 201) {
          fetchCategories();
          handleCloseModal();
        }
      }
    } catch (error) {
      console.error('Lỗi khi lưu danh mục:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi lưu thông tin danh mục');
      
      // Nếu lỗi do trùng tên
      if (error.response?.data?.message?.includes('đã tồn tại')) {
        setError('Tên danh mục đã tồn tại. Vui lòng chọn tên khác.');
      }
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      try {
        setError('');
        
        const response = await api.delete(`/categories/${categoryId}`);
        
        if (response.status === 200) {
          fetchCategories();
        }
      } catch (error) {
        console.error('Lỗi khi xóa danh mục:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa danh mục');
      }
    }
  };

  const filteredCategories = categories.filter(category => 
    category.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="category-management">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Quản lý danh mục</h1>
        <Button variant="primary" onClick={() => handleShowModal()}>
          <FaFolderPlus className="me-2" /> Thêm danh mục
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
                  placeholder="Tìm kiếm danh mục..."
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
                    <th>Tên danh mục</th>
                    <th>Mô tả</th>
                    <th>Số bài viết</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map(category => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td>{category.name}</td>
                        <td>
                          <div className="description-text text-truncate" style={{ maxWidth: '350px' }}>
                            {category.description || 'Không có mô tả'}
                          </div>
                        </td>
                        <td>{category.postCount || 0}</td>
                        <td>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => handleShowModal(category)}
                          >
                            <FaEdit />
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                            disabled={category.postCount > 0}
                            title={category.postCount > 0 ? "Không thể xóa danh mục có bài viết" : ""}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-3">
                        Không tìm thấy danh mục nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal Thêm/Sửa danh mục */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
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
              <Form.Label>Tên danh mục</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {currentCategory ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryManagement;