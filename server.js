const express = require("express");
const cors = require("cors");
const path = require("path");

const db = require("./database");

const app = express();

const PORT = process.env.PORT || 5000;


// =====================================================
// BASIC SERVER SETTINGS
// =====================================================

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, "public")));app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});


// =====================================================
// SYSTEM STATUS
// =====================================================

app.get("/api/status", (req, res) => {
    res.json({
        system: "Markaz Control System",
        version: "3.0",
        status: "Running"
    });
});


// =====================================================
// STUDENTS
// =====================================================

app.get("/api/students", (req, res) => {

    db.all(
        "SELECT * FROM students ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


app.post("/api/students", (req, res) => {

    const {
        name,
        age,
        enrollmentDate,
        teacher,
        level
    } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Student name is required"
        });
    }

    db.run(
        `INSERT INTO students
        (name, age, enrollmentDate, teacher, level)
        VALUES (?, ?, ?, ?, ?)`,
        [
            name,
            age || null,
            enrollmentDate || "",
            teacher || "",
            level || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                studentId: this.lastID
            });
        }
    );
});


// =====================================================
// TEACHERS
// =====================================================

app.get("/api/teachers", (req, res) => {

    db.all(
        "SELECT * FROM teachers ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


app.post("/api/teachers", (req, res) => {

    const {
        name,
        phone,
        qualification
    } = req.body;

    if (!name) {
        return res.status(400).json({
            error: "Teacher name is required"
        });
    }

    db.run(
        `INSERT INTO teachers
        (name, phone, qualification)
        VALUES (?, ?, ?)`,
        [
            name,
            phone || "",
            qualification || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                teacherId: this.lastID
            });
        }
    );
});


// =====================================================
// ATTENDANCE
// =====================================================

app.get("/api/attendance", (req, res) => {

    db.all(
        "SELECT * FROM attendance ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


// =====================================================
// HIFZ
// =====================================================

app.get("/api/hifz", (req, res) => {

    db.all(
        "SELECT * FROM hifz ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


// =====================================================
// EXAMS
// =====================================================

app.get("/api/exams", (req, res) => {

    db.all(
        "SELECT * FROM exams ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
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
        (
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
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId || null,
            examDate || "",
            examType || "",
            examiner || "",
            surah || "",
            juz || null,
            score || null,
            grade || "",
            result || "",
            remarks || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                examId: this.lastID
            });
        }
    );
});


// =====================================================
// KHATM
// =====================================================

app.get("/api/khatm", (req, res) => {

    db.all(
        "SELECT * FROM khatm_records ORDER BY id DESC",
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
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
        (
            studentId,
            startDate,
            completionDate,
            teacher,
            totalJuz,
            status,
            certificateNumber,
            remarks
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId || null,
            startDate || "",
            completionDate || "",
            teacher || "",
            totalJuz || null,
            status || "",
            certificateNumber || "",
            remarks || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                khatmId: this.lastID
            });
        }
    );
});


// =====================================================
// PARENT COMMUNICATION
// =====================================================

// GET PARENTS

app.get("/api/parents", (req, res) => {

    const sql = `
        SELECT
            p.*,
            COUNT(sp.studentId) AS studentCount
        FROM parents p
        LEFT JOIN student_parents sp
            ON p.id = sp.parentId
        GROUP BY p.id
        ORDER BY p.name ASC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});


// GET ONE PARENT

app.get("/api/parents/:id", (req, res) => {

    db.get(
        "SELECT * FROM parents WHERE id = ?",
        [req.params.id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!row) {
                return res.status(404).json({
                    error: "Parent not found"
                });
            }

            res.json(row);
        }
    );
});


// ADD PARENT

app.post("/api/parents", (req, res) => {

    const {
        name,
        relationship,
        phone,
        whatsapp,
        email,
        address,
        preferredContact
    } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            error: "Parent name is required"
        });
    }

    db.run(
        `INSERT INTO parents
        (
            name,
            relationship,
            phone,
            whatsapp,
            email,
            address,
            preferredContact
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            name.trim(),
            relationship || "",
            phone || "",
            whatsapp || "",
            email || "",
            address || "",
            preferredContact || "Phone"
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Parent added successfully",
                id: this.lastID
            });
        }
    );
});


// DELETE PARENT

