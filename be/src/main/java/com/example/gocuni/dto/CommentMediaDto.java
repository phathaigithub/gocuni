package com.example.gocuni.dto;

import lombok.Data;

@Data
public class CommentMediaDto {
    private String mediaContent; // Base64 encoded string hoặc đường dẫn tạm thời
    private String mediaType;    // "image" hoặc "video"
    private String fileName;     // Tên file gốc
}