package com.example.gocuni.config;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.gocuni.model.Category;
import com.example.gocuni.model.Post;
import com.example.gocuni.model.Role;
import com.example.gocuni.model.User;
import com.example.gocuni.repository.CategoryRepository;
import com.example.gocuni.repository.CommentRepository;
import com.example.gocuni.repository.PostRepository;
import com.example.gocuni.repository.RoleRepository;
import com.example.gocuni.repository.UserRepository;

@Configuration
public class DataLoader {

    @Value("${app.data-init.enabled:true}")
    private boolean dataInitEnabled;

    @Bean
    @Profile("!prod") // Không chạy trong môi trường production
    CommandLineRunner initDatabase(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        return args -> {
            if (!dataInitEnabled) {
                System.out.println("Khởi tạo dữ liệu đã bị tắt");
                return;
            }

            System.out.println("Bắt đầu khởi tạo dữ liệu mẫu...");

            // Khởi tạo roles
            List<Role> roles;
            if (roleRepository.count() == 0) {
                roles = initRoles(roleRepository);
                System.out.println("Đã khởi tạo " + roles.size() + " vai trò");
            } else {
                roles = roleRepository.findAll();
                System.out.println("Sử dụng " + roles.size() + " vai trò hiện có");
            }

            // Khởi tạo 3 tài khoản admin
            List<User> users;
            if (userRepository.count() == 0) {
                users = initAdminUsers(userRepository, passwordEncoder, roles);
                System.out.println("Đã khởi tạo " + users.size() + " tài khoản admin");
            } else {
                users = userRepository.findAll();
                System.out.println("Sử dụng " + users.size() + " người dùng hiện có");
            }

            // Khởi tạo danh mục
            List<Category> categories;
            if (categoryRepository.count() == 0) {
                categories = initCategories(categoryRepository);
                System.out.println("Đã khởi tạo " + categories.size() + " danh mục");
            } else {
                categories = categoryRepository.findAll();
                System.out.println("Sử dụng " + categories.size() + " danh mục hiện có");
            }

            // Khởi tạo 4 bài đăng
            if (postRepository.count() == 0) {
                List<Post> posts = initSimplePosts(postRepository, users, categories);
                System.out.println("Đã khởi tạo " + posts.size() + " bài viết");
            } else {
                System.out.println("Đã có " + postRepository.count() + " bài viết, bỏ qua khởi tạo");
            }

            System.out.println("Khởi tạo dữ liệu mẫu hoàn tất!");
        };
    }

    private List<Role> initRoles(RoleRepository roleRepository) {
        System.out.println("Khởi tạo dữ liệu vai trò...");

        // Kiểm tra nếu role ADMIN đã tồn tại
        Optional<Role> existingAdminRole = roleRepository.findByName("ROLE_ADMIN");
        if (existingAdminRole.isPresent()) {
            System.out.println("Vai trò ADMIN đã tồn tại, bỏ qua khởi tạo vai trò");
            return roleRepository.findAll();
        }

        Role adminRole = new Role();
        adminRole.setName("ROLE_ADMIN");
        adminRole.setDescription("Quản trị viên hệ thống");

        Role userRole = new Role();
        userRole.setName("ROLE_USER");
        userRole.setDescription("Người dùng thông thường");

        return roleRepository.saveAll(Arrays.asList(adminRole, userRole));
    }

