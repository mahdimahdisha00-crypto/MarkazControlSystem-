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
app.use(express.static(path.join(__dirname, "public")));


// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});


// =====================================================
// LOGIN
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


// =====================================================
// SYSTEM STATUS
// =====================================================

app.get("/api/status", (req, res) => {

    res.json({
        system: "Markaz Control System",
        version: "4.0",
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


app.put("/api/students/:id", (req, res) => {

    const {
        name,
        age,
        enrollmentDate,
        teacher,
        level
    } = req.body;

    db.run(
        `UPDATE students
         SET name = ?,
             age = ?,
             enrollmentDate = ?,
             teacher = ?,
             level = ?
         WHERE id = ?`,
        [
            name || "",
            age || null,
            enrollmentDate || "",
            teacher || "",
            level || "",
            req.params.id
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                changes: this.changes
            });
        }
    );
});


app.delete("/api/students/:id", (req, res) => {

    db.run(
        "DELETE FROM students WHERE id = ?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                changes: this.changes
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


app.delete("/api/teachers/:id", (req, res) => {

    db.run(
        "DELETE FROM teachers WHERE id = ?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                changes: this.changes
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


app.post("/api/attendance", (req, res) => {

    const {
        studentId,
        date,
        status
    } = req.body;

    db.run(
        `INSERT INTO attendance
        (studentId, date, status)
        VALUES (?, ?, ?)`,
        [
            studentId || null,
            date || "",
            status || "Present"
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                attendanceId: this.lastID
            });
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
        `INSERT INTO hifz
        (studentId, surah, ayahFrom, ayahTo, juz, grade, logDate)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId || null,
            surah || "",
            ayahFrom || null,
            ayahTo || null,
            juz || null,
            grade || "",
            logDate || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                hifzId: this.lastID
            });
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
// FEES
// =====================================================

app.get("/api/fees", (req, res) => {

    const sql = `
        SELECT
            f.*,
            COALESCE(f.studentName, f.student_name) AS displayStudentName,
            COALESCE(f.monthlyFee, f.monthly_fee, 0) AS displayMonthlyFee,
            COALESCE(f.paidAmount, f.paid_amount, 0) AS displayPaidAmount,
            COALESCE(
                f.balance,
                COALESCE(f.monthlyFee, f.monthly_fee, 0)
                - COALESCE(f.paidAmount, f.paid_amount, 0)
            ) AS displayBalance
        FROM fees f
        ORDER BY f.id DESC
    `;

    db.all(sql, [], (err, rows) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        const result = rows.map(row => ({
            ...row,
            studentName: row.studentName || row.student_name || row.displayStudentName || "",
            monthlyFee: Number(row.monthlyFee ?? row.monthly_fee ?? 0),
            paidAmount: Number(row.paidAmount ?? row.paid_amount ?? 0),
            balance: Number(row.balance ?? row.displayBalance ?? 0)
        }));

        res.json(result);
    });
});


app.post("/api/fees", (req, res) => {

    const {
        studentId,
        studentName,
        feeMonth,
        monthlyFee,
        paidAmount,
        paymentDate,
        paymentMethod,
        notes
    } = req.body;

    const monthly = Number(monthlyFee) || 0;
    const paid = Number(paidAmount) || 0;

    const balance = Math.max(monthly - paid, 0);

    let status = "Unpaid";

    if (paid >= monthly && monthly > 0) {
        status = "Paid";
    } else if (paid > 0) {
        status = "Partial";
    }

    db.run(
        `INSERT INTO fees
        (
            studentId,
            studentName,
            student_name,
            feeMonth,
            monthlyFee,
            monthly_fee,
            paidAmount,
            paid_amount,
            balance,
            payment_date,
            paymentDate,
            paymentMethod,
            notes,
            status,
            createdAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
            studentId || null,
            studentName || "",
            studentName || "",
            feeMonth || "",
            monthly,
            monthly,
            paid,
            paid,
            balance,
            paymentDate || "",
            paymentDate || "",
            paymentMethod || "",
            notes || "",
            status
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const feeId = this.lastID;

            // Also create a payment record when an initial payment exists.
            if (paid > 0) {

                db.run(
                    `INSERT INTO payments
                    (
                        studentId,
                        studentName,
                        amount,
                        paymentDate,
                        paymentMethod,
                        reference,
                        feeMonth,
                        notes
                    )
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        studentId || null,
                        studentName || "",
                        paid,
                        paymentDate || "",
                        paymentMethod || "",
                        "",
                        feeMonth || "",
                        notes || ""
                    ],
                    function (paymentErr) {

                        if (paymentErr) {
                            console.error(
                                "Fee saved but payment record failed:",
                                paymentErr.message
                            );
                        }

                        res.json({
                            success: true,
                            feeId: feeId,
                            message: "Fee saved successfully"
                        });
                    }
                );

            } else {

                res.json({
                    success: true,
                    feeId: feeId,
                    message: "Fee saved successfully"
                });
            }
        }
    );
});


// =====================================================
// PAYMENTS
// =====================================================

app.get("/api/payments", (req, res) => {

    const sql = `
        SELECT
            p.*,
            COALESCE(s.name, p.studentName) AS studentName
        FROM payments p
        LEFT JOIN students s
            ON s.id = p.studentId
        ORDER BY p.id DESC
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


app.post("/api/payments", (req, res) => {

    const {
        studentId,
        studentName,
        amount,
        paymentDate,
        paymentMethod,
        reference,
        feeMonth,
        notes
    } = req.body;

    const paymentAmount = Number(amount) || 0;

    if (paymentAmount <= 0) {
        return res.status(400).json({
            error: "Payment amount must be greater than zero"
        });
    }

    db.run(
        `INSERT INTO payments
        (
            studentId,
            studentName,
            amount,
            paymentDate,
            paymentMethod,
            reference,
            feeMonth,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            studentId || null,
            studentName || "",
            paymentAmount,
            paymentDate || "",
            paymentMethod || "",
            reference || "",
            feeMonth || "",
            notes || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const paymentId = this.lastID;

            // Update matching fee.
            if (studentId && feeMonth) {

                db.get(
                    `SELECT *
                     FROM fees
                     WHERE studentId = ?
                     AND feeMonth = ?
                     ORDER BY id DESC
                     LIMIT 1`,
                    [studentId, feeMonth],
                    (feeErr, fee) => {

                        if (feeErr) {
                            return res.json({
                                success: true,
                                paymentId
                            });
                        }

                        if (!fee) {
                            return res.json({
                                success: true,
                                paymentId
                            });
                        }

                        const oldPaid = Number(
                            fee.paidAmount ?? fee.paid_amount ?? 0
                        );

                        const monthly = Number(
                            fee.monthlyFee ?? fee.monthly_fee ?? 0
                        );

                        const newPaid = oldPaid + paymentAmount;
                        const newBalance = Math.max(monthly - newPaid, 0);

                        let newStatus = "Unpaid";

                        if (newPaid >= monthly && monthly > 0) {
                            newStatus = "Paid";
                        } else if (newPaid > 0) {
                            newStatus = "Partial";
                        }

                        db.run(
                            `UPDATE fees
                             SET
                                paidAmount = ?,
                                paid_amount = ?,
                                balance = ?,
                                status = ?
                             WHERE id = ?`,
                            [
                                newPaid,
                                newPaid,
                                newBalance,
                                newStatus,
                                fee.id
                            ],
                            () => {

                                res.json({
                                    success: true,
                                    paymentId
                                });

                            }
                        );

                    }
                );

            } else {

                res.json({
                    success: true,
                    paymentId
                });

            }
        }
    );
});


app.delete("/api/payments/:id", (req, res) => {

    db.get(
        "SELECT * FROM payments WHERE id = ?",
        [req.params.id],
        (findErr, payment) => {

            if (findErr) {
                return res.status(500).json({
                    error: findErr.message
                });
            }

            if (!payment) {
                return res.status(404).json({
                    error: "Payment not found"
                });
            }

            db.run(
                "DELETE FROM payments WHERE id = ?",
                [req.params.id],
                function (err) {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    res.json({
                        success: true,
                        changes: this.changes
                    });
                }
            );
        }
    );
});


// =====================================================
// DONATIONS
// =====================================================

app.get("/api/donations", (req, res) => {

    db.all(
        "SELECT * FROM donations ORDER BY id DESC",
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


app.post("/api/donations", (req, res) => {

    const {
        donorName,
        donationDate,
        amount,
        donationType,
        paymentMethod,
        reference,
        notes
    } = req.body;

    const donationAmount = Number(amount) || 0;

    if (donationAmount <= 0) {
        return res.status(400).json({
            error: "Donation amount must be greater than zero"
        });
    }

    db.run(
        `INSERT INTO donations
        (
            donorName,
            donationDate,
            amount,
            donationType,
            paymentMethod,
            reference,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
            donorName || "",
            donationDate || "",
            donationAmount,
            donationType || "",
            paymentMethod || "",
            reference || "",
            notes || ""
        ],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                donationId: this.lastID,
                message: "Donation saved successfully"
            });
        }
    );
});


app.delete("/api/donations/:id", (req, res) => {

    db.run(
        "DELETE FROM donations WHERE id = ?",
        [req.params.id],
        function (err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                success: true,
                changes: this.changes
            });
        }
    );
});


// =====================================================
// PARENTS
// =====================================================

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
                id: this.lastID
            });
        }
    );
});


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

                res.json({
                    success: true,
                    changes: this.changes
                });
            }
        );
    });
});


