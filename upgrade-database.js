const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./markaz.db", (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
        process.exit(1);
    }

    console.log("Connected to Markaz Database");
});

function getColumns(table) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${table})`, (err, rows) => {
            if (err) reject(err);
            else resolve(rows.map(row => row.name));
        });
    });
}

function addColumn(table, column, definition) {
    return new Promise(async (resolve, reject) => {
        try {
            const columns = await getColumns(table);

            if (columns.includes(column)) {
                console.log(`✓ ${table}.${column} already exists`);
                resolve();
                return;
            }

            db.run(
                `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
                (err) => {
                    if (err) {
                        console.error(
                            `✗ Could not add ${table}.${column}:`,
                            err.message
                        );
                        reject(err);
                    } else {
                        console.log(`+ Added ${table}.${column}`);
                        resolve();
                    }
                }
            );
        } catch (err) {
            reject(err);
        }
    });
}

async function upgradeDatabase() {
    try {
        console.log("");
        console.log("======================================");
        console.log(" MARKAZ DATABASE UPGRADE");
        console.log("======================================");
        console.log("");

        // ==============================
        // STUDENTS
        // ==============================

        await addColumn("students", "age", "INTEGER");
        await addColumn("students", "enrollmentDate", "TEXT");
        await addColumn("students", "level", "TEXT");
        await addColumn("students", "phone", "TEXT");
        await addColumn("students", "address", "TEXT");
        await addColumn("students", "status", "TEXT DEFAULT 'Active'");
        await addColumn("students", "gender", "TEXT");
        await addColumn("students", "parentContact", "TEXT");
        await addColumn("students", "notes", "TEXT");
        await addColumn("students", "createdAt", "TEXT");
        await addColumn("students", "updatedAt", "TEXT");

        // ==============================
        // TEACHERS
        // ==============================

        await addColumn("teachers", "email", "TEXT");
        await addColumn("teachers", "address", "TEXT");
        await addColumn("teachers", "specialization", "TEXT");
        await addColumn("teachers", "status", "TEXT DEFAULT 'Active'");
        await addColumn("teachers", "joinDate", "TEXT");
        await addColumn("teachers", "notes", "TEXT");
        await addColumn("teachers", "createdAt", "TEXT");
        await addColumn("teachers", "updatedAt", "TEXT");

        // ==============================
        // USERS
        // ==============================

        await addColumn("users", "fullName", "TEXT");
        await addColumn("users", "phone", "TEXT");
        await addColumn("users", "email", "TEXT");
        await addColumn("users", "status", "TEXT DEFAULT 'Active'");
        await addColumn("users", "createdAt", "TEXT");
        await addColumn("users", "lastLogin", "TEXT");

        // ==============================
        // ATTENDANCE
        // ==============================

        await addColumn("attendance", "teacherId", "INTEGER");
        await addColumn("attendance", "attendanceType", "TEXT DEFAULT 'Student'");
        await addColumn("attendance", "notes", "TEXT");
        await addColumn("attendance", "createdAt", "TEXT");

        // ==============================
        // EXAMS
        // ==============================

        await addColumn("exams", "createdAt", "TEXT");
        await addColumn("exams", "updatedAt", "TEXT");

        // ==============================
        // KHATM
        // ==============================

        await addColumn("khatm_records", "createdAt", "TEXT");
        await addColumn("khatm_records", "updatedAt", "TEXT");

        // ==============================
        // FEES
        // ==============================

        await addColumn("fees", "studentId", "INTEGER");
        await addColumn("fees", "feeMonth", "TEXT");
        await addColumn("fees", "paymentMethod", "TEXT");
        await addColumn("fees", "receiptNumber", "TEXT");
        await addColumn("fees", "notes", "TEXT");
        await addColumn("fees", "createdAt", "TEXT");

        // ==============================
        // HIFZ RECORDS
        // ==============================

        await addColumn("hifz_records", "juz", "INTEGER");
        await addColumn("hifz_records", "pageFrom", "INTEGER");
        await addColumn("hifz_records", "pageTo", "INTEGER");
        await addColumn("hifz_records", "teacherId", "INTEGER");
        await addColumn("hifz_records", "recordDate", "TEXT");
        await addColumn("hifz_records", "tajweedMistakes", "TEXT");
        await addColumn("hifz_records", "memoryMistakes", "TEXT");
        await addColumn("hifz_records", "teacherNotes", "TEXT");
        await addColumn("hifz_records", "createdAt", "TEXT");

        // ==============================
        // ACTIVITY LOGS
        // ==============================

        await addColumn("activity_logs", "userId", "INTEGER");
        await addColumn("activity_logs", "details", "TEXT");
        await addColumn("activity_logs", "ipAddress", "TEXT");

        // ==============================
        // PARENTS
        // ==============================

        await addColumn("parents", "status", "TEXT DEFAULT 'Active'");
        await addColumn("parents", "notes", "TEXT");
        await addColumn("parents", "updatedAt", "TEXT");

        // ==============================
        // SYSTEM SETTINGS
        // ==============================

        await addColumn("system_settings", "logo", "TEXT");
        await addColumn("system_settings", "currency", "TEXT DEFAULT 'ETB'");
        await addColumn("system_settings", "timezone", "TEXT DEFAULT 'Africa/Addis_Ababa'");

        // ==============================
        // CREATE PAYMENTS TABLE
        // ==============================

        db.run(`
            CREATE TABLE IF NOT EXISTS payments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                studentId INTEGER,
                studentName TEXT,
                amount REAL NOT NULL,
                paymentDate TEXT,
                paymentMethod TEXT,
                receiptNumber TEXT,
                feeMonth TEXT,
                notes TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ==============================
        // CREATE DONATIONS TABLE
        // ==============================

        db.run(`
            CREATE TABLE IF NOT EXISTS donations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                donorName TEXT,
                phone TEXT,
                amount REAL NOT NULL,
                donationDate TEXT,
                donationType TEXT,
                paymentMethod TEXT,
                notes TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ==============================
        // CREATE HALAQA TABLE
        // ==============================

        db.run(`
            CREATE TABLE IF NOT EXISTS halaqas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                teacherId INTEGER,
                level TEXT,
                room TEXT,
                schedule TEXT,
                status TEXT DEFAULT 'Active',
                notes TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
                updatedAt TEXT
            )
        `);

        // ==============================
        // CREATE TEACHER ATTENDANCE
        // ==============================

        db.run(`
            CREATE TABLE IF NOT EXISTS teacher_attendance (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                teacherId INTEGER,
                date TEXT,
                status TEXT,
                notes TEXT,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ==============================
        // CREATE USER PERMISSIONS
        // ==============================

        db.run(`
            CREATE TABLE IF NOT EXISTS user_permissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                userId INTEGER NOT NULL,
                module TEXT NOT NULL,
                canView INTEGER DEFAULT 1,
                canCreate INTEGER DEFAULT 0,
                canEdit INTEGER DEFAULT 0,
                canDelete INTEGER DEFAULT 0,
                createdAt TEXT DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // ==============================
        // CREATE BACKUP LOG
        // ==============================

        db.run(`
            CREATE TABLE IF NOT EXISTS backup_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fileName TEXT,
                backupDate TEXT DEFAULT CURRENT_TIMESTAMP,
                createdBy TEXT,
                status TEXT
            )
        `);

        console.log("");
        console.log("======================================");
        console.log(" DATABASE UPGRADE COMPLETED");
        console.log("======================================");
        console.log("");
        console.log("Existing data was preserved.");
        console.log("New tables and columns are ready.");
        console.log("");

        setTimeout(() => {
            db.close(() => {
                console.log("Database connection closed.");
            });
        }, 1000);

    } catch (err) {
        console.error("");
        console.error("DATABASE UPGRADE FAILED:");
        console.error(err.message);
        console.error("");
        db.close();
    }
}

upgradeDatabase();