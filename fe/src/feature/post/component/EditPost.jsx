import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Card, Alert, Spinner, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostDetail, postAPI } from '../index';
import { fetchAllCategories } from '../../category/index';
import axios from 'axios';

// Thêm import cho TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

// Đảm bảo đã import CSS
import './tiptap.css';
import '../../../assets/css/style.css';

// Modal component cho chèn hình ảnh - sao chép từ CreatePost.jsx
const ImageModal = ({ show, onClose, onInsert }) => {
  const [imageUrl, setImageUrl] = useState('');
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleSubmitUrl = (e) => {
    e.preventDefault();
    if (imageUrl.trim()) {
      onInsert(imageUrl.trim());
      setImageUrl('');
      onClose();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setUploadError('');
    }
  };

  const handleUploadImage = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post('http://localhost:8080/api/uploads/images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      if (response.data && response.data.data && response.data.data.url) {
        onInsert(response.data.data.url);
        setFile(null);
        onClose();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Tải lên thất bại. Vui lòng thử lại.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Chèn hình ảnh</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group controlId="image-upload" className="mb-3">
          <Form.Label>Chọn hình ảnh</Form.Label>
          <Form.Control 
            type="file" 
            onChange={handleFileChange}
            accept="image/*"
          />
          {uploadError && <div className="text-danger mt-2">{uploadError}</div>}
        </Form.Group>
        <Button 
          variant="primary" 
          onClick={handleUploadImage} 
          disabled={!file || isUploading} 
          className="w-100"
        >
          {isUploading ? 'Đang tải lên...' : 'Tải lên hình ảnh'}
        </Button>
        
        <hr className="my-3" />
        
        <Form onSubmit={handleSubmitUrl}>
          <Form.Group controlId="imageUrl" className="mb-3">
            <Form.Label>URL hình ảnh</Form.Label>
            <Form.Control 
              type="text" 
              value={imageUrl} 
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Form.Text className="text-muted">
              Nhập URL của hình ảnh bạn muốn chèn
            </Form.Text>
          </Form.Group>
          <Button variant="outline-primary" type="submit" className="w-100">
            Chèn hình ảnh từ URL
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// Modal component cho chèn liên kết - sao chép từ CreatePost.jsx
const LinkModal = ({ show, onClose, onInsert }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      onInsert(linkUrl.trim(), linkText.trim());
      setLinkUrl('');
      setLinkText('');
      onClose();
    }
  };

  if (!show) return null;

  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>Thêm liên kết</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3" controlId="linkUrl">
            <Form.Label>URL liên kết</Form.Label>
            <Form.Control 
              type="text" 
              value={linkUrl} 
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://example.com"
              autoFocus
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="linkText">
            <Form.Label>Văn bản hiển thị (để trống nếu muốn dùng văn bản đã chọn)</Form.Label>
            <Form.Control 
              type="text" 
              value={linkText} 
              onChange={(e) => setLinkText(e.target.value)}
              placeholder="Văn bản hiển thị"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button variant="primary" type="submit">
            Thêm liên kết
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

// Modal xem trước - sao chép từ CreatePost.jsx và chỉnh sửa
const PreviewModal = ({ show, onClose, title, content, thumbnail }) => {
  if (!show) return null;
  
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Xem trước bài viết</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        
        <div className="preview-content" dangerouslySetInnerHTML={{ __html: content || 'Nội dung bài viết' }} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Đóng
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// Tiptap Editor Component - sao chép từ CreatePost.jsx
const TipTapEditor = ({ initialValue, onChange, error }) => {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TipTapLink.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          target: '_blank', // Mở liên kết trong tab mới
          rel: 'noopener noreferrer', // Bảo mật liên kết
        },
      }),
      Image.configure({
        allowBase64: true,
        inline: true,
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: initialValue,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    // Cập nhật nội dung khi initialValue thay đổi
    if (editor && initialValue !== undefined && initialValue !== editor.getHTML()) {
      editor.commands.setContent(initialValue);
    }
  }, [editor, initialValue]);

  const setLink = useCallback((url, text) => {
    if (!editor) return;

    // Nếu URL rỗng, xóa liên kết
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Thêm liên kết với thuộc tính target="_blank"
    editor.chain().focus().extendMarkRange('link').setLink({ href: url, target: '_blank' }).run();

    // Nếu có văn bản hiển thị, chèn văn bản vào nội dung
    if (text) {
      editor.chain().focus().insertContent(text).run();
    }
  }, [editor]);
  
  const insertImage = useCallback((url) => {
    if (!editor) return;
    editor.chain().focus().setImage({ src: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className={`tiptap-editor-container ${error ? 'is-invalid' : ''}`}>
      <div className="tiptap-menu-bar">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'is-active' : ''}
          title="Đậm"
        >
          <i className="fas fa-bold"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'is-active' : ''}
          title="Nghiêng"
        >
          <i className="fas fa-italic"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={editor.isActive('underline') ? 'is-active' : ''}
          title="Gạch chân"
        >
          <i className="fas fa-underline"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'is-active' : ''}
          title="Gạch ngang"
        >
          <i className="fas fa-strikethrough"></i>
        </button>

        <div className="divider"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
          title="Tiêu đề 1"
        >
          <i className="fas fa-heading"></i><sup>1</sup>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
          title="Tiêu đề 2"
        >
          <i className="fas fa-heading"></i><sup>2</sup>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
          title="Tiêu đề 3"
        >
          <i className="fas fa-heading"></i><sup>3</sup>
        </button>

        <div className="divider"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive('bulletList') ? 'is-active' : ''}
          title="Danh sách"
        >
          <i className="fas fa-list-ul"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive('orderedList') ? 'is-active' : ''}
          title="Danh sách có thứ tự"
        >
          <i className="fas fa-list-ol"></i>
        </button>

        <div className="divider"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
          title="Canh trái"
        >
          <i className="fas fa-align-left"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
          title="Canh giữa"
        >
          <i className="fas fa-align-center"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
          title="Canh phải"
        >
          <i className="fas fa-align-right"></i>
        </button>

        <div className="divider"></div>

        <button
          type="button"
          onClick={() => setShowLinkModal(true)}
          className={editor.isActive('link') ? 'is-active' : ''}
          title="Thêm liên kết"
        >
          <i className="fas fa-link"></i>
        </button>
        <button
          type="button"
          onClick={() => setShowImageModal(true)}
          title="Chèn hình ảnh"
        >
          <i className="fas fa-image"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive('blockquote') ? 'is-active' : ''}
          title="Trích dẫn"
        >
          <i className="fas fa-quote-right"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive('codeBlock') ? 'is-active' : ''}
          title="Khối mã"
        >
          <i className="fas fa-code"></i>
        </button>

        <div className="divider"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Hoàn tác"
        >
          <i className="fas fa-undo"></i>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Làm lại"
        >
          <i className="fas fa-redo"></i>
        </button>
      </div>
      
      <div className="tiptap-editor-content">
        <EditorContent editor={editor} />
      </div>
      
      <LinkModal 
        show={showLinkModal} 
        onClose={() => setShowLinkModal(false)} 
        onInsert={(url, text) => setLink(url, text)} 
      />
      
      <ImageModal 
        show={showImageModal} 
        onClose={() => setShowImageModal(false)} 
        onInsert={insertImage} 
      />
    </div>
  );
};

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { post, loading, error } = useSelector((state) => state.post);
  const { categories } = useSelector((state) => state.category);
  
  // Thêm state để quản lý trạng thái đang lưu
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    thumbnail: null,
    status: 'DRAFT'
  });
  
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  
  useEffect(() => {
    if (id) {
      dispatch(fetchPostDetail(id));
      dispatch(fetchAllCategories());
    }
  }, [dispatch, id]);
  
  useEffect(() => {
    if (post) {
      console.log("Post data loaded:", post);
      setFormData({
        title: post.title || '',
        content: post.content || '',
        categoryId: post.categoryId || '',
        status: post.status || 'DRAFT',
        thumbnail: null
      });
      
      if (post.thumbnail) {
        const thumbnailUrl = post.thumbnail.startsWith('http') 
          ? post.thumbnail 
          : `http://localhost:8080/upload${post.thumbnail}`;
        setThumbnailPreview(thumbnailUrl);
      }
    }
  }, [post]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleContentChange = (content) => {
    setFormData({
      ...formData,
      content: content
    });
  };
  
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        thumbnail: file
      });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Cập nhật hàm handleSubmit để hiển thị hiệu ứng đang xử lý
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Hiển thị logs để debug
    console.log("Submitting form data:", formData);
    
    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('content', formData.content);
    formDataToSend.append('categoryId', formData.categoryId);
    
    // Chuyển đổi status thành published
    const isPublished = formData.status === 'PUBLISHED';
    formDataToSend.append('published', isPublished);
    
    // Chỉ gửi thumbnail nếu có file mới
    if (formData.thumbnail instanceof File) {
      formDataToSend.append('thumbnail', formData.thumbnail);
    }
    
    setSuccessMessage('');
    // Bắt đầu hiệu ứng đang lưu
    setIsSaving(true);
    
    // Gửi request trực tiếp thay vì sử dụng postAPI
    const token = localStorage.getItem('token');
    
    // Đặt loading state
    dispatch({ type: 'post/updatePostStart' });
    
    // Gọi API theo cấu trúc hiện tại của bạn
    axios.put(`http://localhost:8080/api/posts/${id}`, formDataToSend, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        console.log('Update success:', response.data);
        
        dispatch({ 
          type: 'post/updatePostSuccess',
          payload: response.data
        });
        
        setSuccessMessage('Cập nhật bài viết thành công!');
        
        // Chuyển hướng sau khi lưu thành công
        setTimeout(() => {
          navigate(`/post/${id}`);
        }, 2000);
      })
      .catch(err => {
        console.error('Update error:', err);
        
        dispatch({ 
          type: 'post/updatePostFailure',
          payload: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật bài viết'
        });
      })
      .finally(() => {
        // Kết thúc hiệu ứng đang lưu
        setIsSaving(false);
      });
  };
  
  if (loading && !post) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <h2 className="mb-4">Chỉnh sửa bài viết</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Tiêu đề</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Danh mục</Form.Label>
              <Form.Select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories && categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Ảnh đại diện</Form.Label>
              <div>
                {thumbnailPreview && (
                  <div className="mb-2">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      style={{ maxWidth: '200px', maxHeight: '150px' }}
                      className="img-thumbnail"
                    />
                  </div>
                )}
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                />
              </div>
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Nội dung</Form.Label>
              {/* Thay thế textarea bằng TipTapEditor */}
              <TipTapEditor
                initialValue={formData.content}
                onChange={handleContentChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-4">
              <Form.Label>Trạng thái</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="DRAFT">Bản nháp</option>
                <option value="PENDING">Gửi duyệt</option>
                {post && post.status === 'PUBLISHED' && (
                  <option value="PUBLISHED">Đã xuất bản</option>
                )}
              </Form.Select>
            </Form.Group>
            
            <div className="d-flex gap-2">
              <Button 
                variant="success" 
                type="button" 
                className="me-2"
                onClick={() => setShowPreview(true)}
                disabled={isSaving}
              >
                <i className="fas fa-eye me-1"></i> Xem trước
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isSaving}
                className="position-relative"
              >
                {isSaving ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => navigate(`/post/${id}`)}
                disabled={isSaving}
              >
                Hủy
              </Button>
            </div>
          </Form>
          
          {/* Preview Modal */}
          <PreviewModal 
            show={showPreview}
            onClose={() => setShowPreview(false)}
            title={formData.title}
            content={formData.content}
            thumbnail={formData.thumbnail || thumbnailPreview}
          />
        </Card.Body>
      </Card>
      
      {/* Thêm overlay khi đang lưu */}
      {isSaving && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 9999
          }}
        >
          <div 
            className="bg-white p-4 rounded-3 shadow-lg text-center"
            style={{ maxWidth: '300px' }}
          >
            <Spinner
              animation="border"
              role="status"
              variant="primary"
              className="mb-3"
            />
            <h5 className="mb-2">Đang lưu bài viết</h5>
            <p className="text-muted mb-0">Vui lòng đợi trong giây lát...</p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default EditPost;