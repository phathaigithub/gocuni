package com.example.gocuni.controller;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.gocuni.dto.PostResponse;
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
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class PostController {
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
    
    @GetMapping
    public ResponseEntity<ApiResponse<Page<PostResponse>>> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy, // Thay đổi mặc định thành id
            @RequestParam(defaultValue = "desc") String direction) {
        
        try {
            System.out.println("Request parameters: page=" + page + ", size=" + size + ", sortBy=" + sortBy + ", direction=" + direction);
            
            Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable;
            
            // Thêm kiểm tra đặc biệt cho trường createdAt
            if ("createdAt".equals(sortBy)) {
                // Nếu sắp xếp theo createdAt, kiểm tra nếu dữ liệu có thể là null
                // Có thể sử dụng OrderBy trong Pageable để xử lý null first/last
                // hoặc sử dụng trường khác làm mặc định
                pageable = PageRequest.of(page, size, Sort.by(sortDirection, "id"));
                System.out.println("Sorting by id instead of createdAt due to potential null values");
            } else {
                try {
                    Post.class.getDeclaredField(sortBy);
                    pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
                } catch (NoSuchFieldException e) {
                    System.out.println("Field " + sortBy + " không tồn tại trong Post entity, sử dụng id");
                    pageable = PageRequest.of(page, size, Sort.by(sortDirection, "id"));
                }
            }
            
            // Thêm try-catch riêng cho database operation
            try {
                Page<Post> postsPage = postRepository.findByPublishedTrue(pageable);
                System.out.println("Found " + postsPage.getTotalElements() + " posts, total pages: " + postsPage.getTotalPages());
                
                Page<PostResponse> postResponses = postsPage.map(this::convertToPostResponse);
                
                return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách bài viết thành công",
                    postResponses
                ));
            } catch (Exception dbException) {
                System.err.println("Database error: " + dbException.getMessage());
                dbException.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi truy vấn cơ sở dữ liệu: " + dbException.getMessage(),
                    null
                ));
            }
        } catch (Exception e) {
            System.err.println("Error in getAllPosts: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Lỗi khi lấy danh sách bài viết: " + e.getMessage(),
                null
            ));
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> getPostById(@PathVariable Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
                
        // Tăng số lượt xem
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
        
        PostResponse postResponse = convertToPostResponse(post);
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Lấy bài viết thành công",
            postResponse
        ));
    }
    
    @PostMapping("/add")
    public ResponseEntity<ApiResponse<PostResponse>> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "published", defaultValue = "true") boolean published,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {
        
        try {
            // Log thông tin debug
            System.out.println("==== DEBUG CREATE POST ====");
            System.out.println("title: " + title);
            System.out.println("content length: " + content.length());
            System.out.println("categoryId: " + categoryId);
            System.out.println("published: " + published);
            System.out.println("thumbnail is null: " + (thumbnail == null));
            if (thumbnail != null) {
                System.out.println("thumbnail name: " + thumbnail.getOriginalFilename());
                System.out.println("thumbnail size: " + thumbnail.getSize());
                System.out.println("thumbnail content type: " + thumbnail.getContentType());
            }
            
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            
            Post post = new Post();
            post.setTitle(title);
            post.setContent(content);
            post.setUser(user);
            post.setCategory(category);
            post.setPublished(published);
            
            // Process and save thumbnail if provided
            if (thumbnail != null && !thumbnail.isEmpty()) {
                try {
                    String thumbnailPath = fileStorageService.storeFile(thumbnail, "posts");
                    System.out.println("Thumbnail path returned: " + thumbnailPath);
                    post.setThumbnail(thumbnailPath);
                } catch (Exception e) {
                    System.err.println("Error storing thumbnail: " + e.getMessage());
                    e.printStackTrace();
                }
            } else {
                System.out.println("No thumbnail provided or thumbnail is empty");
            }
            
            Post savedPost = postRepository.save(post);
            PostResponse response = convertToPostResponse(savedPost);
            System.out.println("Response thumbnail: " + response.getThumbnail());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
                HttpStatus.CREATED.value(),
                "Tạo bài viết thành công",
                response
            ));
        } catch (Exception e) {
            System.err.println("Error in createPost: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse<>(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Lỗi khi tạo bài viết: " + e.getMessage(),
                null
            ));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostResponse>> updatePost(
            @PathVariable Long id,
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "published", defaultValue = "true") boolean published,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail) {

        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Post post = postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));

        // Kiểm tra quyền chỉnh sửa bài viết
        if (!post.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(
                HttpStatus.FORBIDDEN.value(),
                "Bạn không có quyền chỉnh sửa bài viết này",
                null
            ));
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));

        post.setTitle(title);
        post.setContent(content);
        post.setCategory(category);
        post.setPublished(published);

        // Process and save new thumbnail if provided
        if (thumbnail != null && !thumbnail.isEmpty()) {
            String thumbnailPath = fileStorageService.storeFile(thumbnail, "posts");
            post.setThumbnail(thumbnailPath);
        }

        Post updatedPost = postRepository.save(post);

        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Cập nhật bài viết thành công",
            convertToPostResponse(updatedPost)
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deletePost(@PathVariable Long id) {
        try {
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            Post post = postRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
            
            // Kiểm tra quyền xóa bài viết
            if (!post.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(
                    HttpStatus.FORBIDDEN.value(),
                    "Bạn không có quyền xóa bài viết này",
                    null
                ));
            }
            
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
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Đã xảy ra lỗi khi xóa bài viết: " + e.getMessage(),
                    null
                )
            );
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<PostResponse>>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Post> postsPage;
        
        if (categoryId != null) {
            postsPage = postRepository.findByCategoryIdAndPublishedTrue(categoryId, pageable);
        } else {
            postsPage = postRepository.searchPosts(keyword, pageable);
        }
        
        Page<PostResponse> postResponses = postsPage.map(this::convertToPostResponse);
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Tìm kiếm bài viết thành công",
            postResponses
        ));
    }
    
    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<PostResponse>>> getPopularPosts() {
        List<Post> popularPosts = postRepository.findTop5ByOrderByViewCountDesc();
        List<PostResponse> postResponses = popularPosts.stream()
                .map(this::convertToPostResponse)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Lấy bài viết phổ biến thành công",
            postResponses
        ));
    }
    
    @GetMapping("/user")
