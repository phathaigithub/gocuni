package com.example.gocuni.controller;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.gocuni.dto.UserCreateRequest;
import com.example.gocuni.model.Role;
import com.example.gocuni.model.User;
import com.example.gocuni.repository.RoleRepository;
import com.example.gocuni.repository.UserRepository;
import com.example.gocuni.response.ApiResponse;
import com.example.gocuni.service.FileStorageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminUserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FileStorageService fileStorageService;

    /**
     * Lấy danh sách người dùng có phân trang và sắp xếp
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String direction,
            @RequestParam(required = false) String keyword) {

        try {
            Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
            Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));

            Page<User> usersPage;
            if (keyword != null && !keyword.isEmpty()) {
                // Tìm kiếm theo email hoặc fullName
                usersPage = userRepository.findByEmailContainingOrFullNameContaining(keyword, keyword, pageable);
            } else {
                usersPage = userRepository.findAll(pageable);
            }

            // Loại bỏ mật khẩu trước khi trả về
            List<User> sanitizedUsers = usersPage.getContent().stream()
                    .map(user -> {
                        user.setPassword(null);
                        return user;
                    })
                    .collect(Collectors.toList());

            Map<String, Object> response = new HashMap<>();
            response.put("users", sanitizedUsers);
            response.put("currentPage", usersPage.getNumber());
            response.put("totalItems", usersPage.getTotalElements());
            response.put("totalPages", usersPage.getTotalPages());

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách người dùng thành công",
                    response
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy danh sách người dùng: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Lấy thông tin chi tiết của một người dùng
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> getUserById(@PathVariable Long id) {
        Optional<User> userOpt = userRepository.findById(id);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(
                            HttpStatus.NOT_FOUND.value(),
                            "Không tìm thấy người dùng với ID: " + id,
                            null
                    ));
        }

        User user = userOpt.get();
        user.setPassword(null); // Không trả về mật khẩu

        return ResponseEntity.ok(new ApiResponse<>(
                HttpStatus.OK.value(),
                "Lấy thông tin người dùng thành công",
                user
        ));
    }

    /**
     * Tạo người dùng mới (chỉ admin)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<User>> createUser(@Valid @RequestBody UserCreateRequest userRequest) {
        try {
            // Kiểm tra email đã tồn tại chưa
            if (userRepository.existsByEmail(userRequest.getEmail())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ApiResponse<>(
                                HttpStatus.BAD_REQUEST.value(),
                                "Email đã được sử dụng",
                                null
                        ));
            }

            // Tạo user mới
            User newUser = new User();
            newUser.setEmail(userRequest.getEmail());
            newUser.setPassword(passwordEncoder.encode(userRequest.getPassword()));
            newUser.setFullName(userRequest.getFullName());
            newUser.setGender(userRequest.getGender());
            newUser.setEnable(true);

            // Xử lý ngày sinh
            if (userRequest.getDateOfBirth() != null) {
                newUser.setDateOfBirth(LocalDate.parse(userRequest.getDateOfBirth()));
            }

            // Xử lý role
            Role role = roleRepository.findByName(userRequest.getRole())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy role: " + userRequest.getRole()));
            newUser.setRole(role);

            // Lưu user
            User savedUser = userRepository.save(newUser);
            savedUser.setPassword(null); // Không trả về mật khẩu

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(
                            HttpStatus.CREATED.value(),
                            "Tạo người dùng thành công",
                            savedUser
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi tạo người dùng: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Cập nhật thông tin người dùng
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable Long id,
            @RequestParam(value = "fullName", required = false) String fullName,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirthStr,
            @RequestParam(value = "role", required = false) String roleName,
            @RequestParam(value = "password", required = false) String password,
            @RequestParam(value = "avatar", required = false) MultipartFile avatar,
            @RequestParam(value = "enable", required = false) Boolean enable) {

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

            // Cập nhật thông tin
            if (fullName != null && !fullName.isEmpty()) {
                user.setFullName(fullName);
            }

            if (gender != null) {
                user.setGender(gender);
            }

            if (dateOfBirthStr != null && !dateOfBirthStr.isEmpty()) {
                user.setDateOfBirth(LocalDate.parse(dateOfBirthStr));
            }

            if (roleName != null && !roleName.isEmpty()) {
                Role role = roleRepository.findByName(roleName)
                        .orElseThrow(() -> new RuntimeException("Không tìm thấy role: " + roleName));
                user.setRole(role);
            }

            if (password != null && !password.isEmpty()) {
                user.setPassword(passwordEncoder.encode(password));
            }

            if (enable != null) {
                user.setEnable(enable);
            }

            // Xử lý avatar nếu có
            if (avatar != null && !avatar.isEmpty()) {
                String avatarPath = fileStorageService.storeFile(avatar, "avatars");
                user.setAvatarUrl(avatarPath);
            }

            // Lưu thông tin đã cập nhật
            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null); // Không trả về mật khẩu

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Cập nhật thông tin người dùng thành công",
                    updatedUser
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi cập nhật thông tin người dùng: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Xóa người dùng
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(@PathVariable Long id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(
                                HttpStatus.NOT_FOUND.value(),
                                "Không tìm thấy người dùng với ID: " + id,
                                null
                        ));
            }

            userRepository.deleteById(id);

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Xóa người dùng thành công",
                    null
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi xóa người dùng: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Thay đổi trạng thái người dùng (kích hoạt/vô hiệu hóa)
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> changeUserStatus(
            @PathVariable Long id,
            @RequestParam Boolean enable) {

        try {
            User user = userRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với ID: " + id));

            user.setEnable(enable);
            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null); // Không trả về mật khẩu

            String message = enable ? "Kích hoạt người dùng thành công" : "Vô hiệu hóa người dùng thành công";

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    message,
                    updatedUser
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi thay đổi trạng thái người dùng: " + e.getMessage(),
                            null
                    ));
        }
    }

    /**
     * Lấy danh sách tất cả các role
     */
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<Role>>> getAllRoles() {
        try {
            List<Role> roles = roleRepository.findAll();

            return ResponseEntity.ok(new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "Lấy danh sách roles thành công",
                    roles
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(
                            HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            "Lỗi khi lấy danh sách roles: " + e.getMessage(),
                            null
                    ));
        }
    }
}