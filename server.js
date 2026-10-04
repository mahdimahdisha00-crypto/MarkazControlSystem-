const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const db = require("./database");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/*
====================================================
STATIC FILES
====================================================
*/

app.use(express.static(__dirname));

if (fs.existsSync(path.join(__dirname, "public"))) {
    app.use(express.static(path.join(__dirname, "public")));
}


/*
====================================================
HOME
====================================================
*/

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"), err => {
        if (err) {
            res.sendFile(path.join(__dirname, "login.html"));
        }
    });
});


/*
====================================================
SYSTEM STATUS
====================================================
*/

app.get("/api/status", (req, res) => {
    res.json({
        system: "Markaz Control System",
        version: "4.0",
        status: "Running",
        serverTime: new Date().toISOString()
    });
});


/*
====================================================
STUDENTS
====================================================
*/

app.get("/api/students", (req, res) => {

    db.all(
        `
        SELECT
            id,
            name,
            age,
            enrollmentDate,
            teacher,
            level
        FROM students
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                console.error("Students API Error:", err.message);

                return res.status(500).json({
                    error: "Failed to load students",
                    details: err.message
                });
            }

            console.log("Students loaded:", rows.length);

            res.json(rows || []);
        }
    );

});


/*
====================================================
CREATE STUDENT
====================================================
*/

app.post("/api/students", (req, res) => {

    const {
        name,
        age,
        enrollmentDate,
        teacher,
        level
    } = req.body;

    if (!name || !String(name).trim()) {
        return res.status(400).json({
            error: "Student name is required"
        });
    }

    db.run(
        `
        INSERT INTO students
        (name, age, enrollmentDate, teacher, level)
        VALUES (?, ?, ?, ?, ?)
        `,
        [
            String(name).trim(),
            age || null,
            enrollmentDate || new Date().toISOString().slice(0, 10),
            teacher || "",
            level || ""
        ],
        function (err) {

            if (err) {
                console.error("Create student error:", err.message);

                return res.status(500).json({
                    error: "Failed to create student",
                    details: err.message
                });
            }

            res.json({
                success: true,
                message: "Student created successfully",
                id: this.lastID
            });

        }
    );

});


/*
====================================================
UPDATE STUDENT
====================================================
*/

app.put("/api/students/:id", (req, res) => {

    const id = req.params.id;

    const {
        name,
        age,
        enrollmentDate,
        teacher,
        level
    } = req.body;

    db.run(
        `
        UPDATE students
        SET
            name = ?,
            age = ?,
            enrollmentDate = ?,
            teacher = ?,
            level = ?
        WHERE id = ?
        `,
        [
            name,
            age || null,
            enrollmentDate || null,
            teacher || "",
            level || "",
            id
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to update student",
                    details: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                success: true,
                message: "Student updated successfully"
            });

        }
    );

});


/*
====================================================
DELETE STUDENT
====================================================
*/

app.delete("/api/students/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM students WHERE id = ?",
        [id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to delete student",
                    details: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            res.json({
                success: true,
                message: "Student deleted successfully"
            });

        }
    );

});


/*
====================================================
SEARCH STUDENT
====================================================
*/

app.get("/api/search-student", (req, res) => {

    const q = req.query.q || "";

    db.all(
        `
        SELECT *
        FROM students
        WHERE name LIKE ?
        ORDER BY id DESC
        `,
        [`%${q}%`],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Search failed",
                    details: err.message
                });
            }

            res.json(rows || []);

        }
    );

});


/*
====================================================
TEACHERS
====================================================
*/

app.get("/api/teachers", (req, res) => {

    db.all(
        `
        SELECT *
        FROM teachers
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load teachers",
                    details: err.message
                });
            }

            res.json(rows || []);

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
        `
        INSERT INTO teachers
        (name, phone, qualification)
        VALUES (?, ?, ?)
        `,
        [
            name,
            phone || "",
            qualification || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to create teacher",
                    details: err.message
                });
            }

            res.json({
                success: true,
                message: "Teacher created successfully",
                id: this.lastID
            });

        }
    );

});


app.put("/api/teachers/:id", (req, res) => {

    const {
        name,
        phone,
        qualification
    } = req.body;

    db.run(
        `
        UPDATE teachers
        SET
            name = ?,
            phone = ?,
            qualification = ?
        WHERE id = ?
        `,
        [
            name,
            phone || "",
            qualification || "",
            req.params.id
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to update teacher",
                    details: err.message
                });
            }

            res.json({
                success: true,
                message: "Teacher updated successfully"
            });

        }
    );

});


