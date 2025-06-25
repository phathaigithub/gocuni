import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { 
  FaTachometerAlt, FaUsers, FaNewspaper, 
  FaList, FaComments, FaCog
} from 'react-icons/fa';

const AdminSidebar = () => {
  const location = useLocation();
  
  // Kiểm tra route hiện tại để active sidebar item
  const isActive = (path) => {
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    if (path !== '/admin' && location.pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header p-3">
        <h5 className="mb-0">GocUni Admin</h5>
        <p className="text-muted small mb-0">Quản lý nội dung</p>
      </div>
      
      <Nav className="flex-column mt-2">
        <Nav.Link 
          as={Link} 
          to="/admin" 
          className={`sidebar-link ${isActive('/admin') ? 'active' : ''}`}
        >
          <FaTachometerAlt className="me-2" /> Dashboard
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/users" 
          className={`sidebar-link ${isActive('/admin/users') ? 'active' : ''}`}
        >
          <FaUsers className="me-2" /> Quản lý người dùng
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/posts" 
          className={`sidebar-link ${isActive('/admin/posts') ? 'active' : ''}`}
        >
          <FaNewspaper className="me-2" /> Quản lý bài viết
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/categories" 
          className={`sidebar-link ${isActive('/admin/categories') ? 'active' : ''}`}
        >
          <FaList className="me-2" /> Quản lý danh mục
        </Nav.Link>
        
        <Nav.Link 
          as={Link} 
          to="/admin/comments" 
          className={`sidebar-link ${isActive('/admin/comments') ? 'active' : ''}`}
        >
          <FaComments className="me-2" /> Quản lý bình luận
        </Nav.Link>
        
        <hr className="my-2 bg-secondary" />
        
        <Nav.Link 
          as={Link} 
          to="/admin/settings" 
          className={`sidebar-link ${isActive('/admin/settings') ? 'active' : ''}`}
        >
          <FaCog className="me-2" /> Cài đặt hệ thống
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default AdminSidebar;