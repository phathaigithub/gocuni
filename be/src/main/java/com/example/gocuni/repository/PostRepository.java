package com.example.gocuni.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.gocuni.model.Post;
import com.example.gocuni.model.User;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    
    Page<Post> findByCategoryIdAndPublishedTrue(Long categoryId, Pageable pageable);

    Optional<Post> findByTitle(String s);

    Page<Post> findByPublishedTrue(Pageable pageable);

    // Thêm annotation @Query để định nghĩa query tìm kiếm
    @Query("SELECT p FROM Post p WHERE (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) AND p.published = true")
    Page<Post> searchPosts(@Param("keyword") String keyword, Pageable pageable);

    List<Post> findTop5ByOrderByViewCountDesc();

    List<Post> findByUserIdAndPublishedTrue(Long id);

    List<Post> findByUserId(Long userId);

    List<Post> findByUser(User user);

    // Tìm bài viết theo trạng thái
    List<Post> findByStatus(String status);

    // Tìm bài viết theo trạng thái với phân trang
    Page<Post> findByStatus(String status, Pageable pageable);

    // Tìm bài viết theo tiêu đề và trạng thái
    Page<Post> findByTitleContainingAndStatus(String title, String status, Pageable pageable);

    // Tìm bài viết theo tiêu đề
    Page<Post> findByTitleContaining(String title, Pageable pageable);

    // Thêm phương thức đếm số lượng bài viết theo danh mục
    // Đếm số lượng bài viết theo category_id
    long countByCategoryId(Long categoryId);
}