app.delete("/api/teachers/:id", (req, res) => {

    db.run(
        "DELETE FROM teachers WHERE id = ?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to delete teacher",
                    details: err.message
                });
            }

            res.json({
                success: true,
                message: "Teacher deleted successfully"
            });

        }
    );

});


/*
====================================================
ATTENDANCE
====================================================
*/

app.get("/api/attendance", (req, res) => {

    db.all(
        `
        SELECT
            a.*,
            s.name AS studentName
        FROM attendance a
        LEFT JOIN students s
            ON s.id = a.studentId
        ORDER BY a.date DESC, a.id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load attendance",
                    details: err.message
                });
            }

            res.json(rows || []);

        }
    );

});


app.post("/api/attendance", (req, res) => {

    const {
        studentId,
        date,
        status
    } = req.body;

    if (!studentId || !status) {
        return res.status(400).json({
            error: "Student and attendance status are required"
        });
    }

    db.run(
        `
        INSERT INTO attendance
        (studentId, date, status)
        VALUES (?, ?, ?)
        `,
        [
            studentId,
            date || new Date().toISOString().slice(0, 10),
            status
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to save attendance",
                    details: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


/*
====================================================
HIFZ
====================================================
*/

app.get("/api/hifz", (req, res) => {

    db.all(
        `
        SELECT
            h.*,
            s.name AS studentName
        FROM hifz h
        LEFT JOIN students s
            ON s.id = h.studentId
        ORDER BY h.id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load Hifz records",
                    details: err.message
                });
            }

            res.json(rows || []);

        }
    );

});


app.post("/api/hifz", (req, res) => {

    const {
        studentId,
        surah,
        ayahFrom,
        ayahTo,
        juz,
        grade,
        logDate
    } = req.body;

    db.run(
        `
        INSERT INTO hifz
        (studentId, surah, ayahFrom, ayahTo, juz, grade, logDate)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            studentId,
            surah || "",
            ayahFrom || null,
            ayahTo || null,
            juz || null,
            grade || "",
            logDate || new Date().toISOString().slice(0, 10)
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to save Hifz record",
                    details: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


/*
====================================================
EXAMS
====================================================
*/

app.get("/api/exams", (req, res) => {

    db.all(
        `
        SELECT
            e.*,
            s.name AS studentName
        FROM exams e
        LEFT JOIN students s
            ON s.id = e.studentId
        ORDER BY e.id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load exams",
                    details: err.message
                });
            }

            res.json(rows || []);

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
        `
        INSERT INTO exams
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            studentId,
            examDate || null,
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
                    error: "Failed to save exam",
                    details: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


/*
====================================================
KHATM
====================================================
*/

app.get("/api/khatm", (req, res) => {

    db.all(
        `
        SELECT
            k.*,
            s.name AS studentName
        FROM khatm_records k
        LEFT JOIN students s
            ON s.id = k.studentId
        ORDER BY k.id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load Khatm records",
                    details: err.message
                });
            }

            res.json(rows || []);

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
        `
        INSERT INTO khatm_records
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
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
            studentId,
            startDate || null,
            completionDate || null,
            teacher || "",
            totalJuz || 30,
            status || "In Progress",
            certificateNumber || "",
            remarks || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to save Khatm record",
                    details: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


/*
====================================================
PARENTS
====================================================
*/

app.get("/api/parents", (req, res) => {

    db.all(
        `
        SELECT *
        FROM parents
        ORDER BY id DESC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load parents",
                    details: err.message
                });
            }

            res.json(rows || []);

        }
    );

});


