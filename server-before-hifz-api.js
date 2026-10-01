const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const db = require("./database");

const app = express();
const PORT = process.env.PORT || 5000;

// ==============================
// MIDDLEWARE
// ==============================

app.use(cors());
app.use(express.json());

// Serve HTML files from project folder
app.use(express.static(__dirname));


// ==============================
// HOME
// ==============================

app.get("/", (req, res) => {
  res.json({
    name: "Markaz Control System",
    status: "Running Successfully"
  });
});


// ==============================
// API TEST
// ==============================

app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    app: "Markaz Control System",
    message: "API Working Successfully",
    time: new Date().toISOString()
  });
});


// ==============================
// LOGIN
// ==============================

app.post("/api/login", (req, res) => {

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  db.get(
    "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, user) => {

      if (err) {
        return res.status(500).json({
          success: false,
          error: err.message
        });
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password"
        });
      }

      res.json({
        success: true,
        message: "Login successful",
        userId: user.id,
        username: user.username,
        role: user.role
      });
    }
  );
});


// ==============================
// STUDENTS
// ==============================

// Get students
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


// Add student
app.post("/api/students", (req, res) => {

  const {
    name,
    currentJuz,
    teacher
  } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Student name is required"
    });
  }

  db.run(
    `INSERT INTO students
    (name, currentJuz, teacher)
    VALUES (?, ?, ?)`,
    [
      name,
      currentJuz || 0,
      teacher || ""
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Student added successfully",
        studentId: this.lastID
      });
    }
  );
});


// Update student
app.put("/api/students/:id", (req, res) => {

  const { id } = req.params;

  const {
    name,
    currentJuz,
    teacher
  } = req.body;

  db.run(
    `UPDATE students
     SET name = ?, currentJuz = ?, teacher = ?
     WHERE id = ?`,
    [
      name,
      currentJuz,
      teacher,
      id
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Student updated successfully"
      });
    }
  );
});


// Delete student
app.delete("/api/students/:id", (req, res) => {

  const { id } = req.params;

  db.run(
    "DELETE FROM students WHERE id = ?",
    [id],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Student deleted successfully"
      });
    }
  );
});


// Search student
app.get("/api/search-student", (req, res) => {

  const name = req.query.name || "";

  db.all(
    "SELECT * FROM students WHERE name LIKE ? ORDER BY name",
    [`%${name}%`],
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


// ==============================
// TEACHERS
// ==============================

// Get teachers
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


// Add teacher
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
        message: "Teacher added successfully",
        teacherId: this.lastID
      });
    }
  );
});


// Update teacher
app.put("/api/teachers/:id", (req, res) => {

  const { id } = req.params;

  const {
    name,
    phone,
    qualification
  } = req.body;

  db.run(
    `UPDATE teachers
     SET name = ?, phone = ?, qualification = ?
     WHERE id = ?`,
    [
      name,
      phone,
      qualification,
      id
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Teacher updated successfully"
      });
    }
  );
});


// Delete teacher
app.delete("/api/teachers/:id", (req, res) => {

  const { id } = req.params;

  db.run(
    "DELETE FROM teachers WHERE id = ?",
    [id],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Teacher deleted successfully"
      });
    }
  );
});


// ==============================
// ATTENDANCE
// ==============================

