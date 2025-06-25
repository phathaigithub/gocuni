package com.example.gocuni.security;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.gocuni.service.UserDetailsServiceImpl;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Autowired
    private JwtUtils jwtUtils;
    
    @Autowired
    private UserDetailsServiceImpl userDetailsService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);
            
            System.out.println("================ JWT FILTER ================");
            System.out.println("Request URI: " + request.getRequestURI());
            System.out.println("Authorization header: '" + request.getHeader("Authorization") + "'");
            System.out.println("JWT extracted: " + (jwt != null ? "Yes (length: " + jwt.length() + ")" : "No"));
            
            if (StringUtils.hasText(jwt) && jwtUtils.validateToken(jwt)) {
                String username = jwtUtils.getUsernameFromToken(jwt);
                System.out.println("JWT valid, username extracted: " + username);
                
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                
                // Thêm role vào authorities
                Collection<GrantedAuthority> authorities = new ArrayList<>();
                String role = jwtUtils.getRoleFromToken(jwt);
                if (role != null) {
                    authorities.add(new SimpleGrantedAuthority(role));
                }
                
                UsernamePasswordAuthenticationToken authentication = 
                        new UsernamePasswordAuthenticationToken(userDetails, null, authorities);
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                System.out.println("JWT invalid or not present, continuing as anonymous");
            }
        } catch (Exception e) {
            System.out.println("Error in JWT filter: " + e.getMessage());
            e.printStackTrace();
            log.error("Cannot set user authentication: {}", e.getMessage());
            // Không throw exception để cho phép request tiếp tục
        }
        
        filterChain.doFilter(request, response);
    }
    
    private String getJwtFromRequest(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");
        
        if (StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        
        return null;
    }

    private boolean shouldSkipAuthentication(String path, String method) {
        // Các endpoints công khai
        if (path.startsWith("/api/auth/signin") || 
            path.startsWith("/api/auth/signup") || 
            path.startsWith("/api/auth/forgot-password") || 
            path.startsWith("/api/auth/reset-password")) {
            return true;
        }
        
        // KHÔNG bỏ qua xác thực cho các endpoints post
        // if (path.startsWith("/api/posts/add")) return false;
        
        if (method.equals("GET") && path.startsWith("/api/posts")) return true;
        if (method.equals("GET") && path.startsWith("/api/categories")) return true;
        if (method.equals("GET") && path.startsWith("/api/comments")) return true;
        return false;
    }
}