app.delete("/api/parents/:id", (req, res) => {

    const parentId = req.params.id;

    db.serialize(() => {

        db.run(
            "DELETE FROM student_parents WHERE parentId = ?",
            [parentId]
        );

        db.run(
            "DELETE FROM parent_communications WHERE parentId = ?",
            [parentId]
        );

        db.run(
            "DELETE FROM parents WHERE id = ?",
            [parentId],
            function (err) {

                if (err) {
                    return res.status(500).json({
                        error: err.message
                    });
                }

                if (this.changes === 0) {
                    return res.status(404).json({
                        error: "Parent not found"
                    });
                }

                res.json({
                    success: true,
                    message: "Parent deleted successfully"
                });
            }
        );
    });
});


// =====================================================
// LINK PARENT TO STUDENT
// =====================================================

app.post("/api/student-parents", (req, res) => {

    const {
        studentId,
        parentId,
        relationship,
        isPrimary
    } = req.body;

    if (!studentId || !parentId) {
        return res.status(400).json({
            error: "Student and parent are required"
        });
    }

    db.run(
        `INSERT INTO student_parents
        (
            studentId,
            parentId,
            relationship,
            isPrimary
        )
        VALUES (?, ?, ?, ?)`,
        [
            studentId,
            parentId,
            relationship || "",
            isPrimary ? 1 : 0
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                message: "Parent linked to student",
                id: this.lastID
            });
        }
    );
});


// GET STUDENTS FOR PARENT

app.get("/api/parents/:id/students", (req, res) => {

    const sql = `
        SELECT
            s.*,
            sp.relationship,
            sp.isPrimary
        FROM student_parents sp
        INNER JOIN students s
            ON s.id = sp.studentId
        WHERE sp.parentId = ?
        ORDER BY s.name ASC
    `;

    db.all(
        sql,
        [req.params.id],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);
        }
    );
});


// =====================================================
// PARENT COMMUNICATION HISTORY
// =====================================================

app.get("/api/parent-communications", (req, res) => {

    const sql = `
        SELECT
            pc.*,
            p.name AS parentName,
            s.name AS studentName
        FROM parent_communications pc
        LEFT JOIN parents p
            ON p.id = pc.parentId
        LEFT JOIN students s
            ON s.id = pc.studentId
        ORDER BY pc.communicationDate DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(rows);
    });
});


app.post("/api/parent-communications", (req, res) => {

    const {
        parentId,
        studentId,
        messageType,
        message,
        contactMethod,
        status
    } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            error: "Message is required"
        });
    }

    db.run(
        `INSERT INTO parent_communications
        (
            parentId,
            studentId,
            messageType,
            message,
            contactMethod,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)`,
        [
            parentId || null,
            studentId || null,
            messageType || "General Update",
            message.trim(),
            contactMethod || "Phone",
            status || "Sent"
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.status(201).json({
                success: true,
                message: "Parent communication saved",
                id: this.lastID
            });
        }
    );
});


app.delete("/api/parent-communications/:id", (req, res) => {

    db.run(
        "DELETE FROM parent_communications WHERE id = ?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Communication not found"
                });
            }

            res.json({
                success: true,
                message: "Communication deleted successfully"
            });
        }
    );
});


// =====================================================
// DASHBOARD
// =====================================================
app.post("/api/login", (req, res) => {

    const { username, password } = req.body;

    if (username === "admin" && password === "admin123") {

        return res.json({
            success: true,
            role: "Administrator"
        });

    }

    if (username === "manager" && password === "manager123") {

        return res.json({
            success: true,
            role: "Manager"
        });

    }

    if (username === "teacher" && password === "teacher123") {

        return res.json({
            success: true,
            role: "Teacher"
        });

    }

    res.json({
        success: false,
        message: "Invalid username or password"
    });

});
app.get("/api/dashboard", (req, res) => {

    db.get(
        "SELECT COUNT(*) AS totalStudents FROM students",
        [],
        (err, studentData) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            db.get(
                "SELECT COUNT(*) AS totalTeachers FROM teachers",
                [],
                (err2, teacherData) => {

                    if (err2) {
                        return res.status(500).json({
                            error: err2.message
                        });
                    }

                    res.json({
                        totalStudents: studentData.totalStudents,
                        totalTeachers: teacherData.totalTeachers
                    });
                }
            );
        }
    );
});


// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {

    console.log("=================================");
    console.log("Markaz Control System");
    console.log("Server running on port " + PORT);
    console.log("=================================");
});
