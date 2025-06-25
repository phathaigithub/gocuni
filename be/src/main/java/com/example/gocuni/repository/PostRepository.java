package com.example.gocuni.repository;

import java.util.List;
import java.util.Optional;

import com.example.gocuni.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.gocuni.model.Post;

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
}