package com.example.gocuni.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.dto.CategoryRequest;
import com.example.gocuni.model.Category;
import com.example.gocuni.repository.CategoryRepository;
import com.example.gocuni.repository.PostRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminCategoryController {

    @Autowired
    private CategoryRepository categoryRepository;
    
    @Autowired
    private PostRepository postRepository;
    
    /**
     * Lấy danh sách danh mục có phân trang và tìm kiếm
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String keyword) {
        
        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
            
            Page<Category> categoriesPage;
            
            // Tìm kiếm theo tên nếu có từ khóa
            if (keyword != null && !keyword.isEmpty()) {
                categoriesPage = categoryRepository.findByNameContainingIgnoreCase(keyword, pageable);
            } else {
                categoriesPage = categoryRepository.findAll(pageable);
            }
            
            List<Map<String, Object>> categories = categoriesPage.getContent().stream()
                    .map(category -> {
                        Map<String, Object> categoryMap = new HashMap<>();
                        categoryMap.put("id", category.getId());
                        categoryMap.put("name", category.getName());
                        categoryMap.put("description", category.getDescription());
                        
                        // Đếm số lượng bài viết thuộc danh mục
                        long postCount = postRepository.countByCategoryId(category.getId());
                        categoryMap.put("postCount", postCount);
                        
                        return categoryMap;
                    })
                    .collect(Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("categories", categories);
            response.put("currentPage", categoriesPage.getNumber());
            response.put("totalItems", categoriesPage.getTotalElements());
            response.put("totalPages", categoriesPage.getTotalPages());
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách danh mục thành công",
                    response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy danh sách danh mục: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Lấy thông tin chi tiết của một danh mục
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCategoryById(@PathVariable Long id) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            
            Map<String, Object> categoryData = new HashMap<>();
            categoryData.put("id", category.getId());
            categoryData.put("name", category.getName());
            categoryData.put("description", category.getDescription());
            
            // Đếm số lượng bài viết thuộc danh mục
            long postCount = postRepository.countByCategoryId(category.getId());
            categoryData.put("postCount", postCount);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy thông tin danh mục thành công",
                    categoryData
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy thông tin danh mục: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Tạo danh mục mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Category>> createCategory(@Valid @RequestBody CategoryRequest categoryRequest) {
        try {
            // Kiểm tra tên danh mục đã tồn tại chưa
            if (categoryRepository.existsByName(categoryRequest.getName())) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                HttpStatus.BAD_REQUEST.value(),
                                "Tên danh mục đã tồn tại",
                                null
                        ));
            }
            
            Category category = new Category();
            category.setName(categoryRequest.getName());
            category.setDescription(categoryRequest.getDescription());
            
            Category savedCategory = categoryRepository.save(category);
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(
                            HttpStatus.CREATED.value(),
                            "Tạo danh mục thành công",
                            savedCategory
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi tạo danh mục: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Cập nhật danh mục
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest categoryRequest) {
        
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            
            // Kiểm tra tên danh mục đã tồn tại chưa (trừ danh mục hiện tại)
            if (!category.getName().equals(categoryRequest.getName()) && 
                categoryRepository.existsByName(categoryRequest.getName())) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                HttpStatus.BAD_REQUEST.value(),
                                "Tên danh mục đã tồn tại",
                                null
                        ));
            }
            
            category.setName(categoryRequest.getName());
            category.setDescription(categoryRequest.getDescription());
            
            Category updatedCategory = categoryRepository.save(category);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Cập nhật danh mục thành công",
                    updatedCategory
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi cập nhật danh mục: " + e.getMessage(),
                            null
                    ));
        }
    }
    
    /**
     * Xóa danh mục
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCategory(@PathVariable Long id) {
        try {
            Category category = categoryRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục"));
            
            // Kiểm tra xem danh mục có bài viết không
            long postCount = postRepository.countByCategoryId(id);
            if (postCount > 0) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse<>(
                                HttpStatus.BAD_REQUEST.value(),
                                "Không thể xóa danh mục vì có " + postCount + " bài viết thuộc danh mục này",
                                null
                        ));
            }
            
            categoryRepository.delete(category);
            
            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Xóa danh mục thành công",
                    null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi xóa danh mục: " + e.getMessage(),
                            null
                    ));
        }
    }
}