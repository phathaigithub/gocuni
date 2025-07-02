package com.example.gocuni.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.model.Comment;
import com.example.gocuni.model.CommentMedia;
import com.example.gocuni.repository.CommentLikeRepository;
import com.example.gocuni.repository.CommentMediaRepository;
import com.example.gocuni.repository.CommentRepository;
import com.example.gocuni.service.FileStorageService;

@RestController
@RequestMapping("/api/admin/comments")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminCommentController {

    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private CommentLikeRepository commentLikeRepository;
    
    @Autowired
    private CommentMediaRepository commentMediaRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Lấy danh sách bình luận có phân trang và tìm kiếm
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String keyword) {
        
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<Comment> commentsPage;
            
            // Tìm kiếm theo nội dung nếu có từ khóa
            if (keyword != null && !keyword.isEmpty()) {
                commentsPage = commentRepository.findByContentContainingIgnoreCase(keyword, pageable);
            } else {
                commentsPage = commentRepository.findAll(pageable);
            }
            
            List<Map<String, Object>> comments = new ArrayList<>();
            
            for (Comment comment : commentsPage.getContent()) {
                Map<String, Object> commentMap = new HashMap<>();
                commentMap.put("id", comment.getId());
                commentMap.put("content", comment.getContent());
                commentMap.put("createdAt", comment.getCreatedAt());
                
                // Thông tin người dùng
                Map<String, Object> user = new HashMap<>();
                user.put("id", comment.getUser().getId());
                user.put("email", comment.getUser().getEmail());
                user.put("fullName", comment.getUser().getFullName());
                user.put("avatarUrl", comment.getUser().getAvatarUrl());
                commentMap.put("user", user);
                
                // Thông tin bài viết
                Map<String, Object> post = new HashMap<>();
                post.put("id", comment.getPost().getId());
                post.put("title", comment.getPost().getTitle());
                commentMap.put("post", post);
                
                // Số lượt thích
                int likeCount = commentLikeRepository.countByCommentId(comment.getId());
                commentMap.put("likeCount", likeCount);
                
                // Thông tin media
                List<Map<String, Object>> mediaList = new ArrayList<>();
                for (CommentMedia media : comment.getMedia()) {
                    Map<String, Object> mediaMap = new HashMap<>();
                    mediaMap.put("id", media.getId());
                    mediaMap.put("mediaUrl", media.getMediaUrl());
                    mediaMap.put("mediaType", media.getMediaType());
                    mediaList.add(mediaMap);
                }
                commentMap.put("media", mediaList);
                
                // Phản hồi
                if (comment.getParentComment() != null) {
                    commentMap.put("parentId", comment.getParentComment().getId());
                }
                
                comments.add(commentMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("comments", comments);
            response.put("currentPage", commentsPage.getNumber());
            response.put("totalItems", commentsPage.getTotalElements());
            response.put("totalPages", commentsPage.getTotalPages());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách bình luận thành công",
                    response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy danh sách bình luận: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Lấy thông tin chi tiết của một bình luận
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCommentById(@PathVariable Long id) {
        try {
            // Sửa truy vấn để tải eagerly các replies
            Comment comment = commentRepository.findCommentWithRepliesById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));
            
            Map<String, Object> commentData = new HashMap<>();
            commentData.put("id", comment.getId());
            commentData.put("content", comment.getContent());
            commentData.put("createdAt", comment.getCreatedAt());
            
            // Thông tin người dùng
            Map<String, Object> user = new HashMap<>();
            user.put("id", comment.getUser().getId());
            user.put("email", comment.getUser().getEmail());
            user.put("fullName", comment.getUser().getFullName());
            user.put("avatarUrl", comment.getUser().getAvatarUrl());
            commentData.put("user", user);
            
            // Thông tin bài viết
            Map<String, Object> post = new HashMap<>();
            post.put("id", comment.getPost().getId());
            post.put("title", comment.getPost().getTitle());
            commentData.put("post", post);
            
            // Số lượt thích
            int likeCount = commentLikeRepository.countByCommentId(comment.getId());
            commentData.put("likeCount", likeCount);
            
            // Thông tin media
            List<Map<String, Object>> mediaList = new ArrayList<>();
            if (comment.getMedia() != null) {
                for (CommentMedia media : comment.getMedia()) {
                    Map<String, Object> mediaMap = new HashMap<>();
                    mediaMap.put("id", media.getId());
                    mediaMap.put("mediaUrl", media.getMediaUrl());
                    mediaMap.put("mediaType", media.getMediaType());
                    mediaList.add(mediaMap);
                }
            }
            commentData.put("media", mediaList);
            
            // Thông tin phản hồi
            if (comment.getParentComment() != null) {
                Map<String, Object> parentComment = new HashMap<>();
                parentComment.put("id", comment.getParentComment().getId());
                parentComment.put("content", comment.getParentComment().getContent());
                commentData.put("parentComment", parentComment);
            }
            
            // Danh sách phản hồi cho bình luận này
            List<Map<String, Object>> replies = new ArrayList<>();
            // Kiểm tra trước khi truy cập vào replies để tránh NullPointerException
            if (comment.getReplies() != null) {
                for (Comment reply : comment.getReplies()) {
                    Map<String, Object> replyMap = new HashMap<>();
                    replyMap.put("id", reply.getId());
                    replyMap.put("content", reply.getContent());
                    replyMap.put("createdAt", reply.getCreatedAt());
                    // Kiểm tra null cho user
                    if (reply.getUser() != null) {
                        replyMap.put("userId", reply.getUser().getId());
                        replyMap.put("userName", reply.getUser().getFullName());
                    } else {
                        replyMap.put("userName", "Không xác định");
                    }
                    replies.add(replyMap);
                }
            }
            commentData.put("replies", replies);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy thông tin bình luận thành công",
                    commentData
            ));
        } catch (Exception e) {
            e.printStackTrace(); // Thêm dòng này để ghi log lỗi chi tiết
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy thông tin bình luận: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Lấy danh sách bình luận theo bài viết
     */
    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCommentsByPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Comment> commentsPage = commentRepository.findByPostId(postId, pageable);
            
            List<Map<String, Object>> comments = new ArrayList<>();
            
            for (Comment comment : commentsPage.getContent()) {
                Map<String, Object> commentMap = new HashMap<>();
                commentMap.put("id", comment.getId());
                commentMap.put("content", comment.getContent());
                commentMap.put("createdAt", comment.getCreatedAt());
                
                // Thông tin người dùng
                Map<String, Object> user = new HashMap<>();
                user.put("id", comment.getUser().getId());
                user.put("email", comment.getUser().getEmail());
                user.put("fullName", comment.getUser().getFullName());
                user.put("avatarUrl", comment.getUser().getAvatarUrl());
                commentMap.put("user", user);
                
                // Số lượt thích
                int likeCount = commentLikeRepository.countByCommentId(comment.getId());
                commentMap.put("likeCount", likeCount);
                
                comments.add(commentMap);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("comments", comments);
            response.put("currentPage", commentsPage.getNumber());
            response.put("totalItems", commentsPage.getTotalElements());
            response.put("totalPages", commentsPage.getTotalPages());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách bình luận theo bài viết thành công",
                    response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy danh sách bình luận theo bài viết: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Xóa bình luận
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteComment(@PathVariable Long id) {
        try {
            Comment comment = commentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));
            
            // Xóa các file media nếu có
            for (CommentMedia media : comment.getMedia()) {
                fileStorageService.deleteFile(media.getMediaUrl());
            }
            
            // Xóa comment
            commentRepository.delete(comment);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Xóa bình luận thành công",
                    null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi xóa bình luận: " + e.getMessage(),
                            null
                    ));
        }
    }
}