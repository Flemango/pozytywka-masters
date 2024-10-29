-- Table for rooms
CREATE TABLE rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) NOT NULL UNIQUE
    capacity INT NOT NULL
);

-- Table for clients
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NULL DEFAULT NULL,
    phone_number VARCHAR(20)
);

-- Table for psychologists with preferred room
CREATE TABLE psychologists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),
    specialization VARCHAR(255),
    preferred_room_id INT,
    FOREIGN KEY (preferred_room_id) REFERENCES rooms(id) ON DELETE SET NULL
);

-- Table for reservations
CREATE TABLE reservations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    psychologist_id INT NOT NULL,
    room_id INT NOT NULL,
    reservation_date DATETIME NOT NULL,
    duration INT NOT NULL DEFAULT 1,
    status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (psychologist_id) REFERENCES psychologists(id) ON DELETE CASCADE,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- Table for psychologist working hours
CREATE TABLE psychologist_working_hours (
    id INT AUTO_INCREMENT PRIMARY KEY,
    psychologist_id INT NOT NULL,
    day_of_week TINYINT NOT NULL, -- 0 for Sunday, 1 for Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (psychologist_id) REFERENCES psychologists(id) ON DELETE CASCADE,
    UNIQUE KEY unique_psychologist_day (psychologist_id, day_of_week)
);