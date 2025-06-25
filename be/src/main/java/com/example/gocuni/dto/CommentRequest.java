package com.example.gocuni.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class CommentRequest {
    @NotBlank(message = "Nội dung bình luận không được để trống")
    private String content;
    
    @NotNull(message = "ID bài viết không được để trống")
    private Long postId;
    
    // ID của bình luận cha (nếu đây là phản hồi cho một bình luận)
    private Long parentId;
    
    // Danh sách các đường dẫn media (lưu ở dạng Base64 String hoặc đường dẫn tạm thời)
    private List<CommentMediaDto> media;
}