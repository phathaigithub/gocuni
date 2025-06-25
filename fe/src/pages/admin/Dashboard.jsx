import { useState, useEffect } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { FaUsers, FaNewspaper, FaEye, FaComments } from 'react-icons/fa';
import api from '../../service/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalViews: 0,
    totalComments: 0,
    recentPosts: [],
    topViewedPosts: []
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Gọi API thực tế
      const response = await api.get('/api/stats');
      
      if (response.status === 200 && response.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu thống kê:', error);
      setError('Không thể tải dữ liệu thống kê. Vui lòng thử lại sau.');
      
      // Dữ liệu giả để demo UI khi API lỗi
      setStats({
        totalUsers: 254,
        totalPosts: 148,
        totalViews: 15789,
        totalComments: 876,
        recentPosts: [
          { id: 1, title: 'Xu hướng công nghệ 2025', author: 'Nguyễn Văn A', date: '28/05/2025', status: 'published' },
          { id: 2, title: 'Điểm nổi bật của Thế vận hội', author: 'Trần Thị B', date: '27/05/2025', status: 'published' },
          { id: 3, title: 'Mẹo ăn uống lành mạnh', author: 'Lê Hoàng C', date: '26/05/2025', status: 'published' },
          { id: 4, title: 'Bài viết đang soạn thảo', author: 'Trần Thị B', date: '25/05/2025', status: 'draft' }
        ],
        topViewedPosts: [
          { id: 2, title: 'Điểm nổi bật của Thế vận hội', views: 320 },
          { id: 6, title: 'Top 10 phim đáng xem nhất năm', views: 275 },
          { id: 3, title: 'Mẹo ăn uống lành mạnh', views: 210 },
          { id: 4, title: 'Smartphone mới nhất của Apple', views: 180 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4">Dashboard</h1>
      
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon bg-primary">
                <FaUsers size={24} />
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-0">Tổng người dùng</h6>
                <h3 className="mb-0">{stats.totalUsers}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon bg-success">
                <FaNewspaper size={24} />
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-0">Tổng bài viết</h6>
                <h3 className="mb-0">{stats.totalPosts}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon bg-info">
                <FaEye size={24} />
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-0">Tổng lượt xem</h6>
                <h3 className="mb-0">{stats.totalViews.toLocaleString()}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={3} md={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex align-items-center">
              <div className="stat-icon bg-warning">
                <FaComments size={24} />
              </div>
              <div className="ms-3">
                <h6 className="text-muted mb-0">Tổng bình luận</h6>
                <h3 className="mb-0">{stats.totalComments}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Recent Posts and Top Viewed Posts */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Bài viết gần đây</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Tác giả</th>
                      <th>Ngày</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPosts.length > 0 ? (
                      stats.recentPosts.map(post => (
                        <tr key={post.id}>
                          <td>{post.title}</td>
                          <td>{post.author}</td>
                          <td>{post.date}</td>
                          <td>
                            <span className={`badge ${post.status === 'published' ? 'bg-success' : 'bg-warning'}`}>
                              {post.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">Không có dữ liệu</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 pt-4 pb-0">
              <h5 className="mb-0">Bài viết được xem nhiều nhất</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Tiêu đề</th>
                      <th>Lượt xem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topViewedPosts.length > 0 ? (
                      stats.topViewedPosts.map(post => (
                        <tr key={post.id}>
                          <td>{post.title}</td>
                          <td>{post.views}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center">Không có dữ liệu</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;