package com.example.gocuni.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.example.gocuni.model.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    // Tìm bình luận theo nội dung có phân trang
    Page<Comment> findByContentContainingIgnoreCase(String content, Pageable pageable);

    // Tìm bình luận theo bài viết có phân trang
    Page<Comment> findByPostId(Long postId, Pageable pageable);
    
    // Thêm phương thức cho phản hồi bình luận
    Page<Comment> findByPostIdAndParentCommentIsNull(Long postId, Pageable pageable);
    
    List<Comment> findByParentCommentId(Long parentId);
    
    // Đếm số lượng bình luận của một bài viết
    long countByPostId(Long postId);
    
    //phương thức này để xóa tất cả bình luận của một bài viết
    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.post.id = ?1")
    void deleteByPostId(Long postId);
    
    // Thêm phương thức để tải eagerly các replies
    @Query("SELECT c FROM Comment c LEFT JOIN FETCH c.replies WHERE c.id = :id")
    Optional<Comment> findCommentWithRepliesById(@Param("id") Long id);
}