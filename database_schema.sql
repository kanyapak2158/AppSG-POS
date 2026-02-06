
-- 1. สร้างฐานข้อมูลใหม่
CREATE DATABASE IF NOT EXISTS employee_name CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE employee_name;

-- 2. สร้างตารางพนักงาน
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    nickname_th VARCHAR(100),
    nickname_en VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('EMPLOYEE', 'HR', 'EXECUTIVE') DEFAULT 'EMPLOYEE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. ล้างข้อมูลเก่าและลงข้อมูลใหม่ตามรูปภาพพนักงานล่าสุด
TRUNCATE TABLE employees;

INSERT INTO employees (name_th, name_en, nickname_th, nickname_en, position, phone, email, password, role) VALUES 
('Mr.Ler Teck Wee', 'Mr.Ler Teck Wee', 'เลกซ์', 'Lex', 'Executive', '0894648143', 'Lex.Ler@sgdata.com', '1234', 'EXECUTIVE'),
('นางสาววนิดา กุลสอนนาน', 'Miss Wanida Kulsonnan', 'แหวน', 'Wan', 'HR', '0802493954', 'Wanida@gmail.com', '123456', 'HR'),
('นางสาวจีรณา นุชเอก', 'Miss Geerana Nuchake', 'จี', 'G', 'BD Consultant', '0911891319', 'geerana.nchk@gmail.com', '747527', 'EMPLOYEE'),
('นายรุ่งโรจน์', 'Mr Rungroj', 'รุ่ง', 'Rung', 'IT Supervisor', '0838758404', 'rungroj.m@sgdatahub.com', '456165', 'EMPLOYEE'),
('นายศราวุฒิ มีสา', 'Mr Sarawut Meesa', 'เกมส์', 'Games', 'Sale Engineer&IT Support', '0971491608', 'Sarawut.G@sgdatahub.com', '240436', 'EMPLOYEE'),
('นางสาวแสงนภา ภาคภูมิ', 'Miss Sangnabha Bhakbhoom', 'ปุ๊กกี้', 'Pookie', 'Sale Support', '0827811401', 'sangnapa.pookie@sgdatahub.com', 'pookie44', 'EMPLOYEE'),
('นายวรวิทย์ ปานนพภา', 'Mr worawit pannoppa', 'ดอล', 'Doll', 'IT Support', '0830876768', 'worawitpannoppa@gmail.com', '6768', 'EMPLOYEE'),
('นายศุภกฤษฎิ์ แซ่โล้ว', 'Mr.Sukrit Saelow', 'กิต', 'Krit', 'IT Support', '0967489291', 'gitzaaskyline123@gmail.com', '2544', 'EMPLOYEE'),
('นางสาวสุวิมล แซ่คู', 'Miss Suwimon Saeku', 'มุก', 'Mook', 'Digital Marketing', '0990563861', 'suwimon.s@sgdatahub.com', '332038', 'EMPLOYEE'),
('นางสาวปราณปรียา แสนสนิท', 'Miss Pranpariya Saensanit', 'เอิร์น', 'Earn', 'Accounting', '0971172320', 'pranpariya2548@gmail.com', '1643', 'EMPLOYEE'),
('นางสาวกัญญาภัค ดนตรี', 'Miss Kanyapak Dontree', 'เซีย', 'Sia', 'Intern', '0659622251', 'kanyapak2158@gmail.com', 'Ss221145', 'EMPLOYEE');
