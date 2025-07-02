import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner, Row, Col, Image } from 'react-bootstrap';
import { FaSave, FaArrowLeft, FaUpload, FaTimes } from 'react-icons/fa';
import axios from 'axios';

// Import TipTap components for rich text editor
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TipTapImage from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import '../../../post/component/tiptap.css';

// Rich Text Editor Menu Component
const MenuBar = ({ editor }) => {
  // Đặt useCallback ở cấp cao nhất của component
  const addImage = useCallback(() => {
    if (editor) {
      const url = window.prompt('URL hình ảnh');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  }, [editor]);

  const setLink = useCallback(() => {
    if (editor) {
      const url = window.prompt('URL liên kết');
      if (url) {
        editor.chain().focus().setLink({ href: url }).run();
      }
    }
  }, [editor]);

  // Kiểm tra editor sau khi đã khai báo hooks
  if (!editor) {
    return null;
  }

  return (
    <div className="editor-menu">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'is-active' : ''}
      >
        B
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'is-active' : ''}
      >
        I
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={editor.isActive('underline') ? 'is-active' : ''}
      >
        U
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
      >
        H3
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'is-active' : ''}
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'is-active' : ''}
      >
        1. List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'is-active' : ''}
      >
        Quote
      </button>
      <button type="button" onClick={setLink}>
        Link
      </button>
      <button type="button" onClick={addImage}>
        Image
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
      >
        Left
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
      >
        Center
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
      >
        Right
      </button>
    </div>
  );
};

const AdminPostForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    status: 'PUBLISHED',
    thumbnail: null
  });
  
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // TipTap editor
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Underline,
      TipTapImage,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: '',
    onUpdate: ({ editor }) => {
      setFormData(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });
  
  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/categories', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setCategories(response.data.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Không thể tải danh sách danh mục. Vui lòng thử lại sau.');
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch post data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const fetchPostData = async () => {
        setLoading(true);
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get(`http://localhost:8080/api/admin/posts/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          const postData = response.data.data;
          
          setFormData({
            title: postData.title,
            content: postData.content,
            categoryId: postData.category.id.toString(),
            status: postData.status || 'PUBLISHED'
          });
          
          if (postData.thumbnailUrl) {
            setThumbnailPreview(`http://localhost:8080/api/files/${postData.thumbnailUrl}`);
          }
          
          // Update editor content
          if (editor) {
            editor.commands.setContent(postData.content);
          }
        } catch (err) {
          console.error('Error fetching post data:', err);
          setError('Không thể tải thông tin bài viết. Vui lòng thử lại sau.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchPostData();
    }
  }, [id, isEditMode, editor]);
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle thumbnail change
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, thumbnail: file }));
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Clear thumbnail
  const handleClearThumbnail = () => {
    setFormData(prev => ({ ...prev, thumbnail: null }));
    setThumbnailPreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.title.trim()) {
      setError('Tiêu đề không được để trống');
      return;
    }
    
    if (!formData.content.trim()) {
      setError('Nội dung không được để trống');
      return;
    }
    
    if (!formData.categoryId) {
      setError('Vui lòng chọn danh mục');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Create FormData object
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('categoryId', formData.categoryId);
      formDataToSend.append('status', formData.status);
      
      if (formData.thumbnail) {
        formDataToSend.append('thumbnail', formData.thumbnail);
      }
      
      let response;
      
      if (isEditMode) {
        // Update existing post
        response = await axios.put(
          `http://localhost:8080/api/admin/posts/${id}`,
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setSuccess('Cập nhật bài viết thành công');
      } else {
        // Create new post
        response = await axios.post(
          'http://localhost:8080/api/admin/posts',
          formDataToSend,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        setSuccess('Tạo bài viết mới thành công');
        
        // Clear form for new post mode
        setFormData({
          title: '',
          content: '',
          categoryId: '',
          status: 'PUBLISHED',
          thumbnail: null
        });
        
        if (editor) {
          editor.commands.setContent('');
        }
        
        setThumbnailPreview('');
        
        // Redirect to post list after successful creation
        setTimeout(() => {
          navigate('/admin/posts');
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setError(`Lỗi khi ${isEditMode ? 'cập nhật' : 'tạo'} bài viết: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="admin-post-form">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">{isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/admin/posts')}>
          <FaArrowLeft className="me-2" /> Quay lại
        </Button>
      </div>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert variant="success" className="mb-4">
          {success}
        </Alert>
      )}
      
      <Card className="mb-4">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>Tiêu đề bài viết <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Nhập tiêu đề bài viết"
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Nội dung <span className="text-danger">*</span></Form.Label>
                    <div className="tiptap-editor-container">
                      <MenuBar editor={editor} />
                      <EditorContent editor={editor} className="tiptap-editor" />
                    </div>
                  </Form.Group>
                </Col>
                
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Danh mục <span className="text-danger">*</span></Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Trạng thái</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                    >
                      <option value="PUBLISHED">Xuất bản</option>
                      <option value="DRAFT">Lưu nháp</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Ảnh đại diện bài viết</Form.Label>
                    <div className="d-flex align-items-center mb-2">
                      <Form.Control
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                      />
                      <Button 
                        variant="outline-primary" 
                        onClick={() => fileInputRef.current.click()}
                        className="me-2"
                      >
                        <FaUpload className="me-2" /> Chọn ảnh
                      </Button>
                      {thumbnailPreview && (
                        <Button 
                          variant="outline-danger" 
                          onClick={handleClearThumbnail}
                        >
                          <FaTimes />
                        </Button>
                      )}
                    </div>
                    
                    {thumbnailPreview && (
                      <div className="thumbnail-preview mt-2">
                        <Image 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          thumbnail 
                          style={{ maxHeight: '200px', objectFit: 'cover' }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-4">
                <Button variant="outline-secondary" className="me-2" onClick={() => navigate('/admin/posts')}>
                  Hủy
                </Button>
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <FaSave className="me-2" /> {isEditMode ? 'Cập nhật' : 'Tạo bài viết'}
                    </>
                  )}
                </Button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AdminPostForm;