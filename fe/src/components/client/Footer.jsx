import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { useSelector } from 'react-redux';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  // Lấy danh sách danh mục từ Redux store
  const { categories } = useSelector(state => state.category);
  
  // Hiển thị tối đa 5 danh mục trong footer
  const displayCategories = categories.slice(0, 5);

  return (
    <footer className="bg-dark text-white pt-5 pb-3">
      <Container>
        <Row>
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-3">GocUni News</h5>
            <p className="mb-3">
              Trang tin tức cập nhật những thông tin mới nhất và đáng tin cậy về các chủ đề nóng hổi
              trong nước và quốc tế.
            </p>
            <div className="d-flex social-icons">
              <a href="#" className="me-3 text-white">
                <FaFacebookF />
              </a>
              <a href="#" className="me-3 text-white">
                <FaTwitter />
              </a>
              <a href="#" className="me-3 text-white">
                <FaInstagram />
              </a>
              <a href="#" className="me-3 text-white">
                <FaLinkedinIn />
              </a>
              <a href="#" className="text-white">
                <FaYoutube />
              </a>
            </div>
          </Col>
          
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="mb-3 text-white">Danh mục</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><Link to="/" className="text-white-50 text-decoration-none hover-white">Trang chủ</Link></li>
              {displayCategories.length > 0 ? (
                displayCategories.map(category => (
                  <li key={category.id} className="mb-2">
                    <Link 
                      to={`/category/${category.id}`} 
                      className="text-white-50 text-decoration-none hover-white"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="mb-2">
                  <span className="text-white-50">Đang tải danh mục...</span>
                </li>
              )}
            </ul>
          </Col>
          
          <Col lg={4}>
            <h5 className="mb-3 text-white">Liên hệ</h5>
            <address className="text-white-50">
              <p className="mb-2">123 Đường Nguyễn Huệ, Quận 1</p>
              <p className="mb-2">TP. Hồ Chí Minh, Việt Nam</p>
              <p className="mb-2">Email: info@gonews.com</p>
              <p className="mb-2">Điện thoại: +84 123 456 789</p>
            </address>
          </Col>
        </Row>
        
        <hr className="my-4 bg-secondary" />
        
        <Row>
          <Col className="text-center text-white-50">
            <p className="mb-0">© {currentYear} GocUni. Tất cả quyền được bảo lưu.</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;