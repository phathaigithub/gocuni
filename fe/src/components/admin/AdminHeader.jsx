import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav, Container, Dropdown } from 'react-bootstrap';
import { FaUser, FaBell, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const AdminHeader = ({ toggleSidebar }) => {
  const { currentUser, logout } = useContext(AuthContext);
  
  // Tạo một đối tượng user mặc định nếu chưa đăng nhập
  const user = currentUser || {
    fullName: 'Admin Demo',
    email: 'admin@example.com',
    avatarUrl: null
  };

  return (
    <Navbar bg="white" className="border-bottom shadow-sm">
      <Container fluid>
        <button 
          className="btn btn-light border-0 d-md-none me-2" 
          onClick={toggleSidebar}
        >
          <FaBars />
        </button>
        
        <Navbar.Brand as={Link} to="/admin" className="me-auto">
          GocUni Admin
        </Navbar.Brand>
        
        <Nav className="ms-auto d-flex align-items-center">
          <Nav.Item className="me-3">
            <Dropdown align="end">
              <Dropdown.Toggle as="a" className="nav-link position-relative cursor-pointer">
                <FaBell size={18} />
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  3
                </span>
              </Dropdown.Toggle>
              
              <Dropdown.Menu className="dropdown-menu-end shadow">
                <Dropdown.Header>Thông báo</Dropdown.Header>
                <Dropdown.Item href="#">Có bài viết mới đã được đăng</Dropdown.Item>
                <Dropdown.Item href="#">Người dùng mới đăng ký</Dropdown.Item>
                <Dropdown.Item href="#">Có bình luận mới cần duyệt</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item href="#" className="text-center">Xem tất cả</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav.Item>
          
          <Nav.Item>
            <Dropdown align="end">
              <Dropdown.Toggle as="a" className="nav-link d-flex align-items-center cursor-pointer">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt="Profile" 
                    className="rounded-circle me-2" 
                    width="32" 
                    height="32"
                  />
                ) : (
                  <div className="bg-primary rounded-circle text-white d-flex align-items-center justify-content-center me-2" style={{ width: 32, height: 32 }}>
                    <FaUser size={14} />
                  </div>
                )}
                <span className="d-none d-md-inline">{user.fullName || user.email}</span>
              </Dropdown.Toggle>
              
              <Dropdown.Menu className="dropdown-menu-end shadow">
                <Dropdown.Item as={Link} to="/profile">Hồ sơ</Dropdown.Item>
                <Dropdown.Item as={Link} to="/admin/settings">Cài đặt</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/" className="text-primary">
                  Về trang chủ
                </Dropdown.Item>
                <Dropdown.Item onClick={logout} className="text-danger">
                  <FaSignOutAlt className="me-2" /> Đăng xuất
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Nav.Item>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default AdminHeader;