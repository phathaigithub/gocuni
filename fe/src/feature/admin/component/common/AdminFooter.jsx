import React from 'react';

const AdminFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="admin-footer py-3 border-top mt-auto w-100">
      <div className="text-center text-muted">
        <p className="mb-0">© {currentYear} GOCUNI Admin Dashboard. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default AdminFooter;