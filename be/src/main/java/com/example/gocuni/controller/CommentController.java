package com.example.gocuni.controller;

import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.gocuni.dto.CommentMediaDto;
import com.example.gocuni.dto.CommentMediaResponse;
import com.example.gocuni.dto.CommentRequest;
import com.example.gocuni.dto.CommentResponse;
import com.example.gocuni.model.Comment;
import com.example.gocuni.model.CommentLike;
import com.example.gocuni.model.CommentMedia;
import com.example.gocuni.model.Post;
import com.example.gocuni.model.User;
import com.example.gocuni.repository.CommentLikeRepository;
import com.example.gocuni.repository.CommentMediaRepository;
import com.example.gocuni.repository.CommentRepository;
import com.example.gocuni.repository.PostRepository;
import com.example.gocuni.repository.UserRepository;
import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.service.FileStorageService;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CommentController {
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CommentLikeRepository commentLikeRepository;
    
    @Autowired
    private CommentMediaRepository commentMediaRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @GetMapping("/post/{postId}")
    @Transactional  
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getCommentsByPost(
            @PathVariable Long postId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            // Kiểm tra bài viết tồn tại
            if (!postRepository.existsById(postId)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(
                        HttpStatus.NOT_FOUND.value(),
                        "Không tìm thấy bài viết",
                        null
                    )
                );
            }
            
            // Chỉ lấy các bình luận gốc (không phải phản hồi)
            PageRequest pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            Page<Comment> commentsPage = commentRepository.findByPostIdAndParentCommentIsNull(postId, pageable);
            
            // Lấy thông tin người dùng hiện tại (nếu đã đăng nhập)
            Long currentUserId = null;
            try {
                UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
                User currentUser = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
                if (currentUser != null) {
                    currentUserId = currentUser.getId();
                }
            } catch (Exception e) {
                // Người dùng chưa đăng nhập
            }
            
            final Long userId = currentUserId;
            
            // Chuyển đổi sang CommentResponse và thêm thông tin phản hồi
            List<CommentResponse> commentResponses = commentsPage.getContent().stream()
                    .map(comment -> {
                        // Khởi tạo collection trước khi chuyển đổi
                        Hibernate.initialize(comment.getMedia());
                        if (comment.getReplies() != null) {
                            comment.getReplies().forEach(reply -> Hibernate.initialize(reply.getMedia()));
                        }
                        return convertToCommentResponse(comment, userId);
                    })
                    .collect(Collectors.toList());
            
            Page<CommentResponse> commentResponsePage = new PageImpl<>(
                commentResponses, pageable, commentsPage.getTotalElements()
            );
            
            return ResponseEntity.ok(new ApiResponse<>(
                HttpStatus.OK.value(),
                "Lấy danh sách bình luận thành công",
                commentResponsePage
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi lấy danh sách bình luận: " + e.getMessage(),
                    null
                )
            );
        }
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Valid @RequestBody CommentRequest commentRequest) {
        
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            Post post = postRepository.findById(commentRequest.getPostId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
            
            Comment comment = new Comment();
            comment.setContent(commentRequest.getContent());
            comment.setUser(user);
            comment.setPost(post);
            
            // Xử lý nếu đây là phản hồi cho một bình luận
            if (commentRequest.getParentId() != null) {
                Comment parentComment = commentRepository.findById(commentRequest.getParentId())
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận gốc"));
                comment.setParentComment(parentComment);
            }
            
            // Lưu comment trước để có ID
            Comment savedComment = commentRepository.save(comment);
            
            // Xử lý media (nếu có)
            if (commentRequest.getMedia() != null && !commentRequest.getMedia().isEmpty()) {
                // Giới hạn tối đa 3 media
                List<CommentMediaDto> mediaList = commentRequest.getMedia();
                if (mediaList.size() > 3) {
                    mediaList = mediaList.subList(0, 3);
                }
                
                for (CommentMediaDto mediaDto : mediaList) {
                    String mediaPath = saveMediaFromBase64(mediaDto, savedComment.getId());
                    
                    CommentMedia media = new CommentMedia();
                    media.setMediaUrl(mediaPath);
                    media.setMediaType(mediaDto.getMediaType());
                    media.setComment(savedComment);
                    
                    commentMediaRepository.save(media);
                    savedComment.getMedia().add(media);
                }
            }
            
            // Chuyển đổi sang response
            CommentResponse response = convertToCommentResponse(savedComment, user.getId());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Tạo bình luận thành công",
                response
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi tạo bình luận: " + e.getMessage(),
                    null
                )
            );
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteComment(@PathVariable Long id) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            Comment comment = commentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));
            
            // Kiểm tra quyền xóa bình luận
            if (!comment.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(
                    HttpStatus.FORBIDDEN.value(),
                    "Bạn không có quyền xóa bình luận này",
                    null
                ));
            }
            
            // Xóa media files
            for (CommentMedia media : comment.getMedia()) {
                fileStorageService.deleteFile(media.getMediaUrl());
            }
            
            commentRepository.delete(comment);
            
            return ResponseEntity.ok(new ApiResponse<>(
                HttpStatus.OK.value(),
                "Xóa bình luận thành công",
                null
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi xóa bình luận: " + e.getMessage(),
                    null
                )
            );
        }
    }
    
    @PostMapping("/{id}/like")
    @Transactional
    public ResponseEntity<ApiResponse<Integer>> likeComment(@PathVariable Long id) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            Comment comment = commentRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bình luận"));
            
            Optional<CommentLike> existingLike = commentLikeRepository.findByCommentIdAndUserId(id, user.getId());
            
            if (existingLike.isPresent()) {
                // Nếu đã like, thì unlike
                commentLikeRepository.delete(existingLike.get());
                
                int likeCount = commentLikeRepository.countByCommentId(id);
                
                return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Đã bỏ thích bình luận",
                    likeCount
                ));
            } else {
                // Nếu chưa like, thì like
                CommentLike commentLike = new CommentLike();
                commentLike.setComment(comment);
                commentLike.setUser(user);
                
                commentLikeRepository.save(commentLike);
                
                int likeCount = commentLikeRepository.countByCommentId(id);
                
                return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Đã thích bình luận",
                    likeCount
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi thích/bỏ thích bình luận: " + e.getMessage(),
                    null
                )
            );
        }
    }
    
    @GetMapping("/{id}/like-count")
    public ResponseEntity<ApiResponse<Integer>> getLikeCount(@PathVariable Long id) {
        try {
            if (!commentRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            int likeCount = commentLikeRepository.countByCommentId(id);
            
            return ResponseEntity.ok(new ApiResponse<>(
                HttpStatus.OK.value(),
                "Lấy số lượt thích thành công",
                likeCount
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi lấy số lượt thích: " + e.getMessage(),
                    null
                )
            );
        }
    }
    
    // Helper method để chuyển đổi Comment thành CommentResponse
    private CommentResponse convertToCommentResponse(Comment comment, Long currentUserId) {
        CommentResponse response = new CommentResponse();
        response.setId(comment.getId());
        response.setContent(comment.getContent());
        response.setUserId(comment.getUser().getId());
        response.setUserName(comment.getUser().getFullName());
        
        // Xử lý avatar
        if (comment.getUser().getAvatarUrl() != null) {
            response.setUserAvatar(comment.getUser().getAvatarUrl());
        }
        
        response.setPostId(comment.getPost().getId());
        response.setCreatedAt(comment.getCreatedAt());
        
        // Số lượt thích
        int likeCount = commentLikeRepository.countByCommentId(comment.getId());
        response.setLikeCount(likeCount);
        
        // Kiểm tra xem người dùng hiện tại đã thích bình luận này chưa
        if (currentUserId != null) {
            boolean userHasLiked = commentLikeRepository.findByCommentIdAndUserId(comment.getId(), currentUserId).isPresent();
            response.setUserHasLiked(userHasLiked);
        }
        
        // Chuyển đổi media
        List<CommentMediaResponse> mediaResponses = comment.getMedia().stream()
                .map(media -> {
                    CommentMediaResponse mediaResponse = new CommentMediaResponse();
                    mediaResponse.setId(media.getId());
                    mediaResponse.setMediaUrl(media.getMediaUrl());
                    mediaResponse.setMediaType(media.getMediaType());
                    return mediaResponse;
                })
                .collect(Collectors.toList());
        response.setMedia(mediaResponses);
        
        // Xử lý thông tin parent comment
        if (comment.getParentComment() != null) {
            response.setParentId(comment.getParentComment().getId());
        }
        
        // Lấy các phản hồi nếu có
        if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
            List<CommentResponse> replyResponses = comment.getReplies().stream()
                    .map(reply -> convertToCommentResponse(reply, currentUserId))
                    .collect(Collectors.toList());
            response.setReplies(replyResponses);
        } else {
            response.setReplies(new ArrayList<>());
        }
        
        return response;
    }
    
    // Helper method để lưu media từ base64 string
    private String saveMediaFromBase64(CommentMediaDto mediaDto, Long commentId) {
        try {
            // Kiểm tra nếu là base64
            if (mediaDto.getMediaContent().startsWith("data:")) {
                // Xử lý base64 string
                String[] parts = mediaDto.getMediaContent().split(",");
                String base64Content = parts.length > 1 ? parts[1] : parts[0];
                
                // Decode base64 string thành byte array
                byte[] mediaBytes = Base64.getDecoder().decode(base64Content);
                
                // Tạo tên file
                String fileName = "comment_" + commentId + "_" + System.currentTimeMillis();
                if (mediaDto.getMediaType().equals("image")) {
                    fileName += ".jpg";
                } else if (mediaDto.getMediaType().equals("video")) {
                    fileName += ".mp4";
                }
                
                // Lưu file và trả về đường dẫn
                String savedPath = fileStorageService.storeFileFromBytes(mediaBytes, "comments", fileName);
                System.out.println("Media saved at path: " + savedPath);
                System.out.println("Absolute file path: " + Paths.get("").toAbsolutePath().resolve("upload").resolve("comments").resolve(fileName));
                
                return savedPath;
            } else {
                // Đã là đường dẫn tạm thời, chỉ cần di chuyển file
                return fileStorageService.moveFile(mediaDto.getMediaContent(), "comments");
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lưu media: " + e.getMessage());
        }
    }
}