package com.example.gocuni.controller;

import com.example.gocuni.dto.UserProfileUpdateRequest;
import com.example.gocuni.model.User;
import com.example.gocuni.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getCurrentUserProfile() {
        // Lấy thông tin người dùng đã xác thực
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Không trả về password
        user.setPassword(null);
        
        return ResponseEntity.ok(user);
    }

    @PutMapping("/edit")
    public ResponseEntity<?> updateUserProfile(@RequestBody UserProfileUpdateRequest updateRequest) {
        // Lấy thông tin người dùng đã xác thực
        UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        
        // Cập nhật thông tin
        if (updateRequest.getFullName() != null) {
            user.setFullName(updateRequest.getFullName());
        }
        
        if (updateRequest.getGender() != null) {
            user.setGender(updateRequest.getGender());
        }
        
        if (updateRequest.getAvatarUrl() != null) {
            user.setAvatarUrl(updateRequest.getAvatarUrl());
        }
        
        if (updateRequest.getDateOfBirth() != null) {
            user.setDateOfBirth(updateRequest.getDateOfBirth());
        }
        
        // Lưu thông tin đã cập nhật
        userRepository.save(user);
        
        // Không trả về password
        user.setPassword(null);
        
        return ResponseEntity.ok(user);
    }
}