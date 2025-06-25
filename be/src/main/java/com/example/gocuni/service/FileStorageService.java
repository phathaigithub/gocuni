package com.example.gocuni.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {
    private final Path fileStorageLocation;

    public FileStorageService(@Value("${file.upload-dir}") String uploadDir) {
        // Lấy đường dẫn tuyệt đối của ứng dụng
        Path applicationPath = Paths.get("").toAbsolutePath();
        // Sử dụng đường dẫn tương đối với thư mục gốc dự án
        this.fileStorageLocation = applicationPath.resolve(uploadDir);
        
        try {
            Files.createDirectories(this.fileStorageLocation);
            System.out.println("Upload directory configured at: " + this.fileStorageLocation);
        } catch (Exception ex) {
            throw new RuntimeException("Could not create the directory where the uploaded files will be stored.", ex);
        }
    }

    public String storeFile(MultipartFile file, String subDirectory) {
        // Tạo tên file duy nhất bằng UUID
        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String fileName = UUID.randomUUID().toString() + extension;
        
        // Tạo thư mục con nếu cần
        Path targetSubDirectory = this.fileStorageLocation.resolve(subDirectory);
        try {
            if (!Files.exists(targetSubDirectory)) {
                Files.createDirectories(targetSubDirectory);
                System.out.println("Created subdirectory: " + targetSubDirectory);
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not create subdirectory " + subDirectory, ex);
        }
        
        // Lưu file
        try {
            Path targetLocation = targetSubDirectory.resolve(fileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/" + subDirectory + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }
    
    // Phương thức để lưu file từ byte array vào thư mục đích
    public String storeFileFromBytes(byte[] fileBytes, String subDirectory, String fileName) {
        // Tạo thư mục con nếu cần
        Path targetSubDirectory = this.fileStorageLocation.resolve(subDirectory);
        try {
            if (!Files.exists(targetSubDirectory)) {
                Files.createDirectories(targetSubDirectory);
                System.out.println("Created subdirectory: " + targetSubDirectory);
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not create subdirectory " + subDirectory, ex);
        }
        
        // Lưu file
        try {
            Path targetLocation = targetSubDirectory.resolve(fileName);
            Files.write(targetLocation, fileBytes);
            
            // Log để debug
            System.out.println("File saved at: " + targetLocation.toAbsolutePath());
            
            return "/" + subDirectory + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file " + fileName, ex);
        }
    }
    
    // Phương thức để di chuyển file từ vị trí tạm thời đến thư mục lưu trữ chính thức
    public String moveFile(String sourceFilePath, String subDirectory) {
        try {
            // Lấy path gốc của file nguồn
            Path sourcePath = Paths.get(sourceFilePath);
            String fileName = sourcePath.getFileName().toString();
            
            // Tạo thư mục đích nếu chưa tồn tại
            Path targetSubDirectory = this.fileStorageLocation.resolve(subDirectory);
            if (!Files.exists(targetSubDirectory)) {
                Files.createDirectories(targetSubDirectory);
            }
            
            // Tạo đường dẫn đích
            Path targetPath = targetSubDirectory.resolve(fileName);
            
            // Di chuyển file
            Files.move(sourcePath, targetPath, StandardCopyOption.REPLACE_EXISTING);
            
            return "/" + subDirectory + "/" + fileName;
        } catch (IOException ex) {
            throw new RuntimeException("Could not move file " + sourceFilePath, ex);
        }
    }
    
    // Phương thức để xóa file
    public void deleteFile(String filePath) {
        try {
            if (filePath.startsWith("/")) {
                filePath = filePath.substring(1);
            }
            
            Path targetLocation = this.fileStorageLocation.resolve(filePath);
            Files.deleteIfExists(targetLocation);
        } catch (IOException ex) {
            throw new RuntimeException("Could not delete file " + filePath, ex);
        }
    }
}