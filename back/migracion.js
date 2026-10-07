const mysql = require('mysql2/promise');
const preguntas = require('./json1.json');
const respuestas = require('./respostes.json');

async function main() {
    const con = await mysql.createConnection({
        host: process.env.DB_HOST || "mysql-quiz",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || "quiz"
    });
    console.log("Connected!");

    // Si ja hi ha dades, no es torna a fer la migració
    const [rows] = await con.query("SELECT COUNT(*) AS total FROM preguntes");
    if (rows[0].total > 0) {
        console.log("La base de dades ja té dades, no cal migrar.");
        await con.end();
        return;
    }

    for (const pregunta of preguntas.preguntes) {
        await con.query(
            "INSERT INTO preguntes (id, pregunta, imatge) VALUES (?, ?, ?)",
            [pregunta.id, pregunta.pregunta, pregunta.imatge]
        );

        for (const resposta of pregunta.respostes) {
            const correcta = respuestas.respostes.some(
                r => r.id == pregunta.id && r.resposta_correcta == resposta.resposta
            );

            await con.query(
                "INSERT INTO respostes (id, pregunta_id, resposta, correcta) VALUES (?, ?, ?, ?)",
                [resposta.id, pregunta.id, resposta.resposta, correcta]
            );
        }
    }

    console.log("Migració feta!");
    await con.end();
}

main().catch(err => {
    console.error("Error a la migració:", err.message);
    process.exit(1);
});