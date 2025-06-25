package com.example.gocuni.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.gocuni.model.User;
import com.example.gocuni.repository.UserRepository;
import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.service.FileStorageService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*", maxAge = 3600)
public class UserController {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private FileStorageService fileStorageService;

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
    public ResponseEntity<?> updateUserProfile(
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirthStr,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar) {
        
        try {
            // Lấy thông tin người dùng đã xác thực
            UserDetails userDetails = (UserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
            User user = userRepository.findByEmail(userDetails.getUsername())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
            
            // Cập nhật thông tin
            if (fullName != null) {
                user.setFullName(fullName);
            }
            
            if (gender != null) {
                user.setGender(gender);
            }
            
            if (dateOfBirthStr != null) {
                LocalDate dateOfBirth = LocalDate.parse(dateOfBirthStr);
                user.setDateOfBirth(dateOfBirth);
            }
            
            // Xử lý và lưu avatar nếu được cung cấp
            if (avatar != null && !avatar.isEmpty()) {
                String avatarPath = fileStorageService.storeFile(avatar, "avatars");
                user.setAvatarUrl(avatarPath);
            }
            
            // Lưu thông tin đã cập nhật
            userRepository.save(user);
            
            // Không trả về password
            user.setPassword(null);
            
            return ResponseEntity.ok(new ApiResponse<>(
                HttpStatus.OK.value(),
                "Cập nhật thông tin người dùng thành công",
                user
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi cập nhật thông tin người dùng: " + e.getMessage(),
                    null
                ));
        }
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            
            // Loại bỏ mật khẩu trước khi trả về
            List<User> sanitizedUsers = users.stream()
                .map(user -> {
                    user.setPassword(null);
                    return user;
                })
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(new ApiResponse<>(
                HttpStatus.OK.value(),
                "Lấy danh sách người dùng thành công",
                sanitizedUsers
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse<>(
                    HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Lỗi khi lấy danh sách người dùng: " + e.getMessage(),
                    null
                ));
        }
    }
}