// =====================================================
// STUDENT ↔ PARENT
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
                id: this.lastID
            });
        }
    );
});


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
// PARENT COMMUNICATION
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

            res.json({
                success: true,
                changes: this.changes
            });
        }
    );
});


// =====================================================
// DASHBOARD
// =====================================================

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

                    db.get(
                        `SELECT
                            COALESCE(SUM(monthlyFee),0) AS expectedFees,
                            COALESCE(SUM(paidAmount),0) AS collectedFees,
                            COALESCE(SUM(balance),0) AS outstandingFees
                         FROM fees`,
                        [],
                        (err3, financialData) => {

                            if (err3) {
                                return res.status(500).json({
                                    error: err3.message
                                });
                            }

                            db.get(
                                `SELECT COALESCE(SUM(amount),0) AS donations
                                 FROM donations`,
                                [],
                                (err4, donationData) => {

                                    if (err4) {
                                        return res.status(500).json({
                                            error: err4.message
                                        });
                                    }

                                    res.json({
                                        totalStudents: studentData.totalStudents,
                                        totalTeachers: teacherData.totalTeachers,
                                        expectedFees: financialData.expectedFees,
                                        collectedFees: financialData.collectedFees,
                                        outstandingFees: financialData.outstandingFees,
                                        donations: donationData.donations
                                    });

                                }
                            );

                        }
                    );

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
