const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
    res.json({
        system: "Markaz Control System",
        version: "3.0",
        status: "Running"
    });
});

/* STUDENTS */

app.get("/api/students", (req, res) => {
    db.all("SELECT * FROM students ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post("/api/students", (req, res) => {
    const { name, age, enrollmentDate, teacher, level } = req.body;

    db.run(
        `INSERT INTO students
        (name, age, enrollmentDate, teacher, level)
        VALUES (?, ?, ?, ?, ?)`,
        [name, age, enrollmentDate, teacher, level],
        function (err) {
            if (err) return res.status(500).json(err);

            res.json({
                success: true,
                studentId: this.lastID
            });
        }
    );
});

/* TEACHERS */

app.get("/api/teachers", (req, res) => {
    db.all("SELECT * FROM teachers ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

app.post("/api/teachers", (req, res) => {
    const { name, phone, qualification } = req.body;

    db.run(
        `INSERT INTO teachers
        (name, phone, qualification)
        VALUES (?, ?, ?)`,
        [name, phone, qualification],
        function (err) {
            if (err) return res.status(500).json(err);

            res.json({
                success: true,
                teacherId: this.lastID
            });
        }
    );
});

/* ATTENDANCE */

app.get("/api/attendance", (req, res) => {
    db.all("SELECT * FROM attendance ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

/* HIFZ */

app.get("/api/hifz", (req, res) => {
    db.all("SELECT * FROM hifz ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

/* DASHBOARD */

app.get("/api/dashboard", (req, res) => {

    db.get(
        "SELECT COUNT(*) AS totalStudents FROM students",
        [],
        (err, studentData) => {

            if (err) return res.status(500).json(err);

            db.get(
                "SELECT COUNT(*) AS totalTeachers FROM teachers",
                [],
                (err2, teacherData) => {

                    if (err2) return res.status(500).json(err2);

                    res.json({
                        totalStudents: studentData.totalStudents,
                        totalTeachers: teacherData.totalTeachers
                    });
                }
           
        }
    );
});app.listen(PORT, "0.0.0.0", () => {app.get("/api/exams", (req, res) => {
    db.all("SELECT * FROM exams ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post("/api/exams", (req, res) => {

    const {
        studentId,
        examDate,
        examType,
        examiner,
        surah,
        juz,
        score,
        grade,
        result,
        remarks
    } = req.body;

    db.run(
        `INSERT INTO exams
        (studentId, examDate, examType, examiner, surah, juz, score, grade, result, remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId,
            examDate,
            examType,
            examiner,
            surah,
            juz,
            score,
            grade,
            result,
            remarks
        ],
        function(err){
            if(err) return res.status(500).json({error: err.message});

            res.json({
                success:true,
                examId:this.lastID
            });
        }
    );
});app.get("/api/khatm", (req, res) => {
    db.all("SELECT * FROM khatm_records ORDER BY id DESC", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post("/api/khatm", (req, res) => {

    const {
        studentId,
        startDate,
        completionDate,
        teacher,
        totalJuz,
        status,
        certificateNumber,
        remarks
    } = req.body;

    db.run(
        `INSERT INTO khatm_records
        (studentId,startDate,completionDate,teacher,totalJuz,status,certificateNumber,remarks)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId,
            startDate,
            completionDate,
            teacher,
            totalJuz,
            status,
            certificateNumber,
            remarks
        ],
        function(err){
            if(err) return res.status(500).json({error: err.message});

            res.json({
                success:true,
                khatmId:this.lastID
            });
        }
    );
});

app.listen(5000, () => {
    console.log("Markaz Control System running on port 5000");
});