package com.example.gocuni.dto;

import java.time.LocalDateTime;
import java.util.List;

import com.example.gocuni.model.Post;

import lombok.Data;

@Data
public class PostResponse {
    private Long id;
    private String title;
    private String content;
    private String thumbnail;
    private Long userId;
    private String authorName;
    private String authorAvatar;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private int viewCount;
    private int commentCount;
    private List<Post> postsByUserId;
    private boolean published;
    
}