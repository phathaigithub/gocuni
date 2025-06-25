package com.example.gocuni.dto;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String role;

    public JwtResponse(String token, Long id, String email, String fullName, String avatarUrl, String role) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.role = role;
    }
    
    public JwtResponse(String token, Long id, String email, String fullName, String avatarUrl, String role, String refreshToken) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.refreshToken = refreshToken;
    }
}
