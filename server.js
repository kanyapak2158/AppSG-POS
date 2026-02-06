
import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// --- การตั้งค่าการเชื่อมต่อ XAMPP MySQL ---
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '', // ค่าเริ่มต้นของ XAMPP คือว่างเปล่า
    database: 'employee_name',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// ตรวจสอบการเชื่อมต่อกับ XAMPP
pool.getConnection((err, conn) => {
    if (err) {
        console.error('❌ ไม่สามารถเชื่อมต่อ MySQL ได้ (XAMPP):', err.message);
    } else {
        console.log('✅ DATABASE CONNECTED (Database: employee_name)');
        conn.release();
    }
});

// Helper: Mapping helper (DB snake_case -> JS camelCase)
const mapToJS = (row) => ({
    id: row.id.toString(),
    nameTh: row.name_th,
    nameEn: row.name_en,
    nicknameTh: row.nickname_th,
    nicknameEn: row.nickname_en,
    position: row.position,
    phone: row.phone,
    email: row.email,
    password: row.password,
    role: row.role
});

// API: ดึงพนักงานทั้งหมด
app.get('/api/employees', (req, res) => {
    pool.query("SELECT * FROM employees ORDER BY id DESC", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows.map(mapToJS));
    });
});

// API: เพิ่มพนักงานใหม่
app.post('/api/employees', (req, res) => {
    const e = req.body;
    const sql = `INSERT INTO employees 
        (name_th, name_en, nickname_th, nickname_en, position, phone, email, password, role) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const params = [e.nameTh, e.nameEn, e.nicknameTh, e.nicknameEn, e.position, e.phone, e.email, e.password, e.role];
    
    pool.query(sql, params, (err, result) => {
        if (err) {
            console.error('❌ Insert Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, id: result.insertId });
    });
});

// API: แก้ไขข้อมูลพนักงาน
app.put('/api/employees/:id', (req, res) => {
    const { id } = req.params;
    const e = req.body;
    const sql = `UPDATE employees SET 
        name_th=?, name_en=?, nickname_th=?, nickname_en=?, position=?, phone=?, email=?, password=?, role=? 
        WHERE id=?`;
    const params = [e.nameTh, e.nameEn, e.nicknameTh, e.nicknameEn, e.position, e.phone, e.email, e.password, e.role, id];
    
    pool.query(sql, params, (err, result) => {
        if (err) {
            console.error('❌ Update Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true });
    });
});

// API: ลบพนักงาน
app.delete('/api/employees/:id', (req, res) => {
    pool.query("DELETE FROM employees WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

// API: Login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    pool.query("SELECT * FROM employees WHERE email = ? AND password = ? LIMIT 1", [email, password], (err, rows) => {
        if (err) return res.status(500).json({ error: "Database internal error" });
        if (rows && rows.length > 0) {
            res.json({ employee: mapToJS(rows[0]) });
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    });
});

// API: Forgot Password
app.post('/api/update-password', (req, res) => {
    const { email, newPassword } = req.body;
    pool.query("UPDATE employees SET password = ? WHERE email = ?", [newPassword, email], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.affectedRows === 0) return res.status(404).json({ error: "Email not found" });
        res.json({ success: true });
    });
});

app.listen(port, () => {
    console.log(`🚀 SGDATA BACKEND RUNNING ON http://localhost:${port}`);
});
