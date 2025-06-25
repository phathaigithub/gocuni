package com.example.gocuni.service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.gocuni.model.ResetPasswordToken;
import com.example.gocuni.model.User;
import com.example.gocuni.repository.ResetPasswordTokenRepository;
import com.example.gocuni.repository.UserRepository;

@Service
public class ResetPasswordService {

    private static final int EXPIRATION_MINUTES = 30;
    
    @Autowired
    private ResetPasswordTokenRepository resetPasswordTokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    public String createResetPasswordToken(User user) {
        // Xóa token cũ nếu có
        resetPasswordTokenRepository.deleteByUser(user);
        
        // Tạo token mới
        String token = UUID.randomUUID().toString();
        ResetPasswordToken resetPasswordToken = new ResetPasswordToken();
        resetPasswordToken.setToken(token);
        resetPasswordToken.setUser(user);
        resetPasswordToken.setExpiryDate(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));
        
        resetPasswordTokenRepository.save(resetPasswordToken);
        
        return token;
    }
    
    public Optional<User> validateResetPasswordToken(String token) {
        Optional<ResetPasswordToken> resetPasswordTokenOpt = resetPasswordTokenRepository.findByToken(token);
        
        if (resetPasswordTokenOpt.isEmpty() || resetPasswordTokenOpt.get().isExpired()) {
            return Optional.empty();
        }
        
        return Optional.of(resetPasswordTokenOpt.get().getUser());
    }
    
    public void deleteToken(String token) {
        Optional<ResetPasswordToken> resetPasswordTokenOpt = resetPasswordTokenRepository.findByToken(token);
        resetPasswordTokenOpt.ifPresent(resetPasswordTokenRepository::delete);
    }
}