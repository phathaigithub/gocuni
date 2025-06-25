import React from 'react';
import { Container, Row, Col, Badge } from 'react-bootstrap';
import { FaFolder, FaNewspaper } from 'react-icons/fa';

const CategoryHeader = ({ category, postCount }) => {
  if (!category) return null;

  return (
    <div className="category-header py-4 bg-light">
      <Container>
        <Row className="align-items-center">
          <Col md={8} className="mx-auto text-center">
            <div className="category-icon mb-3">
              <FaFolder size={48} className="text-primary" />
            </div>
            <h1 className="fw-bold mb-2">{category.name}</h1>
            
            {category.description && (
              <p className="lead text-muted mb-3">{category.description}</p>
            )}
            
            <Badge bg="primary" className="px-3 py-2 d-inline-flex align-items-center">
              <FaNewspaper className="me-2" />
              {postCount} bài viết
            </Badge>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CategoryHeader;