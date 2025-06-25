package com.example.gocuni.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetPasswordEmail(String to, String token, String appUrl) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        
        helper.setFrom("noreplyblph@gmail.com");
        helper.setTo(to);
        helper.setSubject("Đặt lại mật khẩu - GoC Uni");
        
        String resetUrl = appUrl + "/reset-password?token=" + token;
        
        String emailContent = 
            "<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>" +
            "<h2 style='color: #333366;'>Yêu cầu đặt lại mật khẩu</h2>" +
            "<p>Xin chào,</p>" +
            "<p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. " +
            "Vui lòng nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p>" +
            "<p><a href='" + resetUrl + "' style='display: inline-block; padding: 10px 20px; " +
            "background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px;'>" +
            "Đặt lại mật khẩu</a></p>" +
            "<p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>" +
            "<p>Lưu ý: Liên kết này sẽ hết hạn sau 30 phút.</p>" +
            "<p>Trân trọng,<br/>Đội ngũ Goc Uni</p>" +
            "</div>";
            
        helper.setText(emailContent, true);
        
        mailSender.send(message);
    }
}