app.get("/api/parents/:id", (req, res) => {

    db.get(
        `
        SELECT *
        FROM parents
        WHERE id = ?
        `,
        [req.params.id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load parent",
                    details: err.message
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

    if (!name) {
        return res.status(400).json({
            error: "Parent name is required"
        });
    }

    db.run(
        `
        INSERT INTO parents
        (
            name,
            relationship,
            phone,
            whatsapp,
            email,
            address,
            preferredContact
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
            name,
            relationship || "",
            phone || "",
            whatsapp || "",
            email || "",
            address || "",
            preferredContact || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to create parent",
                    details: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


app.delete("/api/parents/:id", (req, res) => {

    db.run(
        "DELETE FROM parents WHERE id = ?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to delete parent",
                    details: err.message
                });
            }

            res.json({
                success: true
            });

        }
    );

});


/*
====================================================
STUDENT ↔ PARENT
====================================================
*/

app.post("/api/student-parents", (req, res) => {

    const {
        studentId,
        parentId,
        relationship,
        isPrimary
    } = req.body;

    db.run(
        `
        INSERT INTO student_parents
        (
            studentId,
            parentId,
            relationship,
            isPrimary
        )
        VALUES (?, ?, ?, ?)
        `,
        [
            studentId,
            parentId,
            relationship || "",
            isPrimary ? 1 : 0
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to connect student and parent",
                    details: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


app.get("/api/parents/:id/students", (req, res) => {

    db.all(
        `
        SELECT
            s.*
        FROM students s
        INNER JOIN student_parents sp
            ON sp.studentId = s.id
        WHERE sp.parentId = ?
        ORDER BY s.name
        `,
        [req.params.id],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load parent's students",
                    details: err.message
                });
            }

            res.json(rows || []);

        }
    );

});


/*
====================================================
PARENT COMMUNICATION
====================================================
*/

app.get("/api/parent-communications", (req, res) => {

    db.all(
        `
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
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: "Failed to load communications",
                    details: err.message
                });
            }

            res.json(rows || []);

        }
    );

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

    db.run(
        `
        INSERT INTO parent_communications
        (
            parentId,
            studentId,
            messageType,
            message,
            contactMethod,
            status
        )
        VALUES (?, ?, ?, ?, ?, ?)
        `,
        [
            parentId || null,
            studentId || null,
            messageType || "",
            message || "",
            contactMethod || "",
            status || "Sent"
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to save communication",
                    details: err.message
                });
            }

            res.json({
                success: true,
                id: this.lastID
            });

        }
    );

});


app.delete("/api/parent-communications/:id", (req, res) => {

    db.run(
        `
        DELETE FROM parent_communications
        WHERE id = ?
        `,
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to delete communication",
                    details: err.message
                });
            }

            res.json({
                success: true
            });

        }
    );

});


/*
====================================================
FEES DATABASE MIGRATION
====================================================
*/

function ensureFeeColumns(callback) {

    db.all(
        "PRAGMA table_info(fees)",
        [],
        (err, columns) => {

            if (err) {
                console.error(
                    "Fee table check error:",
                    err.message
                );

                return callback(err);
            }

            const existing =
                columns.map(column => column.name);

            const requiredColumns = [
                {
                    name: "fee_month",
                    sql: "ALTER TABLE fees ADD COLUMN fee_month TEXT"
                },
                {
                    name: "payment_method",
                    sql: "ALTER TABLE fees ADD COLUMN payment_method TEXT"
                },
                {
                    name: "notes",
                    sql: "ALTER TABLE fees ADD COLUMN notes TEXT"
                }
            ];

            let pending =
                requiredColumns.filter(
                    column =>
                        !existing.includes(column.name)
                );

            if (pending.length === 0) {
                return callback(null);
            }

            let completed = 0;

            pending.forEach(column => {

                db.run(
                    column.sql,
                    [],
                    err => {

                        if (err) {
                            console.error(
                                "Fee migration error:",
                                err.message
                            );

                            return callback(err);
                        }

                        completed++;

                        if (completed === pending.length) {
                            callback(null);
                        }

                    }
                );

            });

        }
    );

}


/*
====================================================
FEES
====================================================
*/

app.get("/api/fees", (req, res) => {

    ensureFeeColumns(err => {

        if (err) {
            return res.status(500).json({
                error: "Fee database setup failed",
                details: err.message
            });
        }

        db.all(
            `
            SELECT
                f.id,
                f.student_name,
                f.monthly_fee,
                f.paid_amount,
                f.balance,
                f.payment_date,
                f.status,
                f.fee_month,
                f.payment_method,
                f.notes,
                s.id AS studentId,
                s.name AS studentName,
                s.level AS studentLevel
            FROM fees f
            LEFT JOIN students s
                ON s.name = f.student_name
            ORDER BY f.id DESC
            `,
            [],
            (err, rows) => {

                if (err) {
                    console.error(
                        "Fees GET error:",
                        err.message
                    );

                    return res.status(500).json({
                        error: "Failed to load fees",
                        details: err.message
                    });
                }

                res.json(rows || []);

            }
        );

    });

});


/*
====================================================
FEE SUMMARY
====================================================
*/

