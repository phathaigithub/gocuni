import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Pagination, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategoryById, fetchPostsByCategory } from '../categorySlice';
import PostCard from '../../../components/client/PostCard';
import { FaExclamationTriangle } from 'react-icons/fa';

// Thêm console.log ngoài component để kiểm tra file được load
console.log("CategoryPage.jsx is loaded");

const CategoryPage = () => {
  console.log("CategoryPage component rendering");
  const { id } = useParams();
  console.log("Category ID from params:", id);
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch();
  
  // Lấy state từ Redux
  const { currentCategory, posts, pagination, loading, error } = useSelector((state) => state.category);
  
  // Lấy tham số phân trang từ URL hoặc dùng giá trị mặc định
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '0'));
  const pageSize = 9; // Số bài viết trên mỗi trang

  useEffect(() => {
    console.log("CategoryPage useEffect - Fetching data for category ID:", id);
    
    // Fetch thông tin danh mục
    dispatch(fetchCategoryById(id));
    
    // Fetch danh sách bài viết theo danh mục với phân trang
    dispatch(fetchPostsByCategory({
      categoryId: id,
      params: {
        page: currentPage,
        size: pageSize,
        sort: 'createdAt,desc'
      }
    }));
  }, [dispatch, id, currentPage]);

  // Cập nhật URL khi thay đổi trang
  useEffect(() => {
    if (currentPage > 0) {
      setSearchParams({ page: currentPage.toString() });
    } else {
      setSearchParams({});
    }
  }, [currentPage, setSearchParams]);

  // Xử lý chuyển trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Hiển thị phân trang
  const renderPagination = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const items = [];
    const maxPages = 5; // Số lượng nút trang tối đa hiển thị
    const startPage = Math.max(0, Math.min(currentPage - Math.floor(maxPages / 2), pagination.totalPages - maxPages));
    const endPage = Math.min(startPage + maxPages, pagination.totalPages);

    // Nút Previous
    items.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 0}
      />
    );

    // Hiển thị nút trang đầu tiên và dấu ... nếu cần
    if (startPage > 0) {
      items.push(
        <Pagination.Item key={0} onClick={() => handlePageChange(0)}>
          1
        </Pagination.Item>
      );
      if (startPage > 1) {
        items.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }

    // Hiển thị các nút trang chính
    for (let i = startPage; i < endPage; i++) {
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

    // Hiển thị dấu ... và nút trang cuối cùng nếu cần
    if (endPage < pagination.totalPages) {
      if (endPage < pagination.totalPages - 1) {
        items.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      items.push(
        <Pagination.Item 
          key={pagination.totalPages - 1} 
          onClick={() => handlePageChange(pagination.totalPages - 1)}
        >
          {pagination.totalPages}
        </Pagination.Item>
      );
    }

    // Nút Next
    items.push(
      <Pagination.Next 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage >= pagination.totalPages - 1}
      />
    );

    return (
      <div className="d-flex justify-content-center mt-4">
        <Pagination>{items}</Pagination>
      </div>
    );
  };

  // Hiển thị loading spinner khi đang tải
  if (loading && !posts.length) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
        <p className="mt-3">Đang tải dữ liệu danh mục...</p>
      </Container>
    );
  }

  // Hiển thị thông báo lỗi
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <FaExclamationTriangle className="me-2" />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item active>
          {currentCategory?.name || 'Danh mục'}
        </Breadcrumb.Item>
      </Breadcrumb>
      
      {/* Tiêu đề danh mục */}
      <div className="mb-4 text-center">
        <h1>{currentCategory?.name || 'Danh mục'}</h1>
        {currentCategory?.description && (
          <p className="text-muted">{currentCategory.description}</p>
        )}
      </div>
      
      {/* Hiển thị danh sách bài viết */}
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Đang tải bài viết...</span>
          </Spinner>
        </div>
      ) : posts.length === 0 ? (
        <Alert variant="info">
          Không có bài viết nào trong danh mục này.
        </Alert>
      ) : (
        <>
          <Row xs={1} md={2} lg={3} className="g-4">
            {posts.map(post => (
              <Col key={post.id}>
                <PostCard post={post} />
              </Col>
            ))}
          </Row>
          
          {/* Phân trang */}
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

console.log("Exporting CategoryPage component");
export default CategoryPage;