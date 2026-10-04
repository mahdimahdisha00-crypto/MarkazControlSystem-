const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

/*
====================================================
DATABASE LOCATION
====================================================
*/

const databasePath = path.join(__dirname, "markaz.db");

console.log("Database location:");
console.log(databasePath);

const db = new sqlite3.Database(databasePath, (err) => {

    if (err) {
        console.error(
            "Database connection error:",
            err.message
        );
        return;
    }

    console.log("Connected to Markaz Database");

});


/*
====================================================
DATABASE TABLES
====================================================
*/

db.serialize(() => {


    /*
    STUDENTS
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            enrollmentDate TEXT,
            teacher TEXT,
            level TEXT
        )
    `);


    /*
    TEACHERS
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT,
            qualification TEXT
        )
    `);


    /*
    ATTENDANCE
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS attendance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            date TEXT,
            status TEXT
        )
    `);


    /*
    HIFZ
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS hifz (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            surah TEXT,
            ayahFrom INTEGER,
            ayahTo INTEGER,
            juz INTEGER,
            grade TEXT,
            logDate TEXT
        )
    `);


    /*
    EXAMS
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS exams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            examDate TEXT,
            examType TEXT,
            examiner TEXT,
            surah TEXT,
            juz INTEGER,
            score REAL,
            grade TEXT,
            result TEXT,
            remarks TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /*
    KHATM
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS khatm_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER,
            startDate TEXT,
            completionDate TEXT,
            teacher TEXT,
            totalJuz INTEGER,
            status TEXT,
            certificateNumber TEXT,
            remarks TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /*
    PARENTS
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS parents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            relationship TEXT,
            phone TEXT,
            whatsapp TEXT,
            email TEXT,
            address TEXT,
            preferredContact TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /*
    STUDENT ↔ PARENT
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS student_parents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            parentId INTEGER NOT NULL,
            relationship TEXT,
            isPrimary INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /*
    PARENT COMMUNICATION
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS parent_communications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            parentId INTEGER,
            studentId INTEGER,
            messageType TEXT,
            message TEXT,
            contactMethod TEXT,
            communicationDate TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT DEFAULT 'Sent'
        )
    `);


    /*
    USERS
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT,
            fullName TEXT,
            status TEXT DEFAULT 'Active',
            phone TEXT,
            lastLogin TEXT,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /*
    ACTIVITY LOGS
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            action TEXT,
            logDate TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /*
    SYSTEM SETTINGS
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS system_settings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            markazName TEXT,
            address TEXT,
            phone TEXT,
            email TEXT,
            academicYear TEXT,
            updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);


    /*
    FEES
    */

    db.run(`
        CREATE TABLE IF NOT EXISTS fees (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT,
            monthly_fee REAL,
            paid_amount REAL,
            balance REAL,
            payment_date TEXT,
            status TEXT,
            fee_month TEXT,
            payment_method TEXT,
            notes TEXT
        )
    `);

});


/*
====================================================
EXPORT DATABASE
====================================================
*/

module.exports = db;