    private List<User> initAdminUsers(UserRepository userRepository, PasswordEncoder passwordEncoder, List<Role> roles) {
        System.out.println("Khởi tạo dữ liệu 3 tài khoản admin...");

        // Kiểm tra nếu admin đã tồn tại
        Optional<User> existingAdmin = userRepository.findByEmail("admin@gocuni.com");
        if (existingAdmin.isPresent()) {
            System.out.println("Admin đã tồn tại, bỏ qua khởi tạo người dùng");
            return userRepository.findAll();
        }

        // Lấy role ADMIN từ danh sách đã khởi tạo
        Role adminRole = roles.stream()
                .filter(r -> r.getName().equals("ROLE_ADMIN"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy role ADMIN"));

        // Tạo 3 tài khoản admin với avatar là null
        User admin1 = new User();
        admin1.setEmail("admin@gocuni.com");
        admin1.setPassword(passwordEncoder.encode("admin123"));
        admin1.setFullName("Admin 1");
        admin1.setGender("Nam");
        admin1.setAvatarUrl(null); // Đặt avatar là null
        admin1.setDateOfBirth(LocalDate.of(1990, 1, 1));
        admin1.setRole(adminRole);
        admin1.setEnable(true);

        User admin2 = new User();
        admin2.setEmail("admin2@gocuni.com");
        admin2.setPassword(passwordEncoder.encode("admin123"));
        admin2.setFullName("Admin 2");
        admin2.setGender("Nữ");
        admin2.setAvatarUrl(null); // Đặt avatar là null
        admin2.setDateOfBirth(LocalDate.of(1992, 5, 15));
        admin2.setRole(adminRole);
        admin2.setEnable(true);

        User admin3 = new User();
        admin3.setEmail("admin3@gocuni.com");
        admin3.setPassword(passwordEncoder.encode("admin123"));
        admin3.setFullName("Admin 3");
        admin3.setGender("Nam");
        admin3.setAvatarUrl(null); // Đặt avatar là null
        admin3.setDateOfBirth(LocalDate.of(1988, 10, 20));
        admin3.setRole(adminRole);
        admin3.setEnable(true);

        return userRepository.saveAll(Arrays.asList(admin1, admin2, admin3));
    }

    private List<Category> initCategories(CategoryRepository categoryRepository) {
        System.out.println("Khởi tạo dữ liệu danh mục...");

        // Kiểm tra nếu danh mục Công nghệ đã tồn tại
        Optional<Category> existingInfor = categoryRepository.findByName("Tin tức đại học");
        if (existingInfor.isPresent()) {
            System.out.println("Danh mục đã tồn tại, bỏ qua khởi tạo danh mục");
            return categoryRepository.findAll();
        }

        Category infor = new Category();
        infor.setName("Tin tức đại học");
        infor.setDescription("Tin tức về đại học");

        Category scholarship = new Category();
        scholarship.setName("Thông tin học bổng");
        scholarship.setDescription("Thông tin các sự kiện học bổng");

        Category docs = new Category();
        docs.setName("Tài liệu");
        docs.setDescription("Cung cấp các tài liệu cho sinh viên");

        Category tips = new Category();
        tips.setName("Cẩm nang");
        tips.setDescription("Tin tức cẩm nang cho sinh viên");

        return categoryRepository.saveAll(Arrays.asList(infor, scholarship, docs, tips));
    }

    private List<Post> initSimplePosts(PostRepository postRepository, List<User> users, List<Category> categories) {
        System.out.println("Khởi tạo 4 bài đăng đơn giản...");

        // Kiểm tra nếu đã có bài viết với tiêu đề cụ thể
        Optional<Post> existingPost = postRepository.findByTitle("Bài viết mẫu 1");
        if (existingPost.isPresent()) {
            System.out.println("Bài viết đã tồn tại, bỏ qua khởi tạo bài viết");
            return postRepository.findAll();
        }

        // Lấy ra các đối tượng User và Category
        User admin1 = users.stream().filter(u -> u.getEmail().equals("admin@gocuni.com")).findFirst().orElse(users.get(0));
        User admin2 = users.stream().filter(u -> u.getEmail().equals("admin2@gocuni.com")).findFirst().orElse(users.get(1 % users.size()));
        User admin3 = users.stream().filter(u -> u.getEmail().equals("admin3@gocuni.com")).findFirst().orElse(users.get(2 % users.size()));

        Category infor = categories.stream().filter(c -> c.getName().equals("Tin tức đại học")).findFirst().orElse(categories.get(0));
        Category scholarship = categories.stream().filter(c -> c.getName().equals("Thông tin học bổng")).findFirst().orElse(categories.get(1 % categories.size()));
        Category docs = categories.stream().filter(c -> c.getName().equals("Tài liệu")).findFirst().orElse(categories.get(2 % categories.size()));
        Category tips = categories.stream().filter(c -> c.getName().equals("Cẩm nang")).findFirst().orElse(categories.get(3 % categories.size()));

        // Tạo 4 bài đăng với thumbnail là null
        Post post1 = new Post();
        post1.setTitle("Bài viết mẫu 1");
        post1.setContent("<p>Đây là nội dung bài viết mẫu 1</p>");
        post1.setThumbnail(null); // Đặt thumbnail là null
        post1.setUser(admin1);
        post1.setCategory(infor);
        post1.setPublished(true);
        post1.setViewCount(10);
        post1.setCreatedAt(LocalDateTime.now().minusDays(3));

        Post post2 = new Post();
        post2.setTitle("Bài viết mẫu 2");
        post2.setContent("<p>Đây là nội dung bài viết mẫu 2</p>");
        post2.setThumbnail(null); // Đặt thumbnail là null
        post2.setUser(admin2);
        post2.setCategory(scholarship);
        post2.setPublished(true);
        post2.setViewCount(15);
        post2.setCreatedAt(LocalDateTime.now().minusDays(2));

        Post post3 = new Post();
        post3.setTitle("Bài viết mẫu 3");
        post3.setContent("<p>Đây là nội dung bài viết mẫu 3.</p>");
        post3.setThumbnail(null); // Đặt thumbnail là null
        post3.setUser(admin3);
        post3.setCategory(docs);
        post3.setPublished(true);
        post3.setViewCount(20);
        post3.setCreatedAt(LocalDateTime.now().minusDays(1));

        Post post4 = new Post();
        post4.setTitle("Bài viết mẫu 4");
        post4.setContent("<p>Đây là nội dung bài viết mẫu 4. Bài viết này thuộc danh mục giải trí.</p>");
        post4.setThumbnail(null); // Đặt thumbnail là null
        post4.setUser(admin1);
        post4.setCategory(tips);
        post4.setPublished(true);
        post4.setViewCount(25);
        post4.setCreatedAt(LocalDateTime.now());

        return postRepository.saveAll(Arrays.asList(post1, post2, post3, post4));
    }
}