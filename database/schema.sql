-- =====================================================
-- Жатақхана бөлмелерін брондау жүйесі — дерекқор схемасы
-- MySQL 8.0+ / MariaDB 10.5+
-- =====================================================

CREATE DATABASE IF NOT EXISTS dorm_booking
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE dorm_booking;

-- 1. Пайдаланушылар (студенттер және әкімшілер)
CREATE TABLE users (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(100) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,              -- password_hash() нәтижесі
    gender        ENUM('male', 'female') NOT NULL,
    role          ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Жатақханалар
CREATE TABLE dormitories (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    address     VARCHAR(255) NOT NULL,
    gender_type ENUM('male', 'female', 'mixed') NOT NULL DEFAULT 'mixed',
    description TEXT,
    created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Бөлмелер
CREATE TABLE rooms (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    dormitory_id    INT NOT NULL,
    room_number     VARCHAR(10) NOT NULL,
    floor           TINYINT NOT NULL,
    capacity        TINYINT NOT NULL CHECK (capacity BETWEEN 1 AND 6),
    room_type       ENUM('single', 'double', 'triple', 'quad') NOT NULL,
    price_per_month DECIMAL(10,2) NOT NULL CHECK (price_per_month >= 0),
    status          ENUM('available', 'maintenance') NOT NULL DEFAULT 'available',
    description     TEXT,
    UNIQUE KEY uq_room (dormitory_id, room_number),
    CONSTRAINT fk_rooms_dorm FOREIGN KEY (dormitory_id)
        REFERENCES dormitories(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. Ыңғайлылықтар (Wi-Fi, душ, үстел, т.б.)
CREATE TABLE amenities (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- 5. Бөлме ↔ ыңғайлылық (көп-көпке байланыс)
CREATE TABLE room_amenities (
    room_id    INT NOT NULL,
    amenity_id INT NOT NULL,
    PRIMARY KEY (room_id, amenity_id),
    CONSTRAINT fk_ra_room    FOREIGN KEY (room_id)    REFERENCES rooms(id)     ON DELETE CASCADE,
    CONSTRAINT fk_ra_amenity FOREIGN KEY (amenity_id) REFERENCES amenities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Брондаулар
CREATE TABLE bookings (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    user_id    INT NOT NULL,
    room_id    INT NOT NULL,
    start_date DATE NOT NULL,
    end_date   DATE NOT NULL,
    status     ENUM('pending', 'approved', 'rejected', 'cancelled') NOT NULL DEFAULT 'pending',
    comment    TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (end_date > start_date),
    INDEX idx_booking_room_dates (room_id, start_date, end_date),
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_room FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =====================================================
-- Тестілік деректер
-- =====================================================
INSERT INTO amenities (name) VALUES
    ('Wi-Fi'), ('Жеке душ'), ('Тоңазытқыш'), ('Жазу үстелі'), ('Балкон'), ('Кондиционер');

INSERT INTO dormitories (name, address, gender_type, description) VALUES
    ('№1 жатақхана', 'Алматы, Сәтпаев к-сі, 22', 'female', 'Қыз студенттерге арналған, оқу залы бар'),
    ('№2 жатақхана', 'Алматы, Әл-Фараби даңғ., 71', 'male', 'Ер студенттерге арналған, спортзал бар'),
    ('№3 жатақхана', 'Алматы, Тимирязев к-сі, 15', 'mixed', 'Қабаттары бөлінген аралас жатақхана');

INSERT INTO rooms (dormitory_id, room_number, floor, capacity, room_type, price_per_month) VALUES
    (1, '101', 1, 2, 'double', 15000.00),
    (1, '205', 2, 3, 'triple', 12000.00),
    (2, '310', 3, 1, 'single', 25000.00),
    (2, '112', 1, 4, 'quad',   10000.00),
    (3, '204', 2, 2, 'double', 16000.00);

INSERT INTO room_amenities (room_id, amenity_id) VALUES
    (1, 1), (1, 4), (2, 1), (3, 1), (3, 2), (3, 3), (4, 4), (5, 1), (5, 5);

-- Әкімші есептік жазбасы: құпиясөзді PHP арқылы password_hash('...', PASSWORD_DEFAULT)
-- функциясымен жасап, хэшті төмендегі орынға қойыңыз.
-- INSERT INTO users (full_name, email, password_hash, gender, role)
-- VALUES ('Әкімші', 'admin@dorm.kz', '<хэш>', 'female', 'admin');
