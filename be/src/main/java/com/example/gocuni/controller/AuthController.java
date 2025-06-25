package com.example.gocuni.controller;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.gocuni.dto.ChangePasswordRequest;
import com.example.gocuni.dto.ForgotPasswordRequest;
import com.example.gocuni.dto.JwtResponse;
import com.example.gocuni.dto.LoginRequest;
import com.example.gocuni.dto.RefreshTokenRequest;
import com.example.gocuni.dto.ResetPasswordRequest;
import com.example.gocuni.dto.SignupRequest;
import com.example.gocuni.exception.TokenRefreshException;
import com.example.gocuni.model.RefreshToken;
import com.example.gocuni.model.Role;
import com.example.gocuni.model.User;
import com.example.gocuni.repository.RoleRepository;
import com.example.gocuni.repository.UserRepository;
import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.security.JwtUtils;
import com.example.gocuni.service.EmailService;
import com.example.gocuni.service.RefreshTokenService;
import com.example.gocuni.service.ResetPasswordService;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private ResetPasswordService resetPasswordService;
    
    @Autowired
    private RefreshTokenService refreshTokenService;
    
    @Value("${app.url}")
    private String appUrl;
    
    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<JwtResponse>> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateToken(authentication);
        
        org.springframework.security.core.userdetails.User userDetails = 
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();
        
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        
        // Tạo refresh token mới
        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getId());
        
        JwtResponse jwtResponse = new JwtResponse(
            jwt, 
            user.getId(), 
            user.getEmail(),
            user.getFullName(),
            user.getAvatarUrl(),
            user.getRoleName(),
            refreshToken.getToken() 
        );
        
        ApiResponse<JwtResponse> response = new ApiResponse<>(
            HttpStatus.OK.value(),
            "Đăng nhập thành công",
            jwtResponse
        );
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> registerUser(@Valid @RequestBody SignupRequest signupRequest) {
        if (userRepository.existsByEmail(signupRequest.getEmail())) {
            ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Email đã được sử dụng!",
                null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Tạo user với email và password
        User user = new User();
        user.setEmail(signupRequest.getEmail());
        user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
        
        // Lấy phần tên trước dấu @ trong email làm tên mặc định
        String email = signupRequest.getEmail();
        String defaultName = email.substring(0, email.indexOf('@'));
        user.setFullName(defaultName);
        
        // Tìm role ROLE_USER
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Role ROLE_USER không tìm thấy"));
        
        user.setRole(userRole);
        user.setEnable(true);
        
        userRepository.save(user);
        
        ApiResponse<String> response = new ApiResponse<>(
            HttpStatus.OK.value(),
            "Đăng ký thành công!",
            user.getEmail()
        );
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        
        // Lấy thông tin xác thực từ SecurityContext thay vì sử dụng parameter
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication instanceof AnonymousAuthenticationToken) {
            ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.UNAUTHORIZED.value(),
                "Người dùng chưa đăng nhập",
                null
            );
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
        
        // Lấy email của người dùng đang đăng nhập
        String userEmail = authentication.getName();
        
        // Tìm user trong database
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng"));
        
        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Mật khẩu cũ không đúng",
                null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        // Cập nhật mật khẩu mới
        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
        
        ApiResponse<String> response = new ApiResponse<>(
            HttpStatus.OK.value(),
            "Đổi mật khẩu thành công",
            userEmail
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * API đăng xuất
     * Phía server chỉ cần xác nhận đăng xuất thành công
     * Phía client sẽ xóa token và thông tin người dùng
     */
    @PostMapping("/signout")
    public ResponseEntity<ApiResponse<String>> signOut() {
        // Lấy người dùng hiện tại
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication != null && authentication.isAuthenticated() && 
            !(authentication instanceof AnonymousAuthenticationToken)) {
            String userEmail = authentication.getName();
            User user = userRepository.findByEmail(userEmail).orElse(null);
            
            if (user != null) {
                // Xóa tất cả refresh token của người dùng
                refreshTokenService.deleteByUserId(user.getId());
            }
        }
        
        // Xóa thông tin xác thực khỏi SecurityContext
        SecurityContextHolder.clearContext();
        
        ApiResponse<String> response = new ApiResponse<>(
            HttpStatus.OK.value(),
            "Đăng xuất thành công",
            null
        );
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * API quên mật khẩu - gửi email chứa link đặt lại mật khẩu
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        
        if (userOpt.isEmpty()) {
            // Không thông báo cụ thể là email không tồn tại vì lý do bảo mật
            // Trả về 200 OK để tránh leak thông tin người dùng
            ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Nếu email tồn tại trong hệ thống, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
                null
            );
            return ResponseEntity.ok(response);
        }
        
        User user = userOpt.get();
        String token = resetPasswordService.createResetPasswordToken(user);
        
        try {
            emailService.sendResetPasswordEmail(user.getEmail(), token, appUrl);
            
            ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn",
                null
            );
            return ResponseEntity.ok(response);
        } catch (MessagingException e) {
            ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "Không thể gửi email. Vui lòng thử lại sau",
                null
            );
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
    
    /**
     * API đặt lại mật khẩu - xác thực token và đặt mật khẩu mới
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        Optional<User> userOpt = resetPasswordService.validateResetPasswordToken(request.getToken());
        
        if (userOpt.isEmpty()) {
            ApiResponse<String> response = new ApiResponse<>(
                HttpStatus.BAD_REQUEST.value(),
                "Token không hợp lệ hoặc đã hết hạn",
                null
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        
        User user = userOpt.get();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        
        // Xóa token sau khi đã sử dụng
        resetPasswordService.deleteToken(request.getToken());
        
        ApiResponse<String> response = new ApiResponse<>(
            HttpStatus.OK.value(),
            "Đặt lại mật khẩu thành công",
            null
        );
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/refresh-token")
    public ResponseEntity<ApiResponse<JwtResponse>> refreshToken(@RequestBody RefreshTokenRequest request) {
        try {
            // Kiểm tra refresh token có hợp lệ không
            RefreshToken refreshToken = refreshTokenService.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new TokenRefreshException("Refresh token không tồn tại"));

            // Kiểm tra token đã hết hạn chưa
            if (refreshToken.isExpired()) {
                refreshTokenService.deleteByToken(refreshToken.getToken());
                throw new TokenRefreshException("Refresh token đã hết hạn. Vui lòng đăng nhập lại");
            }

            // Lấy user từ refresh token
            User user = refreshToken.getUser();
            
            // Tạo access token mới
            String newAccessToken = jwtUtils.generateTokenFromUser(user);
            
            JwtResponse response = new JwtResponse(
                newAccessToken,
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getAvatarUrl(),
                user.getRoleName()
            );
            
            // Tùy chọn: tạo refresh token mới (rotation) để tăng cường bảo mật
            // String newRefreshToken = refreshTokenService.createRefreshToken(user.getId()).getToken();
            // response.setRefreshToken(newRefreshToken);
            
            return ResponseEntity.ok(new ApiResponse<>(
                HttpStatus.OK.value(),
                "Token đã được làm mới",
                response
            ));
        } catch (TokenRefreshException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(
                new ApiResponse<>(
                    HttpStatus.UNAUTHORIZED.value(),
                    e.getMessage(),
                    null
                )
            );
        }
    }
}
