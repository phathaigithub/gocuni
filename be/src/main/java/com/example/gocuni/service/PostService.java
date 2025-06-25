package com.example.gocuni.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.example.gocuni.model.Post;
import com.example.gocuni.repository.PostRepository;

@Service
public class PostService {

    @Autowired
    private PostRepository postRepository;

    /**
     * Lấy danh sách bài viết theo danh mục với phân trang
     */
    public Page<Post> getPostsByCategoryId(Long categoryId, Pageable pageable) {
        // Lấy các bài viết đã publish theo categoryId
        Page<Post> posts = postRepository.findByCategoryIdAndPublishedTrue(categoryId, pageable);
        
        return posts;
    }
}