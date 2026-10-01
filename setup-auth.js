const readline = require("readline");
const bcrypt = require("bcryptjs");
const db = require("./database");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function ask(question) {
    return new Promise((resolve) => {
        rl.question(question, resolve);
    });
}

async function main() {

    console.log("");
    console.log("==========================================");
    console.log("   MARKAZ CONTROL SYSTEM");
    console.log("   Secure Password Setup");
    console.log("==========================================");
    console.log("");

    const username = (await ask("Username: ")).trim();

    if (!username) {
        console.log("Username is required.");
        rl.close();
        db.close();
        return;
    }

    db.get(
        "SELECT id, username, role, status FROM users WHERE username = ?",
        [username],
        async (err, user) => {

            if (err) {
                console.error("Database error:", err.message);
                rl.close();
                db.close();
                return;
            }

            if (!user) {
                console.log("");
                console.log("User not found.");
                console.log("Available accounts:");

                db.all(
                    "SELECT username, role, status FROM users ORDER BY id",
                    [],
                    (listErr, rows) => {

                        if (!listErr) {
                            rows.forEach((row) => {
                                console.log(
                                    " - " +
                                    row.username +
                                    " (" +
                                    row.role +
                                    ", " +
                                    row.status +
                                    ")"
                                );
                            });
                        }

                        rl.close();
                        db.close();
                    }
                );

                return;
            }

            console.log("");
            console.log("Account found:");
            console.log("Username :", user.username);
            console.log("Role     :", user.role);
            console.log("Status   :", user.status);
            console.log("");

            const password = await ask("New password: ");

            if (!password || password.length < 6) {
                console.log("");
                console.log("Password must contain at least 6 characters.");
                rl.close();
                db.close();
                return;
            }

            const confirmPassword = await ask("Confirm password: ");

            if (password !== confirmPassword) {
                console.log("");
                console.log("Passwords do not match.");
                rl.close();
                db.close();
                return;
            }

            try {

                const hash = await bcrypt.hash(password, 12);

                db.run(
                    `UPDATE users
                     SET password = ?,
                         status = 'Active'
                     WHERE id = ?`,
                    [hash, user.id],
                    function (updateErr) {

                        if (updateErr) {
                            console.error(
                                "Password update failed:",
                                updateErr.message
                            );
                        } else {

                            console.log("");
                            console.log("==========================================");
                            console.log("PASSWORD UPDATED SUCCESSFULLY");
                            console.log("==========================================");
                            console.log("");
                            console.log("Username:", user.username);
                            console.log("Role:", user.role);
                            console.log("");
                            console.log(
                                "You can now use this username and password"
                            );
                            console.log("on the Markaz login page.");
                            console.log("");
                        }

                        rl.close();
                        db.close();
                    }
                );

            } catch (hashError) {

                console.error(
                    "Password encryption failed:",
                    hashError.message
                );

                rl.close();
                db.close();
            }
        }
    );
}

main();