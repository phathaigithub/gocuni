package com.example.gocuni.response;

public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;

    // Constructor, getter/setter

    public ApiResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    // getters and setters
}
