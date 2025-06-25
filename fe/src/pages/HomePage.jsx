import { useState, useEffect } from 'react';
import { Container, Row, Col, Spinner, Pagination } from 'react-bootstrap';
import PostCard from '../components/client/PostCard';
import api from '../service/api'; 
import bannerImage from '../assets/images/main-banner.png';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        console.log('Fetching posts...');
        // Sử dụng try-catch để debug
        try {
          console.log('API instance:', api);
          console.log('API get method:', typeof api.get);
        } catch (debugError) {
          console.error('Debug error:', debugError);
        }
        
        // Lấy danh sách bài viết với phân trang
        const postsResponse = await api.get(`/posts?page=${page}&size=6&sort=Id,desc`);
        console.log('Posts response:', postsResponse);
        
        if (postsResponse.data && postsResponse.data.status === 200) {
          console.log('Setting posts:', postsResponse.data.data.content);
          setPosts(postsResponse.data.data.content || []);
          setTotalPages(postsResponse.data.data.totalPages || 0);
        } else {
          console.warn('Invalid response format:', postsResponse);
          setPosts([]);
        }
      } catch (error) {
        console.error('Error fetching posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [page]);

  const handlePageChange = (pageNumber) => {
    setPage(pageNumber);
    window.scrollTo(0, 0);
  };

  if (loading && page === 0) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <>
      {/* Static Banner */}
      <div className="main-banner mb-5">
        <div className="static-banner position-relative">
          <img 
            src={bannerImage} 
            alt="GocUni - Tin tức & Thông tin mới nhất" 
            className="d-block w-100 banner-image"
          />
          <div className="banner-content position-absolute">
            <h1>GocUni News</h1>
            <p>Cập nhật tin tức mới nhất mỗi ngày</p>
            <a href="/category/1" className="btn btn-primary">Khám phá ngay</a>
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <Container className="mb-5">
        <h2 className="section-title mb-4">Bài viết mới nhất</h2>
        <Row xs={1} md={2} lg={3} className="g-4">
          {posts.map(post => (
            <Col key={post.id}>
              <PostCard post={post} />
            </Col>
          ))}
        </Row>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-5">
            <Pagination>
              <Pagination.First onClick={() => handlePageChange(0)} disabled={page === 0} />
              <Pagination.Prev onClick={() => handlePageChange(page - 1)} disabled={page === 0} />

              {[...Array(totalPages).keys()].map((number) => (
                <Pagination.Item
                  key={number}
                  active={number === page}
                  onClick={() => handlePageChange(number)}
                >
                  {number + 1}
                </Pagination.Item>
              ))}

              <Pagination.Next onClick={() => handlePageChange(page + 1)} disabled={page === totalPages - 1} />
              <Pagination.Last onClick={() => handlePageChange(totalPages - 1)} disabled={page === totalPages - 1} />
            </Pagination>
          </div>
        )}
      </Container>
    </>
  );
};

export default HomePage;