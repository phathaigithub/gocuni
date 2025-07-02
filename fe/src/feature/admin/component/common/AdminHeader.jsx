import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt, FaHome } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../../auth';
import logo from '../../../../assets/images/logo.png';
import userPlaceholderImage from '../../../../assets/images/user-placeholder.png'; // Đường dẫn đến hình ảnh placeholder

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="admin-header">
      <Container fluid>
        <Navbar.Brand as={Link} to="/admin" className="d-flex align-items-center">
          <img
            src={logo}
            height="30"
            className="d-inline-block align-top me-2"
            alt="GOCUNI Logo"
          />
          <span>GOCUNI Admin</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="admin-navbar-nav" />
        <Navbar.Collapse id="admin-navbar-nav" className="justify-content-end">
          <Nav>
            <NavDropdown 
              title={
                <div className="d-inline-flex align-items-center admin-dropdown-toggle">
                  <Image 
                    src={user?.avatarUrl ? `http://localhost:8080/upload${user.avatarUrl}` : userPlaceholderImage} 
                    roundedCircle 
                    width={30} 
                    height={30} 
                    className="me-2"
                    style={{objectFit: 'cover'}}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/user-placeholder.png';
                    }}
                  />
                  <span className="admin-username">{user?.fullName || user?.email}</span>
                </div>
              } 
              id="admin-dropdown"
              className="admin-dropdown"
              align="end" // Căn chỉnh dropdown về phía phải
            >
              <div className="admin-dropdown-menu">
                <NavDropdown.Item as={Link} to="/profile">
                  <FaUser className="me-2" /> Hồ sơ
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/">
                  <FaHome className="me-2" /> Về trang chính
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> Đăng xuất
                </NavDropdown.Item>
              </div>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AdminHeader;