app.get("/api/fees/summary", (req, res) => {

    ensureFeeColumns(err => {

        if (err) {
            return res.status(500).json({
                error: "Fee database setup failed",
                details: err.message
            });
        }

        db.get(
            `
            SELECT
                COALESCE(SUM(monthly_fee), 0) AS expectedFees,
                COALESCE(SUM(paid_amount), 0) AS collected,
                COALESCE(SUM(balance), 0) AS outstanding,
                COUNT(*) AS payments,
                COUNT(DISTINCT student_name) AS studentsWithFees
            FROM fees
            `,
            [],
            (err, row) => {

                if (err) {
                    return res.status(500).json({
                        error: "Failed to load fee summary",
                        details: err.message
                    });
                }

                res.json({
                    expectedFees:
                        Number(row.expectedFees || 0),

                    collected:
                        Number(row.collected || 0),

                    outstanding:
                        Number(row.outstanding || 0),

                    payments:
                        Number(row.payments || 0),

                    studentsWithFees:
                        Number(row.studentsWithFees || 0)
                });

            }
        );

    });

});


/*
====================================================
CREATE FEE
====================================================
*/

app.post("/api/fees", (req, res) => {

    ensureFeeColumns(err => {

        if (err) {
            return res.status(500).json({
                error: "Fee database setup failed",
                details: err.message
            });
        }

        const {
            studentId,
            student_name,
            monthly_fee,
            paid_amount,
            payment_date,
            status,
            fee_month,
            payment_method,
            notes
        } = req.body;


        const monthlyFee =
            Number(monthly_fee || 0);

        const paidAmount =
            Number(paid_amount || 0);


        if (monthlyFee <= 0) {
            return res.status(400).json({
                error: "Monthly fee must be greater than zero"
            });
        }


        if (paidAmount < 0) {
            return res.status(400).json({
                error: "Paid amount cannot be negative"
            });
        }


        function saveFee(studentName) {

            const balance =
                Math.max(
                    monthlyFee - paidAmount,
                    0
                );


            let finalStatus =
                "Unpaid";


            if (paidAmount >= monthlyFee) {
                finalStatus = "Paid";
            } else if (paidAmount > 0) {
                finalStatus = "Partial";
            }


            db.run(
                `
                INSERT INTO fees
                (
                    student_name,
                    monthly_fee,
                    paid_amount,
                    balance,
                    payment_date,
                    status,
                    fee_month,
                    payment_method,
                    notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [
                    studentName,
                    monthlyFee,
                    paidAmount,
                    balance,
                    payment_date ||
                        new Date()
                            .toISOString()
                            .slice(0, 10),
                    finalStatus,
                    fee_month || "",
                    payment_method || "Cash",
                    notes || ""
                ],
                function (err) {

                    if (err) {

                        console.error(
                            "Create fee error:",
                            err.message
                        );

                        return res.status(500).json({
                            error: "Failed to save fee record",
                            details: err.message
                        });

                    }


                    res.json({
                        success: true,
                        message: "Fee record saved successfully",
                        id: this.lastID,
                        balance: balance,
                        status: finalStatus
                    });

                }
            );

        }


        /*
        If studentId is provided,
        get the real student name.
        */

        if (studentId) {

            db.get(
                `
                SELECT id, name
                FROM students
                WHERE id = ?
                `,
                [studentId],
                (err, student) => {

                    if (err) {
                        return res.status(500).json({
                            error: "Failed to find student",
                            details: err.message
                        });
                    }

                    if (!student) {
                        return res.status(404).json({
                            error: "Student not found"
                        });
                    }

                    saveFee(student.name);

                }
            );

        } else {

            if (!student_name) {
                return res.status(400).json({
                    error: "Student is required"
                });
            }

            saveFee(student_name);

        }

    });

});


/*
====================================================
DELETE FEE
====================================================
*/

app.delete("/api/fees/:id", (req, res) => {

    db.run(
        `
        DELETE FROM fees
        WHERE id = ?
        `,
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: "Failed to delete fee",
                    details: err.message
                });
            }

            if (this.changes === 0) {
                return res.status(404).json({
                    error: "Fee record not found"
                });
            }

            res.json({
                success: true,
                message: "Fee record deleted successfully"
            });

        }
    );

});


/*
====================================================
LOGIN
====================================================
*/

app.post("/api/login", (req, res) => {

    const {
        username,
        password
    } = req.body;

    if (!username || !password) {
        return res.status(400).json({
            error: "Username and password are required"
        });
    }

    db.get(
        `
        SELECT
            id,
            username,
            role,
            fullName,
            status
        FROM users
        WHERE username = ?
        AND password = ?
        `,
        [
            username,
            password
        ],
        (err, user) => {

            if (err) {
                return res.status(500).json({
                    error: "Login failed",
                    details: err.message
                });
            }

            if (!user) {
                return res.status(401).json({
                    error: "Invalid username or password"
                });
            }

            res.json({
                success: true,
                userId: user.id,
                username: user.username,
                role: user.role,
                fullName: user.fullName,
                status: user.status
            });

        }
    );

});


/*
====================================================
DASHBOARD
====================================================
*/

app.get("/api/dashboard", (req, res) => {

    const result = {
        totalStudents: 0,
        totalTeachers: 0,
        totalFees: 0,
        outstandingFees: 0
    };


    db.get(
        "SELECT COUNT(*) AS count FROM students",
        [],
        (err, studentRow) => {

            if (!err && studentRow) {
                result.totalStudents =
                    studentRow.count || 0;
            }


            db.get(
                "SELECT COUNT(*) AS count FROM teachers",
                [],
                (err, teacherRow) => {

                    if (!err && teacherRow) {
                        result.totalTeachers =
                            teacherRow.count || 0;
                    }


                    db.get(
                        `
                        SELECT
                            COALESCE(SUM(paid_amount), 0) AS collected,
                            COALESCE(SUM(balance), 0) AS outstanding
                        FROM fees
                        `,
                        [],
                        (err, feeRow) => {

                            if (!err && feeRow) {

                                result.totalFees =
                                    Number(
                                        feeRow.collected || 0
                                    );

                                result.outstandingFees =
                                    Number(
                                        feeRow.outstanding || 0
                                    );

                            }

                            res.json(result);

                        }
                    );

                }
            );

        }
    );

});


/*
====================================================
DATABASE DIAGNOSTIC
====================================================
*/

app.get("/api/database-check", (req, res) => {

    const result = {};

    db.get(
        "SELECT COUNT(*) AS count FROM students",
        [],
        (err, students) => {

            result.students =
                err
                    ? null
                    : students.count;

            db.get(
                "SELECT COUNT(*) AS count FROM teachers",
                [],
                (err, teachers) => {

                    result.teachers =
                        err
                            ? null
                            : teachers.count;

                    db.get(
                        "SELECT COUNT(*) AS count FROM fees",
                        [],
                        (err, fees) => {

                            result.fees =
                                err
                                    ? null
                                    : fees.count;

                            res.json({
                                success: true,
                                database: "markaz.db",
                                counts: result
                            });

                        }
                    );

                }
            );

        }
    );

});


/*
====================================================
START SERVER
====================================================
*/
// =====================================================
// TEMPORARY STUDENT RESTORE
// =====================================================

app.post("/api/restore-students", (req, res) => {
    const students = [
        {
            name: "Ahmed Ali",
            age: 14,
            enrollmentDate: "2026-01-15",
            teacher: "Ustaz Ibrahim",
            level: "Hifz"
        },
        {
            name: "gamachu",
            age: 16,
            enrollmentDate: "2026-10-03",
            teacher: "uztaz akram",
            level: "Intermediate"
        }
    ];

    db.get("SELECT COUNT(*) AS count FROM students", [], (countErr, row) => {
        if (countErr) {
            console.error(countErr);
            return res.status(500).json({
                success: false,
                error: countErr.message
            });
        }

        // Do not create duplicates
        if (row.count > 0) {
            return res.json({
                success: true,
                message: "Students already exist. Nothing was added.",
                count: row.count
            });
        }

        const stmt = db.prepare(`
            INSERT INTO students
            (name, age, enrollmentDate, teacher, level)
            VALUES (?, ?, ?, ?, ?)
        `);

        let completed = 0;
        let failed = false;

        students.forEach(student => {
            stmt.run(
                student.name,
                student.age,
                student.enrollmentDate,
                student.teacher,
                student.level,
                function (err) {
                    if (err && !failed) {
                        failed = true;

                        stmt.finalize();

                        return res.status(500).json({
                            success: false,
                            error: err.message
                        });
                    }

                    completed++;

                    if (completed === students.length && !failed) {
                        stmt.finalize(() => {
                            db.all(
                                "SELECT * FROM students ORDER BY id ASC",
                                [],
                                (selectErr, rows) => {
                                    if (selectErr) {
                                        return res.status(500).json({
                                            success: false,
                                            error: selectErr.message
                                        });
                                    }

                                    res.json({
                                        success: true,
                                        message: "Students restored successfully.",
                                        students: rows
                                    });
                                }
                            );
                        });
                    }
                }
            );
        });
    });
});
app.listen(PORT, "0.0.0.0", () => {

    console.log("=================================");
    console.log("   MARKAZ CONTROL SYSTEM");
    console.log("=================================");
    console.log("Server running on port " + PORT);
    console.log("Students API: /api/students");
    console.log("Fees API: /api/fees");
    console.log("Dashboard API: /api/dashboard");
    console.log("=================================");

});
