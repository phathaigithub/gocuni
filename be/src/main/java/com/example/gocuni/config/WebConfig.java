package com.example.gocuni.config;

import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Lấy đường dẫn tuyệt đối của thư mục upload
        Path applicationPath = Paths.get("").toAbsolutePath();
        Path uploadPath = applicationPath.resolve("upload");
        
        // Log để debug
        System.out.println("Configuring resource handler for uploads");
        System.out.println("Upload directory absolute path: " + uploadPath.toString());
        
        // Cấu hình resource handler
        registry.addResourceHandler("/upload/**")
                .addResourceLocations("file:" + uploadPath.toString() + "/");
        
        // Cấu hình trực tiếp cho thư mục posts/ và avatars/
        registry.addResourceHandler("/posts/**")
                .addResourceLocations("file:" + uploadPath.resolve("posts").toString() + "/");
        
        registry.addResourceHandler("/avatars/**")
                .addResourceLocations("file:" + uploadPath.resolve("avatars").toString() + "/");
        
        // Thêm cấu hình mới cho comments
        registry.addResourceHandler("/comments/**")
                .addResourceLocations("file:" + uploadPath.resolve("comments").toString() + "/");
    }
}