package com.example.gocuni.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.gocuni.model.CommentMedia;

@Repository
public interface CommentMediaRepository extends JpaRepository<CommentMedia, Long> {
    List<CommentMedia> findByCommentId(Long commentId);
    void deleteByCommentId(Long commentId);
}