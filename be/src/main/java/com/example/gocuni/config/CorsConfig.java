package com.example.gocuni.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Cho phép credentials (cookies, auth headers)
        config.setAllowCredentials(true);
        
        // Chỉ định chính xác origin thay vì dùng *
        config.addAllowedOrigin("http://localhost:3000");
        
        // Cho phép tất cả các headers
        config.addAllowedHeader("*");
        
        // Cho phép tất cả các methods
        config.addAllowedMethod("*");
        
        // Thêm exposed headers (nếu cần)
        config.addExposedHeader("Authorization");
        
        // Thời gian cache preflight requests
        config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}