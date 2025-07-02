import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Form, Button, NavDropdown } from 'react-bootstrap';
import { FaSearch, FaUser, FaUserShield, FaLock } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../feature/auth';
import { fetchAllCategories } from '../../feature/category'; // Thêm import
import logo from '../../assets/images/logo.png';

const Header = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Sử dụng Redux
  const { user, isAuthenticated } = useSelector(state => state.auth);
  const { categories } = useSelector(state => state.category); // Lấy danh sách danh mục từ Redux
  
  // Kiểm tra quyền admin - sửa để phù hợp với server
  const isAdmin = user?.role === 'ROLE_ADMIN';

  // Fetch danh sách danh mục khi component mount
  useEffect(() => {
    console.log("Header - Fetching categories");
    dispatch(fetchAllCategories())
      .then(result => {
        console.log("Categories fetched:", result.payload?.data);
      })
      .catch(err => {
        console.error("Error fetching categories:", err);
      });
  }, [dispatch]);

  // Thêm console.log để kiểm tra cấu trúc dữ liệu user
  useEffect(() => {
    console.log("User data:", user);
    console.log("User role:", user?.role);
  }, [user]);

  // Điều chỉnh cách kiểm tra quyền admin
  // const isAdmin = user?.role?.name === 'ROLE_ADMIN'; // Nếu role là object
  // const isAdmin = user?.role === 'ROLE_ADMIN'; // Nếu role là string

  // Hàm xử lý đường dẫn hình ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/avatars/default-avatar.png';
    
    // Nếu là URL đầy đủ
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu bắt đầu với /http
    if (imagePath.startsWith('/http')) {
      return imagePath.substring(1);
    }
    
    // Xử lý đường dẫn avatar
    if (imagePath.startsWith('/avatars/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Xử lý đường dẫn thumbnail của bài viết
    if (imagePath.startsWith('/posts/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Xử lý các trường hợp khác
    if (imagePath.startsWith('/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    return `http://localhost:8080/upload/${imagePath}`;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${searchTerm}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  // Thêm hàm xử lý click vào NavDropdown.Item
  const handleCategoryClick = (category) => {
    console.log("Category clicked:", category);
    // Không cần thêm logic gì ở đây, React Router sẽ tự xử lý chuyển hướng
  };

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img 
            src={logo}
            alt="GoC Uni Logo" 
            height="40" 
            className="me-2"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/120x40?text=GoC+Uni';
            }}
          />
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" className="mx-2">Trang chủ</Nav.Link>
            <NavDropdown title="Danh mục" id="categories-dropdown" className="mx-2">
              {categories.length > 0 ? (
                categories.map(category => (
                  <NavDropdown.Item 
                    key={category.id} 
                    as={Link} 
                    to={`/category/${category.id}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category.name}
                  </NavDropdown.Item>
                ))
              ) : (
                <NavDropdown.Item disabled>Đang tải danh mục...</NavDropdown.Item>
              )}
            </NavDropdown>
          </Nav>
          
          <Form className="d-flex mx-auto" onSubmit={handleSearch}>
            <div className="position-relative search-container">
              <Form.Control
                type="search"
                placeholder="Tìm kiếm..."
                className="me-2 search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-success" type="submit" className="search-button">
                <FaSearch />
              </Button>
            </div>
          </Form>
          
          <Nav>
            {isAdmin && (
              <Nav.Link as={Link} to="/admin" className="me-2 d-flex align-items-center btn btn-outline-dark">
                <FaUserShield className="me-1" /> Quản lý
              </Nav.Link>
            )}
            
            {isAuthenticated ? (
              <NavDropdown 
                title={
                  <div className="d-inline-block">
                    {user?.avatarUrl ? (
                      <img 
                        src={getImageUrl(user.avatarUrl)} 
                        alt="Profile" 
                        className="rounded-circle" 
                        width="32" 
                        height="32"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          console.error('Avatar load error in header:', user?.avatarUrl);
                          e.target.onerror = null;
                          e.target.src = '/images/avatars/default-avatar.png';
                        }}
                      />
                    ) : (
                      <FaUser className="user-icon" />
                    )}
                    <span className="ms-2">{"Cài đặt"}</span>
                  </div>
                } 
                id="profile-dropdown"
              >
                <NavDropdown.Item as={Link} to="/profile">Hồ sơ</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/post/create">Tạo bài viết</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/change-password">
                  <FaLock className="me-2" /> Đổi mật khẩu
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="btn btn-primary">Đăng nhập</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;