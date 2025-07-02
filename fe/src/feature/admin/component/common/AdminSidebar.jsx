import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FaUsers, FaNewspaper, FaList, FaComments } from 'react-icons/fa';

const AdminSidebar = () => {
  return (
    <div className="admin-sidebar-content h-100 d-flex flex-column py-3">
      <div className="sidebar-header mb-4">
        <h5 className="sidebar-title text-white">GOCUNI Admin</h5>
      </div>
      
      <Nav className="flex-column flex-grow-1">
        <Nav.Link as={NavLink} to="/admin/users" className="sidebar-link text-light">
          <FaUsers className="me-2" /> Quản lý người dùng
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/posts" className="sidebar-link text-light">
          <FaNewspaper className="me-2" /> Quản lý bài viết
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/categories" className="sidebar-link text-light">
          <FaList className="me-2" /> Quản lý danh mục
        </Nav.Link>
        <Nav.Link as={NavLink} to="/admin/comments" className="sidebar-link text-light">
          <FaComments className="me-2" /> Quản lý bình luận
        </Nav.Link>
      </Nav>
    </div>
  );
};

export default AdminSidebar;