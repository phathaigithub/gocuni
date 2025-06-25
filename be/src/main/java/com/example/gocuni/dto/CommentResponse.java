package com.example.gocuni.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class CommentResponse {
    private Long id;
    private String content;
    private Long userId;
    private String userName;
    private String userAvatar;
    private Long postId;
    private LocalDateTime createdAt;
    private int likeCount;
    private boolean userHasLiked;
    private List<CommentMediaResponse> media;
    private Long parentId;
    private List<CommentResponse> replies;
}