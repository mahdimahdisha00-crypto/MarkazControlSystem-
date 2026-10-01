const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./markaz.db", function (err) {
    if (err) {
        console.error("Database error:", err.message);
        return;
    }

    console.log("SQLite connected.");
});

const columns = [
    ["teacherId", "INTEGER"],
    ["halaqaId", "INTEGER"],
    ["recordDate", "TEXT"],
    ["type", "TEXT"],
    ["pageFrom", "INTEGER"],
    ["pageTo", "INTEGER"],
    ["tajweedMistakes", "TEXT"],
    ["memoryMistakes", "TEXT"],
    ["mutashabihat", "TEXT"],
    ["correctionNotes", "TEXT"],
    ["teacherNotes", "TEXT"],
    ["studentNotes", "TEXT"],
    ["reviewStatus", "TEXT"],
    ["createdAt", "TEXT"],
    ["updatedAt", "TEXT"]
];

db.serialize(function () {

    db.all("PRAGMA table_info(hifz)", function (err, existingColumns) {

        if (err) {
            console.error("Could not read Hifz table:", err.message);
            db.close();
            return;
        }

        const existingNames = existingColumns.map(function (column) {
            return column.name;
        });

        let remaining = columns.filter(function (column) {
            return !existingNames.includes(column[0]);
        });

        if (remaining.length === 0) {
            console.log("All Hifz columns already exist.");
            db.close();
            return;
        }

        function addNext() {

            if (remaining.length === 0) {
                console.log("---------------------------------");
                console.log("Hifz migration completed.");
                console.log("---------------------------------");

                db.all("PRAGMA table_info(hifz)", function (err, rows) {

                    if (err) {
                        console.error(err.message);
                    } else {
                        console.table(rows);
                    }

                    db.close();
                });

                return;
            }

            const column = remaining.shift();

            const sql =
                "ALTER TABLE hifz ADD COLUMN " +
                column[0] +
                " " +
                column[1];

            db.run(sql, function (err) {

                if (err) {
                    console.error(
                        "ERROR adding " +
                        column[0] +
                        ": " +
                        err.message
                    );
                } else {
                    console.log("Added: " + column[0]);
                }

                addNext();
            });
        }

        addNext();
    });
});