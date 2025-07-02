import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';
import AdminFooter from './AdminFooter';
import '../../styles/adminLayout.css';

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminHeader />
      <Container fluid className="admin-container px-0">
        <Row className="g-0 h-100">
          <Col md={3} lg={2} className="admin-sidebar">
            <AdminSidebar />
          </Col>
          <Col md={9} lg={10} className="admin-content-wrapper d-flex flex-column">
            <main className="admin-main flex-grow-1 p-4">
              <Outlet />
            </main>
            <AdminFooter />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLayout;