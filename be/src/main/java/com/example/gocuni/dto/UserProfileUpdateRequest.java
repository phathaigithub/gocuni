package com.example.gocuni.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileUpdateRequest {
    private String fullName;
    private String gender;
    private String avatarUrl;
    private LocalDate dateOfBirth;
}