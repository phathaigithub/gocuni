package com.example.gocuni.model;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "comment_media")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentMedia {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String mediaUrl;
    
    @Column(nullable = false)
    private String mediaType; // "image" hoặc "video"
    
    @ManyToOne
    @JoinColumn(name = "comment_id")
    private Comment comment;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
}