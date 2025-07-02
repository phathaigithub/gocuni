package com.example.gocuni.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.gocuni.model.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    boolean existsByName(String name);
    Optional<Category> findByName(String name);

    Optional<Category> findByNameContainingIgnoreCase(String name);

    // Tìm danh mục theo tên có phân trang
    Page<Category> findByNameContainingIgnoreCase(String name, Pageable pageable);
}