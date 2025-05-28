package com.example.gocuni.model;

import com.example.gocuni.model.Comment;
import com.example.gocuni.model.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "comment_likes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentLike {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "comment_id")
    private Comment comment;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}