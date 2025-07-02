import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaRegComment, FaRegEye } from 'react-icons/fa';
import placeholder from '../../assets/images/placeholder.png';
import '../../assets/css/style.css'; 

const PostCard = ({ post }) => {
  // Kiểm tra nếu post không tồn tại
  if (!post) return null;

  // Xử lý trường hợp createdAt là null
  const formattedDate = post.createdAt 
    ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Không rõ ngày';

  // Chỉnh sửa hàm getThumbnailUrl
  const getThumbnailUrl = (thumbnailPath) => {
    if (!thumbnailPath) return placeholder;
    
    // Nếu là URL đầy đủ (bắt đầu bằng http hoặc https)
    if (thumbnailPath.startsWith('http')) {
      return thumbnailPath;
    }
    
    // Nếu bắt đầu với /http hoặc /https (lỗi thường gặp)
    if (thumbnailPath.startsWith('/http')) {
      return thumbnailPath.substring(1); // Loại bỏ dấu / đầu tiên
    }
    
    // Đối với hình ảnh từ api thực tế (ví dụ: /posts/xyz.jpeg)
    if (thumbnailPath.startsWith('/posts/')) {
      const parts = thumbnailPath.split('/');
      const folder = parts[1]; // posts
      const filename = parts[2]; // xyz.jpeg
      return `http://localhost:8080/api/posts/file/${folder}/${filename}`;
    }
    
    // Đối với avatar
    if (thumbnailPath.startsWith('/avatars/')) {
      const parts = thumbnailPath.split('/');
      const folder = parts[1]; // avatars
      const filename = parts[2]; // xyz.jpeg
      return `http://localhost:8080/api/posts/file/${folder}/${filename}`;
    }
    
    // Cho các trường hợp khác
    if (thumbnailPath.startsWith('/')) {
      const pathWithoutLeadingSlash = thumbnailPath.substring(1);
      return `http://localhost:8080/upload/${pathWithoutLeadingSlash}`;
    }
    
    return `http://localhost:8080/upload/${thumbnailPath}`;
  };

  return (
    <Card className="h-100 post-card shadow-sm hover-effect">
      <Link to={`/post/${post.id}`} className="text-decoration-none">
        <div className="post-thumbnail-wrapper">
          <Card.Img 
            variant="top" 
            src={getThumbnailUrl(post.thumbnail)} 
            alt={post.title || 'Thumbnail'}
            className="post-thumbnail"
            onError={(e) => {
              e.target.onerror = null; // Tránh vòng lặp vô hạn
              e.target.src = placeholder;
            }}
          />
          <div className="category-badge">{post.categoryName || 'Chưa phân loại'}</div>
        </div>
        <Card.Body>
          <Card.Title className="post-title">{post.title || 'Không có tiêu đề'}</Card.Title>
          <div className="post-meta d-flex align-items-center mb-2">
            <img 
              src={post.authorAvatar ? getThumbnailUrl(post.authorAvatar) : placeholder} 
              alt={post.authorName || 'Author'}
              className="author-avatar rounded-circle me-2"
              width="24"
              height="24"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = placeholder;
              }}
            />
            <small className="text-muted">{post.authorName || 'Tác giả ẩn danh'} • {formattedDate}</small>
          </div>
          {/* Xóa phần hiển thị nội dung bài viết
          <Card.Text className="post-excerpt">
            {excerptContent}
          </Card.Text>
          */}
        </Card.Body>
        <Card.Footer className="bg-transparent border-0 d-flex justify-content-between">
          <small className="text-muted d-flex align-items-center">
            <FaRegEye className="me-1" /> {post.viewCount || 0}
          </small>
          <small className="text-muted d-flex align-items-center">
            <FaRegComment className="me-1" /> {post.commentCount || 0}
          </small>
        </Card.Footer>
      </Link>
    </Card>
  );
};

export default PostCard;