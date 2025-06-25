import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const ClientLayout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet /> {/* Đây là nơi hiển thị nội dung của routes con */}
      </main>
      <Footer />
    </div>
  );
};

export default ClientLayout;