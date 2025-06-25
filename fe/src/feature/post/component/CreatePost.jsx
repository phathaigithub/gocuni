import React, { useState, useEffect, useCallback } from 'react';
import { Container, Form, Button, Row, Col, Card, Alert, Breadcrumb, Modal, Tab, Tabs } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Formik } from 'formik';
import * as Yup from 'yup';

// Thêm import cho TipTap
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TipTapLink from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';

// Thêm CSS cho TipTap
import './tiptap.css';
import '../../../assets/css/style.css';

// Modal component cho chèn hình ảnh
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
        <Tabs defaultActiveKey="upload" id="image-insert-tabs" className="mb-3">
          <Tab eventKey="upload" title="Tải lên">
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
          </Tab>
          <Tab eventKey="url" title="Từ URL">
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
              <Button variant="primary" type="submit" className="w-100">
                Chèn hình ảnh
              </Button>
            </Form>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

// Modal component cho chèn liên kết
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

// Modal xem trước
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

// Tiptap Editor Component
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

const CreatePost = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  // Comment các state liên quan đến bản nháp
  // const [draftSaved, setDraftSaved] = useState(false);
  // const [draftId, setDraftId] = useState(null);

  // Validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required('Tiêu đề không được để trống')
      .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
      .max(200, 'Tiêu đề không được quá 200 ký tự'),
    content: Yup.string()
      .required('Nội dung không được để trống')
      .min(20, 'Nội dung phải có ít nhất 20 ký tự'),
    categoryId: Yup.number()
      .required('Vui lòng chọn danh mục'),
  });

  const initialValues = {
    title: '',
    content: '',
    categoryId: '',
    published: true,
    thumbnail: null
  };

  // Fetch categories and draft on component mount
  useEffect(() => {
    const fetchCategoriesAndDraft = async () => {
      try {
        // Fetch categories
        const categoriesRes = await axios.get('http://localhost:8080/api/categories');
        if (categoriesRes.data && categoriesRes.data.data) {
          setCategories(categoriesRes.data.data);
        }
        
        // Comment phần tải bản nháp
        /*
        // Try to load draft
        try {
          const draftRes = await axios.get('http://localhost:8080/api/posts/draft', {
            withCredentials: true
          });
          
          if (draftRes.data && draftRes.data.data) {
            const draft = draftRes.data.data;
            setDraftId(draft.id);
            
            // Ask the user if they want to load the draft
            const loadDraft = window.confirm('Đã tìm thấy bản nháp trước đó. Bạn có muốn tiếp tục chỉnh sửa không?');
            if (loadDraft) {
              // Set form values to the draft values
              return {
                title: draft.title || '',
                content: draft.content || '',
                categoryId: draft.categoryId || '',
                published: true,
                thumbnail: draft.thumbnailUrl || null
              };
            }
          }
        } catch (draftErr) {
          // Draft not found or couldn't be loaded, just continue with empty form
          console.log('No draft found or error loading draft:', draftErr);
        }
        */
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      }
      
      return initialValues;
    };

    fetchCategoriesAndDraft().then(initialFormValues => {
      // Comment phần này vì nó liên quan đến việc tải bản nháp
      /*
      // If we found a draft and the user chose to load it
      if (initialFormValues !== initialValues) {
        // Set the form values - this needs to be handled differently since we're using Formik
        document.getElementById('title').value = initialFormValues.title;
        document.getElementById('categoryId').value = initialFormValues.categoryId;
        
        if (initialFormValues.thumbnail) {
          setThumbnailPreview(initialFormValues.thumbnail);
        }
      }
      */
    });
  }, []);

  // Comment toàn bộ function lưu bản nháp
  /*
  // Function to save draft
  const saveDraft = async (values) => {
    if (!values.title && !values.content) return; // Don't save empty drafts
    
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      if (values.categoryId) formData.append('categoryId', values.categoryId);
      if (values.thumbnail) formData.append('thumbnail', values.thumbnail);
      if (draftId) formData.append('id', draftId);
      
      const method = draftId ? 'put' : 'post';
      const url = draftId 
        ? `http://localhost:8080/api/posts/draft/${draftId}` 
        : 'http://localhost:8080/api/posts/draft';
      
      const response = await axios({
        method,
        url,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      
      if (response.data && response.data.data) {
        setDraftId(response.data.data.id);
        setDraftSaved(true);
        
        // Reset the saved status after 3 seconds
        setTimeout(() => {
          setDraftSaved(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Không thể lưu bản nháp. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };
  */

  // Comment tính năng auto-save
  /*
  // Auto-save draft every 30 seconds
  const [formValues, setFormValues] = useState(initialValues);
  
  // Theo dõi sự thay đổi của formValues và auto save
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (formValues.title || formValues.content) {
        console.log('Auto-saving draft...');
        saveDraft(formValues);
      }
    }, 30000); // 30 seconds
    
    return () => clearInterval(autoSaveInterval);
  }, [formValues, draftId]);
  */
  
  // Vẫn giữ state formValues để theo dõi giá trị form nhưng không dùng cho auto-save
  const [formValues, setFormValues] = useState(initialValues);

  // Trong hàm handleSubmit, comment phần xóa bản nháp
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setIsLoading(true);
    setError(null);

    try {
      // Lấy token từ localStorage
      const token = localStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('content', values.content);
      formData.append('categoryId', values.categoryId);
      formData.append('published', values.published);

      if (values.thumbnail) {
        formData.append('thumbnail', values.thumbnail);
      }

      // Gửi request với token trong header Authorization
      const response = await axios.post(
        'http://localhost:8080/api/posts/add',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}` // Thêm token vào header
          },
          withCredentials: true
        }
      );

      console.log('Post created successfully:', response.data);

      // Comment phần xóa bản nháp
      /*
      // Nếu có bản nháp, xóa nó
      if (draftId) {
        try {
          await axios.delete(`http://localhost:8080/api/posts/draft/${draftId}`, {
            withCredentials: true
          });
        } catch (deleteErr) {
          console.error('Error deleting draft after publishing:', deleteErr);
        }
      }
      */

      // Chuyển hướng đến trang chi tiết bài viết vừa tạo
      if (response.data && response.data.data && response.data.data.id) {
        navigate(`/post/${response.data.data.id}`);
      } else {
        navigate('/');
      }

      resetForm();
      setThumbnailPreview(null);
    } catch (err) {
      console.error('Error creating post:', err);
      // Hiển thị thông báo lỗi cụ thể hơn
      if (err.response && err.response.status === 403) {
        setError('Bạn không có quyền tạo bài viết. Vui lòng đăng nhập lại.');
      } else {
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo bài viết. Vui lòng thử lại sau.');
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  // Handle thumbnail change and preview
  const handleThumbnailChange = (event, setFieldValue) => {
    const file = event.currentTarget.files[0];
    if (file) {
      setFieldValue('thumbnail', file);

      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Container className="my-4">
      <Breadcrumb className="mb-4">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Trang chủ</Breadcrumb.Item>
        <Breadcrumb.Item active>Tạo bài viết</Breadcrumb.Item>
      </Breadcrumb>
      
      <Card className="shadow">
        <Card.Header as="h4" className="bg-primary text-white d-flex justify-content-between align-items-center">
          <div><i className="fas fa-edit me-2"></i>Tạo bài viết mới</div>
          {/* Comment badge hiển thị đã lưu nháp */}
          {/* {draftSaved && <span className="badge bg-success">Đã lưu nháp</span>} */}
        </Card.Header>
        <Card.Body className="p-4">
          {error && <Alert variant="danger">{error}</Alert>}

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps) => {
              // Update formValues without using hooks - giữ lại để theo dõi giá trị form
              if (JSON.stringify(formikProps.values) !== JSON.stringify(formValues)) {
                setFormValues(formikProps.values);
              }
              
              return (
                <Form noValidate onSubmit={formikProps.handleSubmit}>
                  {/* Title */}
                  <Form.Group className="mb-3" controlId="title">
                    <Form.Label>Tiêu đề</Form.Label>
                    <Form.Control
                      type="text"
                      name="title"
                      value={formikProps.values.title}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      isInvalid={formikProps.touched.title && !!formikProps.errors.title}
                      placeholder="Nhập tiêu đề bài viết"
                    />
                    <Form.Control.Feedback type="invalid">
                      {formikProps.errors.title}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Thumbnail */}
                  <Form.Group className="mb-3" controlId="thumbnail">
                    <Form.Label>Hình ảnh bài viết</Form.Label>
                    <Form.Control
                      type="file"
                      name="thumbnail"
                      onChange={(e) => handleThumbnailChange(e, formikProps.setFieldValue)}
                      onBlur={formikProps.handleBlur}
                      accept="image/*"
                    />
                    <Form.Text className="text-muted">
                      Chọn một hình ảnh để làm thumbnail cho bài viết
                    </Form.Text>

                    {thumbnailPreview && (
                      <div className="mt-2">
                        <p>Xem trước:</p>
                        <img
                          src={thumbnailPreview}
                          alt="Thumbnail Preview"
                          style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          className="border rounded"
                        />
                      </div>
                    )}
                  </Form.Group>

                  {/* Category */}
                  <Form.Group className="mb-3" controlId="categoryId">
                    <Form.Label>Danh mục</Form.Label>
                    <Form.Select
                      name="categoryId"
                      value={formikProps.values.categoryId}
                      onChange={formikProps.handleChange}
                      onBlur={formikProps.handleBlur}
                      isInvalid={formikProps.touched.categoryId && !!formikProps.errors.categoryId}
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Control.Feedback type="invalid">
                      {formikProps.errors.categoryId}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Content - Using TipTap */}
                  <Form.Group className="mb-4" controlId="content">
                    <Form.Label>Nội dung</Form.Label>
                    <TipTapEditor
                      initialValue={formikProps.values.content}
                      onChange={(newContent) => formikProps.setFieldValue('content', newContent)}
                      error={formikProps.touched.content && formikProps.errors.content}
                    />
                    {formikProps.touched.content && formikProps.errors.content && (
                      <div className="invalid-feedback d-block">{formikProps.errors.content}</div>
                    )}
                  </Form.Group>

                  {/* Published */}
                  <Form.Group className="mb-4" controlId="published">
                    <Form.Check
                      type="checkbox"
                      name="published"
                      checked={formikProps.values.published}
                      onChange={formikProps.handleChange}
                      label="Xuất bản ngay"
                    />
                  </Form.Group>

                  <Row className="mt-3">
                    <Col>
                      <Button
                        variant="secondary"
                        onClick={() => navigate(-1)}
                        className="me-2"
                      >
                        Hủy
                      </Button>
                      {/* Comment nút Lưu nháp */}
                      {/*
                      <Button
                        variant="info"
                        type="button"
                        className="me-2"
                        onClick={() => saveDraft(formikProps.values)}
                        disabled={isLoading}
                      >
                        <i className="fas fa-save me-1"></i> Lưu nháp
                      </Button>
                      */}
                      <Button
                        variant="success"
                        type="button"
                        className="me-2"
                        onClick={() => setShowPreview(true)}
                      >
                        <i className="fas fa-eye me-1"></i> Xem trước
                      </Button>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Đang tạo bài viết...' : 'Tạo bài viết'}
                      </Button>
                    </Col>
                  </Row>
                  
                  {/* Preview Modal */}
                  <PreviewModal 
                    show={showPreview}
                    onClose={() => setShowPreview(false)}
                    title={formikProps.values.title}
                    content={formikProps.values.content}
                    thumbnail={formikProps.values.thumbnail || thumbnailPreview}
                  />
                </Form>
              );
            }}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreatePost;