import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Form, Alert, Spinner, Image } from 'react-bootstrap';
import { FaUser, FaCalendarAlt, FaEye, FaComment, FaThumbsUp, FaShare, FaFacebook, FaTwitter, FaLinkedin, FaImage, FaVideo, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPostDetail, createComment, likePost, likeComment } from '../index';
import '../../../assets/css/style.css'; // Import CSS styles
import userAvatar from '../../../assets/images/user-placeholder.png'; // Default avatar image
const PostDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { post, loading, error } = useSelector((state) => state.post);
  const comments = useSelector((state) => {
    if (!state.post.postComments) return [];
    return state.post.postComments[id] || [];
  });
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [comment, setComment] = useState('');
  const [commentError, setCommentError] = useState('');
  
  const [commentMedia, setCommentMedia] = useState([]);
  const [previewMedia, setPreviewMedia] = useState([]);
  const fileInputRef = useRef(null);
  const [uploadingComment, setUploadingComment] = useState(false);

  // Thêm hàm xử lý đường dẫn hình ảnh
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/images/avatars/userAvatar.png';
    
    // Nếu là URL đầy đủ
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Nếu bắt đầu với /http
    if (imagePath.startsWith('/http')) {
      return imagePath.substring(1);
    }
    
    // Xử lý đường dẫn avatar
    if (imagePath.startsWith('/avatars/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Xử lý đường dẫn thumbnail của bài viết
    if (imagePath.startsWith('/posts/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Xử lý đường dẫn media của bình luận
    if (imagePath.startsWith('/comments/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    // Xử lý các trường hợp khác
    if (imagePath.startsWith('/')) {
      return `http://localhost:8080/upload${imagePath}`;
    }
    
    return `http://localhost:8080/upload/${imagePath}`;
  };
  
  useEffect(() => {
    if (id) {
      console.log("Fetching post details for ID:", id);
      dispatch(fetchPostDetail(id));
    }
  }, [dispatch, id]);
  
  // Thêm log để kiểm tra dữ liệu
  useEffect(() => {
    console.log("Current post in component:", post);
    console.log("Current comments in component:", comments);
  }, [post, comments]);
  
  // Thêm hàm xử lý file
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Kiểm tra số lượng file
    if (commentMedia.length + files.length > 3) {
      alert('Bạn chỉ được đính kèm tối đa 3 file media');
      return;
    }
    
    // Xử lý từng file
    files.forEach(file => {
      // Kiểm tra loại file
      if (!file.type.match('image.*') && !file.type.match('video.*')) {
        alert('Chỉ chấp nhận file hình ảnh hoặc video');
        return;
      }
      
      // Kiểm tra kích thước file (giới hạn 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        
        // Thêm vào state
        setCommentMedia(prev => [...prev, {
          mediaType,
          mediaContent: reader.result
        }]);
        
        // Thêm vào preview
        setPreviewMedia(prev => [...prev, {
          mediaType,
          previewUrl: reader.result
        }]);
      };
      reader.readAsDataURL(file);
    });
    
    // Reset input file để có thể chọn lại cùng một file
    e.target.value = null;
  };

  // Hàm xóa media
  const removeMedia = (index) => {
    setCommentMedia(prev => prev.filter((_, i) => i !== index));
    setPreviewMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Cập nhật hàm gửi comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    console.log("Đang gửi bình luận...");
    
    if (!comment.trim() && commentMedia.length === 0) {
      setCommentError('Vui lòng nhập nội dung bình luận hoặc đính kèm media');
      return;
    }
    
    setUploadingComment(true);
    
    try {
      console.log("Dữ liệu gửi đi:", { 
        postId: id, 
        content: comment,
        media: commentMedia
      });
      
      const result = await dispatch(createComment({ 
        postId: id, 
        content: comment,
        media: commentMedia
      })).unwrap();
      
      console.log("Kết quả:", result);
      
      // Reset sau khi gửi thành công
      setComment('');
      setCommentError('');
      setCommentMedia([]);
      setPreviewMedia([]);
      setUploadingComment(false);
      
      // Không cần refresh nữa vì Redux đã cập nhật state
    } catch (error) {
      console.error("Lỗi khi gửi bình luận:", error);
      setCommentError('Có lỗi xảy ra khi gửi bình luận: ' + (error.message || 'Lỗi không xác định'));
      setUploadingComment(false);
    }
  };
  
  const handleLikePost = () => {
    dispatch(likePost(id));
  };
  
  const handleLikeComment = (commentId) => {
    dispatch(likeComment({ commentId, postId: id }));
  };
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
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
  
  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
      </Container>
    );
  }
  
  // Trước phần return
  console.log("Rendering PostDetail with post:", post);
  console.log("Rendering PostDetail with comments:", comments);

  // Thay đổi điều kiện kiểm tra
  if (!post) {
    console.log("Post is null or undefined");
    return (
      <Container className="py-5">
        <Alert variant="warning">
          Không tìm thấy bài viết
        </Alert>
      </Container>
    );
  }
  
  return (
    <Container className="py-5">
      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
          
            <Card.Body className="p-4">
              <div className="mb-3">
                <Link to={`/category/${post.categoryId}`} className="text-decoration-none">
                  <Badge bg="primary" className="text-white">{post.categoryName}</Badge>
                </Link>
              </div>
              
              <h1 className="mb-3">{post.title}</h1>
              
              <div className="d-flex align-items-center mb-4 text-muted small">
                <div className="d-flex align-items-center me-4">
                  <FaUser className="me-1" />
                  <span>{post.authorName}</span>
                </div>
                <div className="d-flex align-items-center me-4">
                  <FaCalendarAlt className="me-1" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="d-flex align-items-center me-4">
                  <FaEye className="me-1" />
                  <span>{post.viewCount} lượt xem</span>
                </div>
                <div className="d-flex align-items-center">
                  <FaComment className="me-1" />
                  <span>{post.commentCount} bình luận</span>
                </div>
              </div>
              
              <div className="post-content mb-4">
                <div 
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                  className="responsive-content"
                />
              </div>
              
              <div className="d-flex gap-2 mb-4">
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={handleLikePost} 
                  disabled={!isAuthenticated}
                >
                  <FaThumbsUp className="me-1" /> Thích
                </Button>
                <Button variant="outline-secondary" size="sm">
                  <FaShare className="me-1" /> Chia sẻ
                </Button>
              </div>
              
              <div className="d-flex gap-2 mb-4">
                <Button variant="outline-primary" size="sm" className="rounded-circle">
                  <FaFacebook />
                </Button>
                <Button variant="outline-info" size="sm" className="rounded-circle">
                  <FaTwitter />
                </Button>
                <Button variant="outline-secondary" size="sm" className="rounded-circle">
                  <FaLinkedin />
                </Button>
              </div>
              
              <hr />
              
              {/* Phần bình luận */}
              <h4 className="mb-4">Bình luận ({comments?.length || 0})</h4>
              
              {isAuthenticated ? (
                <Form onSubmit={handleCommentSubmit} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Viết bình luận của bạn..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      isInvalid={!!commentError}
                      disabled={uploadingComment}
                    />
                    <Form.Control.Feedback type="invalid">
                      {commentError}
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  {/* Preview media */}
                  {previewMedia.length > 0 && (
                    <div className="media-preview d-flex flex-wrap gap-2 mb-3">
                      {previewMedia.map((media, index) => (
                        <div key={index} className="position-relative" style={{ width: '100px', height: '100px' }}>
                          {media.mediaType === 'image' ? (
                            <Image 
                              src={media.previewUrl} 
                              alt="Preview" 
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              thumbnail
                            />
                          ) : (
                            <video 
                              src={media.previewUrl} 
                              style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                              controls
                            />
                          )}
                          <Button 
                            variant="danger" 
                            size="sm" 
                            className="position-absolute top-0 end-0" 
                            onClick={() => removeMedia(index)}
                            style={{ padding: '2px 6px' }}
                          >
                            <FaTimes size={10} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="d-flex">
                    <div className="me-auto">
                      <Button 
                        variant="outline-secondary" 
                        type="button" 
                        className="me-2" 
                        onClick={() => fileInputRef.current.click()}
                        disabled={commentMedia.length >= 3 || uploadingComment}
                      >
                        <FaImage className="me-1" /> Thêm hình ảnh
                      </Button>
                      <Button 
                        variant="outline-secondary" 
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        disabled={commentMedia.length >= 3 || uploadingComment}
                      >
                        <FaVideo className="me-1" /> Thêm video
                      </Button>
                      <Form.Control
                        type="file"
                        ref={fileInputRef}
                        className="d-none"
                        onChange={handleFileChange}
                        accept="image/*,video/*"
                        multiple
                      />
                      <small className="d-block text-muted mt-1">
                        Tối đa 3 file, mỗi file không quá 5MB
                      </small>
                    </div>
                    <Button 
                      variant="primary" 
                      type="submit"
                      disabled={uploadingComment}
                    >
                      {uploadingComment ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-1" />
                          Đang gửi...
                        </>
                      ) : 'Gửi bình luận'}
                    </Button>
                  </div>
                </Form>
              ) : (
                <Alert variant="info">
                  Vui lòng <Link to="/login" className="alert-link">đăng nhập</Link> để bình luận.
                </Alert>
              )}
              
              {comments?.length > 0 ? (
                <div className="comments-list">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="mb-3 border-0 shadow-sm">
                      <Card.Body>
                        <div className="d-flex">
                          <div className="me-3">
                            <img 
                              src={comment.userAvatar ? getImageUrl(comment.userAvatar) : userAvatar} 
                              alt={comment.userName} 
                              className="rounded-circle comment-avatar"
                              style={{ width: '48px', height: '48px', objectFit: 'cover' }}
                              onError={(e) => {
                                console.error('Comment avatar load error:', comment.userAvatar);
                                e.target.onerror = null;
                                e.target.src = '/images/avatars/default-avatar.png';
                              }}
                            />
                          </div>
                          <div className="comment-content w-100">
                            <div className="d-flex align-items-center flex-wrap">
                              <h6 className="mb-0 me-2">{comment.userName}</h6>
                              <small className="text-muted">
                                {formatDate(comment.createdAt)}
                              </small>
                            </div>
                            <p className="mt-2 mb-2">{comment.content}</p>
                            
                            {/* Hiển thị media của comment */}
                            {comment.media && comment.media.length > 0 && (
                              <div className="comment-media-container mb-3">
                                <div className="d-flex flex-wrap gap-2">
                                  {comment.media.map((media, index) => (
                                    <div key={index} className="comment-media-item">
                                      {media.mediaType === 'image' ? (
                                        <img 
                                          src={getImageUrl(media.mediaUrl)} 
                                          alt="Comment media"
                                          className="rounded"
                                          style={{ maxWidth: '200px', maxHeight: '200px', cursor: 'pointer' }}
                                          onClick={() => window.open(getImageUrl(media.mediaUrl), '_blank')}
                                          onError={(e) => {
                                            console.error('Media load error:', media.mediaUrl);
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      ) : (
                                        <video 
                                          src={getImageUrl(media.mediaUrl)} 
                                          controls
                                          className="rounded"
                                          style={{ maxWidth: '200px', maxHeight: '200px' }}
                                          onError={(e) => {
                                            console.error('Media load error:', media.mediaUrl);
                                            e.target.onerror = null;
                                            e.target.style.display = 'none';
                                          }}
                                        />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="d-flex align-items-center">
                              <Button 
                                variant="link" 
                                className="p-0 text-muted me-3" 
                                onClick={() => handleLikeComment(comment.id)}
                                disabled={!isAuthenticated}
                              >
                                <FaThumbsUp className={comment.userHasLiked ? "text-primary me-1" : "me-1"} />
                                {comment.likeCount > 0 ? comment.likeCount : ''} Thích
                              </Button>
                              <Button 
                                variant="link" 
                                className="p-0 text-muted"
                                onClick={() => {
                                  // Triển khai chức năng phản hồi tại đây
                                  alert('Chức năng phản hồi đang được phát triển');
                                }}
                                disabled={!isAuthenticated}
                              >
                                <FaComment className="me-1" /> Phản hồi
                              </Button>
                            </div>
                            
                            {/* Hiển thị phản hồi */}
                            {comment.replies && comment.replies.length > 0 && (
                              <div className="replies-container mt-3 ms-4 border-start ps-3">
                                {comment.replies.map(reply => (
                                  <div key={reply.id} className="reply mb-3">
                                    <div className="d-flex">
                                      <div className="me-2">
                                        <img 
                                          src={reply.userAvatar ? getImageUrl(reply.userAvatar) : '/images/avatars/default-avatar.png'} 
                                          alt={reply.userName} 
                                          className="rounded-circle"
                                          style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                          onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/avatars/default-avatar.png';
                                          }}
                                        />
                                      </div>
                                      <div className="reply-content">
                                        <div className="d-flex align-items-center flex-wrap">
                                          <h6 className="mb-0 me-2 small">{reply.userName}</h6>
                                          <small className="text-muted">
                                            {formatDate(reply.createdAt)}
                                          </small>
                                        </div>
                                        <p className="mt-1 mb-1 small">{reply.content}</p>
                                        
                                        {/* Hiển thị media của reply */}
                                        {reply.media && reply.media.length > 0 && (
                                          <div className="reply-media-container mb-2">
                                            <div className="d-flex flex-wrap gap-2">
                                              {reply.media.map((media, index) => (
                                                <div key={index} className="reply-media-item">
                                                  {media.mediaType === 'image' ? (
                                                    <img 
                                                      src={getImageUrl(media.mediaUrl)} 
                                                      alt="Reply media"
                                                      className="rounded"
                                                      style={{ maxWidth: '150px', maxHeight: '150px', cursor: 'pointer' }}
                                                      onClick={() => window.open(getImageUrl(media.mediaUrl), '_blank')}
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                      }}
                                                    />
                                                  ) : (
                                                    <video 
                                                      src={getImageUrl(media.mediaUrl)} 
                                                      controls
                                                      className="rounded"
                                                      style={{ maxWidth: '150px', maxHeight: '150px' }}
                                                      onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                      }}
                                                    />
                                                  )}
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="d-flex align-items-center">
                                          <Button 
                                            variant="link" 
                                            className="p-0 text-muted small me-3" 
                                            onClick={() => handleLikeComment(reply.id)}
                                            disabled={!isAuthenticated}
                                          >
                                            <FaThumbsUp className={reply.userHasLiked ? "text-primary me-1" : "me-1"} />
                                            {reply.likeCount > 0 ? reply.likeCount : ''} Thích
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Chưa có bình luận nào.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          {/* Thông tin tác giả */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="card-title mb-3">Về tác giả</h5>
              <div className="d-flex align-items-center mb-3">
                <div className="detail-author-container">
                  <img 
                    src={post.authorAvatar ? getImageUrl(post.authorAvatar) : userAvatar} 
                    alt={post.authorName} 
                    className="rounded-circle detail-author-avatar me-3"
                    onError={(e) => {
                      console.error('Author avatar load error:', post.authorAvatar);
                      e.target.onerror = null;
                      e.target.src = '/images/avatars/default-avatar.png';
                    }}
                  />
                </div>
                <div>
                  <h6 className="mb-1">{post.authorName}</h6>
                  <p className="text-muted mb-0 small">Tác giả</p>
                </div>
              </div>
              <Button variant="outline-primary" size="sm" className="w-100">
                Xem tất cả bài viết
              </Button>
            </Card.Body>
          </Card>
          
          {/* Bài viết liên quan */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="card-title mb-3">Bài viết liên quan</h5>
              <div className="related-posts">
                <p className="text-center text-muted">Đang tải bài viết liên quan...</p>
              </div>
            </Card.Body>
          </Card>
          
          {/* Danh mục phổ biến */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="card-title mb-3">Danh mục phổ biến</h5>
              <div className="d-flex flex-wrap gap-2">
                <Link to="/category/1" className="text-decoration-none">
                  <Badge bg="secondary" className="p-2">Công nghệ</Badge>
                </Link>
                <Link to="/category/2" className="text-decoration-none">
                  <Badge bg="secondary" className="p-2">Giáo dục</Badge>
                </Link>
                <Link to="/category/3" className="text-decoration-none">
                  <Badge bg="secondary" className="p-2">Sức khỏe</Badge>
                </Link>
                <Link to="/category/4" className="text-decoration-none">
                  <Badge bg="secondary" className="p-2">Thể thao</Badge>
                </Link>
                <Link to="/category/5" className="text-decoration-none">
                  <Badge bg="secondary" className="p-2">Giải trí</Badge>
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PostDetail;