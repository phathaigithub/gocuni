package com.example.gocuni.response;

import lombok.*;

@Data
@Getter
@Setter
public class ApiResponse<T> {
    private int status;
    private String message;
    private T data;


    public ApiResponse(int status, String message, T data) {
        this.status = status;
        this.message = message;
        this.data = data;
    }

    // getters and setters
}