public ResponseEntity<ApiResponse<List<PostResponse>>> getUserPosts() {
    try {
        // Thêm debug logs
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        System.out.println("Authentication: " + authentication);
        
        // Lấy email từ authentication
        String email = authentication.getName();
        
        // Kiểm tra nếu là anonymousUser
        if ("anonymousUser".equals(email)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiResponse<>(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
                    null
                )
            );
        }
        
        // Thêm kiểm tra email
        if (email == null || email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiResponse<>(
                    HttpStatus.UNAUTHORIZED.value(),
                    "Không thể xác định người dùng từ token",
                    null
                )
            );
        }
        
        // In ra log để debug
        System.out.println("Tìm user với email: " + email);
        
        // Tìm user bằng email, kèm kiểm tra kĩ hơn
        Optional<User> userOptional = userRepository.findByEmail(email);
        
        if (!userOptional.isPresent()) {
            System.out.println("Không tìm thấy user với email: " + email);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                new ApiResponse<>(
                    HttpStatus.NOT_FOUND.value(),
                    "Không tìm thấy người dùng với email: " + email,
                    null
                )
            );
        }
        
        User user = userOptional.get();
        System.out.println("Đã tìm thấy user: " + user.getId() + " - " + user.getFullName());
        
        // Lấy bài viết của người dùng
        List<Post> userPosts;
        try {
            userPosts = postRepository.findByUser(user);
            // Nếu không tìm thấy phương thức findByUser, thử phương thức khác
            if (userPosts == null) {
                userPosts = postRepository.findByUserId(user.getId());
            }
            System.out.println("Tìm thấy " + (userPosts != null ? userPosts.size() : 0) + " bài viết");
        } catch (Exception e) {
            System.err.println("Lỗi khi tìm bài viết: " + e.getMessage());
            e.printStackTrace();
            // Thử cách khác nếu cách đầu tiên lỗi
            userPosts = postRepository.findByUserId(user.getId());
            System.out.println("Tìm thấy " + (userPosts != null ? userPosts.size() : 0) + " bài viết (phương pháp 2)");
        }
        
        if (userPosts == null) {
            userPosts = new ArrayList<>();
        }
        
        // Map sang PostResponse
        List<PostResponse> postResponses = userPosts.stream()
                .map(post -> {
                    PostResponse response = new PostResponse();
                    response.setId(post.getId());
                    response.setTitle(post.getTitle());
                    response.setContent(post.getContent());
                    response.setCreatedAt(post.getCreatedAt());
                    
                    // Xử lý thumbnail
                    if (post.getThumbnail() != null && !post.getThumbnail().isEmpty()) {
                        if (!post.getThumbnail().startsWith("/")) {
                            response.setThumbnail("/" + post.getThumbnail());
                        } else {
                            response.setThumbnail(post.getThumbnail());
                        }
                    }
                    
                    // Set published flag
                    response.setPublished(post.isPublished());
                    

                    
                    // Thêm thông tin category nếu có
                    if (post.getCategory() != null) {
                        response.setCategoryId(post.getCategory().getId());
                        response.setCategoryName(post.getCategory().getName());
                    }
                    
                    // Thêm các thông tin khác nếu cần
                    response.setViewCount(post.getViewCount());
                    
                    return response;
                })
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Lấy bài viết của người dùng thành công",
            postResponses
        ));
    } catch (Exception e) {
        // Log lỗi chi tiết để debug
        System.err.println("Error in getUserPosts: " + e.getMessage());
        e.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
            new ApiResponse<>(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Lỗi khi lấy bài viết của người dùng: " + e.getMessage(),
                null
            )
        );
    }
}
    
    @GetMapping("/file/{folder}/{filename:.+}")
    public ResponseEntity<?> getFile(
            @PathVariable String folder,
            @PathVariable String filename) {
        try {
            // Ghi log để debug
            System.out.println("Requested file: /" + folder + "/" + filename);

            // Danh sách các đường dẫn có thể để tìm file
            Path[] possiblePaths = {
                Paths.get("upload", folder, filename),
                Paths.get("uploads", folder, filename),
                Paths.get(System.getProperty("user.dir"), "upload", folder, filename),
                Paths.get(System.getProperty("user.dir"), "uploads", folder, filename)
            };

            // Tìm file trong các đường dẫn có thể
            Resource resource = null;
            Path foundPath = null;
            
            for (Path path : possiblePaths) {
                try {
                    System.out.println("Checking path: " + path.toAbsolutePath());
                    if (Files.exists(path)) {
                        resource = new UrlResource(path.toUri());
                        foundPath = path;
                        System.out.println("File found at: " + path.toAbsolutePath());
                        break;
                    }
                } catch (Exception e) {
                    System.out.println("Error checking path: " + path.toAbsolutePath() + " - " + e.getMessage());
                }
            }

            // Nếu tìm thấy file và có thể đọc
            if (resource != null && resource.exists() && resource.isReadable()) {
                String contentType;
                String lowerFilename = filename.toLowerCase();
                if (lowerFilename.endsWith(".jpg") || lowerFilename.endsWith(".jpeg")) {
                    contentType = MediaType.IMAGE_JPEG_VALUE;
                } else if (lowerFilename.endsWith(".png")) {
                    contentType = MediaType.IMAGE_PNG_VALUE;
                } else if (lowerFilename.endsWith(".gif")) {
                    contentType = MediaType.IMAGE_GIF_VALUE;
                } else {
                    contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                System.out.println("File not found or not readable in any of the checked paths");
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("Error serving file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi khi phục vụ file: " + e.getMessage());
        }
    }
    
    private PostResponse convertToPostResponse(Post post) {
        PostResponse response = new PostResponse();
        response.setId(post.getId());
        response.setTitle(post.getTitle());
        response.setContent(post.getContent());
        
        // Xử lý đường dẫn thumbnail
        if (post.getThumbnail() != null && !post.getThumbnail().isEmpty()) {
            // Đảm bảo đường dẫn bắt đầu bằng /
            if (!post.getThumbnail().startsWith("/")) {
                response.setThumbnail("/" + post.getThumbnail());
            } else {
                response.setThumbnail(post.getThumbnail());
            }
        } else {
            response.setThumbnail(null);
        }
        
        response.setUserId(post.getUser().getId());
        response.setAuthorName(post.getUser().getFullName());
        
        // Xử lý đường dẫn avatar
        if (post.getUser().getAvatarUrl() != null && !post.getUser().getAvatarUrl().isEmpty()) {
            // Đảm bảo đường dẫn bắt đầu bằng /
            if (!post.getUser().getAvatarUrl().startsWith("/")) {
                response.setAuthorAvatar("/" + post.getUser().getAvatarUrl());
            } else {
                response.setAuthorAvatar(post.getUser().getAvatarUrl());
            }
        } else {
            response.setAuthorAvatar(null);
        }
        
        response.setCategoryId(post.getCategory().getId());
        response.setCategoryName(post.getCategory().getName());
        response.setCreatedAt(post.getCreatedAt());
        response.setViewCount(post.getViewCount());
        
        // Đếm số lượng comment
        long commentCount = commentRepository.findByPostId(post.getId(), Pageable.unpaged()).getTotalElements();
        response.setCommentCount((int) commentCount);
        
        return response;
    }
    
}