// Get attendance
app.get("/api/attendance", (req, res) => {

  db.all(
    "SELECT * FROM attendance ORDER BY date DESC, id DESC",
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


// Add attendance
app.post("/api/attendance", (req, res) => {

  const {
    studentId,
    date,
    status
  } = req.body;

  if (!studentId || !date || !status) {
    return res.status(400).json({
      error: "Student, date and status are required"
    });
  }

  db.run(
    `INSERT INTO attendance
    (studentId, date, status)
    VALUES (?, ?, ?)`,
    [
      studentId,
      date,
      status
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Attendance saved successfully",
        attendanceId: this.lastID
      });
    }
  );
});


// ==============================
// HIFZ RECORDS
// ==============================

// Get Hifz records
app.get("/api/hifz-records", (req, res) => {

  db.all(
    "SELECT * FROM hifz_records ORDER BY id DESC",
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


// Add Hifz record
app.post("/api/hifz-records", (req, res) => {

  const {
    studentId,
    surah,
    ayahFrom,
    ayahTo,
    lessonType,
    grade
  } = req.body;

  if (!studentId || !surah) {
    return res.status(400).json({
      error: "Student and Surah are required"
    });
  }

  db.run(
    `INSERT INTO hifz_records
    (studentId, surah, ayahFrom, ayahTo, lessonType, grade)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      studentId,
      surah,
      ayahFrom || 0,
      ayahTo || 0,
      lessonType || "",
      grade || ""
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Hifz record saved successfully",
        recordId: this.lastID
      });
    }
  );
});


// ==============================
// FEES
// ==============================

// Get fees
app.get("/api/fees", (req, res) => {

  db.all(
    "SELECT * FROM fees ORDER BY id DESC",
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


// Add fee
app.post("/api/fees", (req, res) => {

  const {
    student_name,
    monthly_fee,
    paid_amount,
    balance,
    payment_date,
    status
  } = req.body;

  if (!student_name) {
    return res.status(400).json({
      error: "Student name is required"
    });
  }

  db.run(
    `INSERT INTO fees
    (
      student_name,
      monthly_fee,
      paid_amount,
      balance,
      payment_date,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?)`,
    [
      student_name,
      monthly_fee || 0,
      paid_amount || 0,
      balance || 0,
      payment_date || "",
      status || "Unpaid"
    ],
    function (err) {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      res.json({
        success: true,
        message: "Fee saved successfully",
        feeId: this.lastID
      });
    }
  );
});


// ==============================
// DASHBOARD
// ==============================

app.get("/api/dashboard", (req, res) => {

  db.get(
    "SELECT COUNT(*) AS totalStudents FROM students",
    [],
    (err, students) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      db.get(
        "SELECT COUNT(*) AS totalTeachers FROM teachers",
        [],
        (err, teachers) => {

          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          db.get(
            "SELECT COUNT(*) AS totalAttendance FROM attendance",
            [],
            (err, attendance) => {

              if (err) {
                return res.status(500).json({
                  error: err.message
                });
              }

              db.get(
                "SELECT COUNT(*) AS totalHifzRecords FROM hifz_records",
                [],
                (err, hifz) => {

                  if (err) {
                    return res.status(500).json({
                      error: err.message
                    });
                  }

                  db.get(
                    "SELECT COUNT(*) AS totalFees FROM fees",
                    [],
                    (err, fees) => {

                      if (err) {
                        return res.status(500).json({
                          error: err.message
                        });
                      }

                      res.json({
                        totalStudents: students.totalStudents,
                        totalTeachers: teachers.totalTeachers,
                        totalAttendance: attendance.totalAttendance,
                        totalHifzRecords: hifz.totalHifzRecords,
                        totalFees: fees.totalFees
                      });

                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
});


// ==============================
// EXPORT DATA
// ==============================

app.get("/api/export", (req, res) => {

  const data = {
    students: [],
    teachers: [],
    attendance: [],
    hifz_records: [],
    fees: []
  };

  db.all("SELECT * FROM students", [], (err, students) => {

    if (err) {
      return res.status(500).json({
        error: err.message
      });
    }

    data.students = students;

    db.all("SELECT * FROM teachers", [], (err, teachers) => {

      if (err) {
        return res.status(500).json({
          error: err.message
        });
      }

      data.teachers = teachers;

      db.all("SELECT * FROM attendance", [], (err, attendance) => {

        if (err) {
          return res.status(500).json({
            error: err.message
          });
        }

        data.attendance = attendance;

        db.all("SELECT * FROM hifz_records", [], (err, hifz) => {

          if (err) {
            return res.status(500).json({
              error: err.message
            });
          }

          data.hifz_records = hifz;

          db.all("SELECT * FROM fees", [], (err, fees) => {

            if (err) {
              return res.status(500).json({
                error: err.message
              });
            }

            data.fees = fees;

            res.json(data);
          });
        });
      });
    });
  });
});


// ==============================
// DATABASE BACKUP
// ==============================

app.get("/api/backup", (req, res) => {

  const source = path.join(__dirname, "markaz.db");
  const destination = path.join(__dirname, "markaz_backup.db");

  fs.copyFile(source, destination, (err) => {

    if (err) {
      return res.status(500).json({
        success: false,
        error: err.message
      });
    }

    res.json({
      success: true,
      message: "Backup created successfully"
    });
  });
});


// ==============================
// START SERVER
// ==============================

app.listen(PORT, "0.0.0.0", () => {

  console.log("=================================");
  console.log("Markaz Control System");
  console.log("Server running on port " + PORT);
  console.log("=================================");

});