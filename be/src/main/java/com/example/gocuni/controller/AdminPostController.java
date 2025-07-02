package com.example.gocuni.controller;

import java.time.LocalDateTime;
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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.gocuni.model.Category;
import com.example.gocuni.model.Post;
import com.example.gocuni.model.User;
import com.example.gocuni.repository.CategoryRepository;
import com.example.gocuni.repository.CommentRepository;
import com.example.gocuni.repository.PostRepository;
import com.example.gocuni.repository.UserRepository;
import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.service.FileStorageService;

@RestController
@RequestMapping("/api/admin/posts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminPostController {

    @Autowired
    private PostRepository postRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private CommentRepository commentRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    /**
     * Lấy danh sách bài viết có phân trang và tìm kiếm
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status) {
        
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<Post> postsPage;
            
            // Nếu có từ khóa tìm kiếm và trạng thái
            if (keyword != null && !keyword.isEmpty() && status != null && !status.isEmpty()) {
                postsPage = postRepository.findByTitleContainingAndStatus(keyword, status, pageable);
            } 
            // Nếu chỉ có từ khóa tìm kiếm
            else if (keyword != null && !keyword.isEmpty()) {
                postsPage = postRepository.findByTitleContaining(keyword, pageable);
            }
            // Nếu chỉ có trạng thái
            else if (status != null && !status.isEmpty()) {
                postsPage = postRepository.findByStatus(status, pageable);
            }
            // Nếu không có điều kiện lọc
            else {
                postsPage = postRepository.findAll(pageable);
            }
            
            List<Post> posts = postsPage.getContent();
            List<Map<String, Object>> postResponses = new ArrayList<>();
            
            for (Post post : posts) {
                Map<String, Object> postResponse = convertToPostResponse(post);
                postResponses.add(postResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("posts", postResponses);
            response.put("currentPage", postsPage.getNumber());
            response.put("totalItems", postsPage.getTotalElements());
            response.put("totalPages", postsPage.getTotalPages());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách bài viết thành công",
                    response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy danh sách bài viết: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Lấy thông tin chi tiết của một bài viết
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPostById(@PathVariable Long id) {
        try {
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
            
            Map<String, Object> postResponse = convertToPostResponse(post);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy thông tin bài viết thành công",
                    postResponse
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy thông tin bài viết: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Cập nhật bài viết
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePost(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("status") String status,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
        
        try {
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
            
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            
            post.setTitle(title);
            post.setContent(content);
            post.setCategory(category);
            post.setStatus(status);
            post.setUpdatedAt(LocalDateTime.now());
            
            // Xử lý thumbnail nếu có
            if (thumbnail != null && !thumbnail.isEmpty()) {
                String thumbnailPath = fileStorageService.storeFile(thumbnail, "posts");
                post.setThumbnail(thumbnailPath);
            }
            
            Post updatedPost = postRepository.save(post);
            Map<String, Object> postResponse = convertToPostResponse(updatedPost);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Cập nhật bài viết thành công",
                    postResponse
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi cập nhật bài viết: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Xóa bài viết
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePost(@PathVariable Long id) {
        try {
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
            
            // Xóa tất cả bình luận của bài viết trước
            commentRepository.deleteByPostId(id);
            
            // Sau đó xóa bài viết
            postRepository.delete(post);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Xóa bài viết thành công",
                    null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi xóa bài viết: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Cập nhật trạng thái bài viết
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updatePostStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        try {
            String status = request.get("status");
            
            if (status == null || status.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        HttpStatus.BAD_REQUEST.value(),
                        "Trạng thái không được để trống",
                        null
                ));
            }
            
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
            
            post.setStatus(status);
            post.setUpdatedAt(LocalDateTime.now());
            
            // Nếu duyệt bài viết, cập nhật published = true
            if ("PUBLISHED".equals(status)) {
                post.setPublished(true);
            } else if ("REJECTED".equals(status)) {
                post.setPublished(false);
            }
            
            Post updatedPost = postRepository.save(post);
            Map<String, Object> postResponse = convertToPostResponse(updatedPost);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Cập nhật trạng thái bài viết thành công",
                    postResponse
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi cập nhật trạng thái bài viết: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Lấy danh sách bài viết đang chờ duyệt
     */
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPendingPosts() {
        try {
            List<Post> pendingPosts = postRepository.findByStatus("PENDING");
            List<Map<String, Object>> postResponses = new ArrayList<>();
            
            for (Post post : pendingPosts) {
                Map<String, Object> postResponse = convertToPostResponse(post);
                postResponses.add(postResponse);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("posts", postResponses);
            response.put("total", pendingPosts.size());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách bài viết chờ duyệt thành công",
                    response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy danh sách bài viết chờ duyệt: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Từ chối bài viết
     */
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectPost(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        try {
            String reason = request.get("reason");
            
            if (reason == null || reason.isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(
                        HttpStatus.BAD_REQUEST.value(),
                        "Lý do từ chối không được để trống",
                        null
                ));
            }
            
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết với ID: " + id));
            
            post.setStatus("REJECTED");
            post.setPublished(false);
            post.setRejectReason(reason);
            post.setUpdatedAt(LocalDateTime.now());
            
            Post updatedPost = postRepository.save(post);
            Map<String, Object> postResponse = convertToPostResponse(updatedPost);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Từ chối bài viết thành công",
                    postResponse
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi từ chối bài viết: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Tạo bài viết mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("status") String status,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
    
    try {
        // Tạo bài viết mới
        Post post = new Post();
        post.setTitle(title);
        post.setContent(content);
        
        // Lấy thông tin danh mục
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        post.setCategory(category);
        
        // Xử lý trạng thái bài viết
        post.setStatus(status);
        post.setPublished("PUBLISHED".equals(status));
        
        // Thời gian tạo và cập nhật
        LocalDateTime now = LocalDateTime.now();
        post.setCreatedAt(now);
        post.setUpdatedAt(now);
        
        // Lấy thông tin admin đang đăng nhập từ SecurityContext
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));
        post.setUser(user);
        
        // Xử lý thumbnail nếu có
        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailPath = fileStorageService.storeFile(thumbnail, "posts");
            post.setThumbnail(thumbnailPath);
        }
        
        // Lưu bài viết
        Post savedPost = postRepository.save(post);
        
        // Chuyển đổi và trả về response
        Map<String, Object> postResponse = convertToPostResponse(savedPost);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Tạo bài viết thành công",
                postResponse
        ));
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(
                        HttpStatus.INTERNAL_SERVER_ERROR.value(),
                        "Lỗi khi tạo bài viết: " + e.getMessage(),
                        null
                ));
    }
}
    
    /**
     * Chuyển đổi Post sang Map response
     */
    private Map<String, Object> convertToPostResponse(Post post) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", post.getId());
        response.put("title", post.getTitle());
        response.put("content", post.getContent());
        response.put("thumbnailUrl", post.getThumbnail());
        response.put("createdAt", post.getCreatedAt());
        response.put("updatedAt", post.getUpdatedAt());
        response.put("status", post.getStatus());
        response.put("published", post.isPublished());
        
        // Thêm thông tin tác giả
        Map<String, Object> author = new HashMap<>();
        author.put("id", post.getUser().getId());
        author.put("email", post.getUser().getEmail());
        author.put("fullName", post.getUser().getFullName());
        author.put("avatarUrl", post.getUser().getAvatarUrl());
        response.put("author", author);
        
        // Thêm thông tin danh mục
        Map<String, Object> category = new HashMap<>();
        category.put("id", post.getCategory().getId());
        category.put("name", post.getCategory().getName());
        response.put("category", category);
        
        // Thêm số lượng comment
        long commentCount = commentRepository.countByPostId(post.getId());
        response.put("commentCount", commentCount);
        
        // Thêm lý do từ chối nếu có
        response.put("rejectReason", post.getRejectReason());
        
        return response;
    }
}