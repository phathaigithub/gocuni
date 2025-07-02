package com.example.gocuni.dto;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String gender;
    private String dateOfBirth;
    private String role;
    private String password;
    private Boolean enable;
}