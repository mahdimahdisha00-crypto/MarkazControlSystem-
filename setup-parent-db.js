const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./markaz.db", (err) => {
    if (err) {
        console.error("Database error:", err.message);
        return;
    }

    console.log("Connected to Markaz Database");
});

db.serialize(() => {

    // Parents table
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
    `, (err) => {
        if (err) {
            console.error("Parents table error:", err.message);
        } else {
            console.log("Parents table ready");
        }
    });

    // Connect parents with students
    db.run(`
        CREATE TABLE IF NOT EXISTS student_parents (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            studentId INTEGER NOT NULL,
            parentId INTEGER NOT NULL,
            relationship TEXT,
            isPrimary INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error("Student parents table error:", err.message);
        } else {
            console.log("Student-parent relationship table ready");
        }
    });

    // Parent communication history
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
    `, (err) => {
        if (err) {
            console.error("Parent communications table error:", err.message);
        } else {
            console.log("Parent communications table ready");
        }
    });
});

setTimeout(() => {
    console.log("");
    console.log("=================================");
    console.log("Parent Database Setup Complete");
    console.log("=================================");
    db.close();
}, 1000);