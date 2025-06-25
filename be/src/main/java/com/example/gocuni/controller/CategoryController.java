package com.example.gocuni.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.gocuni.dto.CategoryRequest;
import com.example.gocuni.model.Category;
import com.example.gocuni.model.Post;
import com.example.gocuni.repository.CategoryRepository;
import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.service.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {
    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private PostService postService;
    
    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        List<Category> categories = categoryRepository.findAll();
        
        // Loại bỏ danh sách bài viết để tránh vòng lặp vô hạn
        categories.forEach(category -> category.setPosts(null));
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Lấy danh sách danh mục thành công",
            categories
        ));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategoryById(@PathVariable Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
                
        // Loại bỏ danh sách bài viết để tránh vòng lặp vô hạn
        category.setPosts(null);
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Lấy danh mục thành công",
            category
        ));
    }
    
    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        if (categoryRepository.existsByName(categoryRequest.getName())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Tên danh mục đã tồn tại",
                null
            ));
        }
        
        Category category = new Category();
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        
        Category savedCategory = categoryRepository.save(category);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(
            HttpStatus.CREATED.value(),
            "Tạo danh mục thành công",
            savedCategory
        ));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Long id, 
            @Valid @RequestBody CategoryRequest categoryRequest) {
        
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
        
        // Kiểm tra xem tên danh mục mới có trùng với danh mục khác không
        if (!category.getName().equals(categoryRequest.getName()) && 
            categoryRepository.existsByName(categoryRequest.getName())) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Tên danh mục đã tồn tại",
                null
            ));
        }
        
        category.setName(categoryRequest.getName());
        category.setDescription(categoryRequest.getDescription());
        
        Category updatedCategory = categoryRepository.save(category);
        updatedCategory.setPosts(null);
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Cập nhật danh mục thành công",
            updatedCategory
        ));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        categoryRepository.deleteById(id);
        
        return ResponseEntity.ok(new ApiResponse<>(
            HttpStatus.OK.value(),
            "Xóa danh mục thành công",
            null
        ));
    }
    
    /**
     * Lấy danh sách bài viết theo danh mục với phân trang
     */
    @GetMapping("/{id}/posts")
    public ResponseEntity<ApiResponse<Page<Post>>> getPostsByCategory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt,desc") String[] sort) {
        
        try {
            // Kiểm tra danh mục tồn tại
            if (!categoryRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    new ApiResponse<>(
                        HttpStatus.NOT_FOUND.value(),
                        "Không tìm thấy danh mục",
                        null
                    )
                );
            }
            
            // Tạo Pageable từ các tham số
            String sortField = sort[0].split(",")[0];
            String sortDirection = sort.length > 1 ? sort[1] : sort[0].split(",")[1];
            
            Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") 
                ? Sort.Direction.ASC 
                : Sort.Direction.DESC;
            
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));
            
            // Lấy danh sách bài viết của danh mục
            Page<Post> posts = postService.getPostsByCategoryId(id, pageable);

            
            return ResponseEntity.ok(
                new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách bài viết theo danh mục thành công",
                    posts
                )
            );
        } catch (Exception e) {
            e.printStackTrace(); // In stack trace để debug
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi lấy bài viết theo danh mục: " + e.getMessage(),
                    null
                )
            );
        }
    }
}