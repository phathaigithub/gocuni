import React, { useState, useEffect } from 'react';
import { Table, Button, Form, InputGroup, Pagination, Modal, Spinner, Alert, Card, Row, Col } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminCategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState('');
  
  // State cho form tạo/sửa danh mục
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  
  const navigate = useNavigate();
  
  // Fetch danh sách danh mục
  const fetchCategories = async (page = 0, search = '') => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/admin/categories', {
        params: {
          page,
          size: 10,
          sortBy: 'id',
          direction: 'asc',
          keyword: search || undefined
        },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setCategories(response.data.data.categories);
      setCurrentPage(response.data.data.currentPage);
      setTotalPages(response.data.data.totalPages);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Load danh sách danh mục khi component mount
  useEffect(() => {
    fetchCategories(0, searchTerm);
  }, []);
  
  // Xử lý tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(0);
    fetchCategories(0, searchTerm);
  };
  
  // Xử lý chuyển trang
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchCategories(pageNumber, searchTerm);
  };
  
  // Xử lý xóa danh mục
  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setShowDeleteModal(true);
  };
  
  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setCategoryToDelete(null);
  };
  
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8080/api/admin/categories/${categoryToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setDeleteSuccess(`Đã xóa danh mục "${categoryToDelete.name}" thành công`);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      
      // Fetch lại danh sách danh mục
      fetchCategories(currentPage, searchTerm);
      
      // Ẩn thông báo thành công sau 3 giây
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting category:', err);
      const errorMessage = err.response?.data?.message || 'Không thể xóa danh mục. Vui lòng thử lại sau.';
      setError(errorMessage);
      setShowDeleteModal(false);
    }
  };
  
  // Xử lý mở modal tạo danh mục
  const handleAddCategory = () => {
    setCategoryForm({ name: '', description: '' });
    setIsEditMode(false);
    setFormError('');
    setFormSuccess('');
    setShowCategoryModal(true);
  };
  
  // Xử lý mở modal sửa danh mục
  const handleEditCategory = (category) => {
    setCategoryForm({ 
      id: category.id,
      name: category.name, 
      description: category.description || '' 
    });
    setIsEditMode(true);
    setFormError('');
    setFormSuccess('');
    setShowCategoryModal(true);
  };
  
  // Xử lý đóng modal
  const handleCloseCategoryModal = () => {
    setShowCategoryModal(false);
  };
  
  // Xử lý thay đổi trong form
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  
  // Xử lý submit form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!categoryForm.name.trim()) {
      setFormError('Tên danh mục không được để trống');
      return;
    }
    
    setFormError('');
    setFormSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      const data = {
        name: categoryForm.name.trim(),
        description: categoryForm.description.trim()
      };
      
      if (isEditMode) {
        // Cập nhật danh mục
        await axios.put(
          `http://localhost:8080/api/admin/categories/${categoryForm.id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setFormSuccess('Cập nhật danh mục thành công');
      } else {
        // Tạo danh mục mới
        await axios.post(
          'http://localhost:8080/api/admin/categories',
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        
        setFormSuccess('Tạo danh mục mới thành công');
      }
      
      // Fetch lại danh sách danh mục
      fetchCategories(currentPage, searchTerm);
      
      // Đóng modal sau 1 giây
      setTimeout(() => {
        setShowCategoryModal(false);
        setFormSuccess('');
      }, 1000);
    } catch (err) {
      console.error('Error saving category:', err);
      const errorMessage = err.response?.data?.message || `Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo'} danh mục. Vui lòng thử lại.`;
      setFormError(errorMessage);
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
    <div className="admin-category-list">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Quản lý danh mục</h2>
        <Button 
          variant="primary" 
          onClick={handleAddCategory}
        >
          <FaPlus className="me-2" /> Thêm danh mục
        </Button>
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
                placeholder="Tìm kiếm danh mục..."
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
                      <th>Tên danh mục</th>
                      <th>Mô tả</th>
                      <th>Số bài viết</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.length > 0 ? (
                      categories.map(category => (
                        <tr key={category.id}>
                          <td>{category.id}</td>
                          <td className="fw-medium">{category.name}</td>
                          <td>{category.description || 'Không có mô tả'}</td>
                          <td>{category.postCount}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                onClick={() => handleEditCategory(category)}
                                title="Chỉnh sửa"
                              >
                                <FaEdit />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleDeleteClick(category)}
                                title="Xóa danh mục"
                                disabled={category.postCount > 0}
                              >
                                <FaTrash />
                              </Button>
                            </div>
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
              
              {renderPagination()}
            </>
          )}
        </Card.Body>
      </Card>
      
      {/* Modal xác nhận xóa */}
      <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa danh mục</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {categoryToDelete && (
            <>
              <p>Bạn có chắc chắn muốn xóa danh mục "<strong>{categoryToDelete.name}</strong>"?</p>
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
      
      {/* Modal tạo/sửa danh mục */}
      <Modal show={showCategoryModal} onHide={handleCloseCategoryModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && (
            <Alert variant="danger" className="mb-3">
              {formError}
            </Alert>
          )}
          
          {formSuccess && (
            <Alert variant="success" className="mb-3">
              {formSuccess}
            </Alert>
          )}
          
          <Form onSubmit={handleFormSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tên danh mục <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={categoryForm.name}
                onChange={handleFormChange}
                placeholder="Nhập tên danh mục"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={categoryForm.description}
                onChange={handleFormChange}
                placeholder="Nhập mô tả cho danh mục (không bắt buộc)"
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="outline-secondary" className="me-2" onClick={handleCloseCategoryModal}>
                Hủy
              </Button>
              <Button type="submit" variant="primary">
                {isEditMode ? 'Cập nhật' : 'Tạo danh mục'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminCategoryList;