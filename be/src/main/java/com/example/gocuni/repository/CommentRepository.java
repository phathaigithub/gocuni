package com.example.gocuni.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.gocuni.model.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByPostId(Long postId, Pageable pageable);
    
    // Thêm phương thức cho phản hồi bình luận
    Page<Comment> findByPostIdAndParentCommentIsNull(Long postId, Pageable pageable);
    
    List<Comment> findByParentCommentId(Long parentId);
    
    // Đếm số lượng bình luận của một bài viết
    long countByPostId(Long postId);
    
    // Thêm phương thức này để xóa tất cả bình luận của một bài viết
    @Transactional
    void deleteByPostId(Long postId);
}