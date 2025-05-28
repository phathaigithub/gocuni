INSERT INTO users (email, password, full_name, gender, avatar_url, date_of_birth)
VALUES
    ('nguyenvana@example.com', 'matkhau123', 'Nguyễn Văn A', 'Nam', 'https://example.com/avatar1.png', '1990-01-15'),
    ('tranthib@example.com', 'matkhau456', 'Trần Thị B', 'Nữ', 'https://example.com/avatar2.png', '1992-03-20'),
    ('lehoangc@example.com', 'matkhau789', 'Lê Hoàng C', 'Nam', NULL, '1988-11-05');

INSERT INTO categories (name)
VALUES
    ('Công nghệ'),
    ('Thể thao'),
    ('Sức khỏe'),
    ('Giải trí');

INSERT INTO posts (title, content, thumbnail, user_id, category_id)
VALUES
    ('Xu hướng công nghệ năm 2025', 'Nội dung bài viết về các xu hướng công nghệ mới...', 'https://example.com/thumb1.jpg', 1, 1),
    ('Điểm nổi bật của Thế vận hội', 'Tóm tắt các sự kiện nổi bật tại Thế vận hội...', NULL, 2, 2),
    ('Mẹo ăn uống lành mạnh', 'Hướng dẫn về chế độ ăn cân bằng và lành mạnh...', NULL, 3, 3);

INSERT INTO comments (content, user_id, post_id)
VALUES
    ('Bài viết rất bổ ích, cảm ơn tác giả!', 2, 1),
    ('Tôi rất thích bài viết về sức khỏe này.', 1, 3),
    ('Ai có thể chia sẻ thêm về Thế vận hội không?', 3, 2);

INSERT INTO comment_likes (comment_id, user_id)
VALUES
    (1, 1),  -- Nguyễn Văn A thích bình luận số 1
    (2, 2),  -- Trần Thị B thích bình luận số 2
    (3, 1);  -- Nguyễn Văn A thích bình luận số 3
