const { v4: uuidv4 } = require('uuid');
const express = require('express');
const app = express();
const port = Number(process.argv[2]) || 30001;
const sessions = new Map();
const selectedQuestions = new Map();
const mysql = require('mysql2');

let clientQuestions;
let preguntasEnviadas;
let id = uuidv4();

console.log(id);
console.log(sessions);
console.log(sessions.has(id));

app.use(express.static('public'));
app.use(express.json());

const con = mysql.createConnection({
    host: process.env.DB_HOST || "mysql-quiz",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "quiz"
});

con.connect((err) => {
    if (err) {
        console.error('Error de conexión:', err);
        return;
    }

    console.log('Conectado');

    con.query(`
        SELECT
            p.id,
            p.pregunta,
            p.imatge,
            r.id AS resposta_id,
            r.resposta
        FROM preguntes p
        JOIN respostes r ON r.pregunta_id = p.id
    `, (err, results) => {
        if (err) {
            console.error('Error obteniendo preguntas:', err);
            return;
        }

        console.log('Preguntas obtenidas de la base de datos');

        clientQuestions = {};

        for (let fila of results) {
            if (!clientQuestions[fila.id]) {
                clientQuestions[fila.id] = {
                    id: fila.id,
                    pregunta: fila.pregunta,
                    imatge: fila.imatge,
                    respostes: []
                };
            }

            clientQuestions[fila.id].respostes.push({
                id: fila.resposta_id,
                resposta: fila.resposta
            });
        }

        clientQuestions = Object.values(clientQuestions);
        preguntasEnviadas = preguntasRandom(clientQuestions);

        console.log('Preguntas enviadas para randomizar');
    });
});

function preguntasRandom(preguntas) {
    return preguntas
        .sort(() => Math.random() - 0.5)
        .slice(0, 10);
}

function obtenirPreguntes(callback) {
    con.query(`
        SELECT
            p.id,
            p.pregunta,
            p.imatge,
            r.id AS resposta_id,
            r.resposta,
            r.correcta
        FROM preguntes p
        LEFT JOIN respostes r ON r.pregunta_id = p.id
        ORDER BY p.id, r.id
    `, (err, results) => {
        if (err) {
            callback(err);
            return;
        }

        let preguntes = {};

        for (let fila of results) {
            if (!preguntes[fila.id]) {
                preguntes[fila.id] = {
                    id: fila.id,
                    pregunta: fila.pregunta,
                    imatge: fila.imatge,
                    respostes: []
                };
            }

            if (fila.resposta_id !== null) {
                preguntes[fila.id].respostes.push({
                    id: fila.resposta_id,
                    resposta: fila.resposta,
                    correcta: fila.correcta
                });
            }
        }

        callback(null, Object.values(preguntes));
    });
}

function guardarRespostes(respostes, idPregunta, i, callback) {

    if (i >= respostes.length) {
        callback(null);
        return;
    }

    let resposta = respostes[i];

    con.query(
        'INSERT INTO respostes (id, pregunta_id, resposta, correcta) VALUES (?, ?, ?, ?)',
        [i + 1, idPregunta, resposta.resposta, resposta.correcta],
        (err) => {

            if (err) {
                console.log("ERROR AL GUARDAR RESPUESTA:", err);
                callback(err);
                return;
            }

            guardarRespostes(respostes, idPregunta, i + 1, callback);
        }
    );
}

function actualitzarRespostes(respostes, idPregunta, i, callback) {
    if (i >= respostes.length) {
        callback(null);
        return;
    }
    

    let resposta = respostes[i];

    console.log(resposta);

    con.query(
        'UPDATE respostes SET resposta = ?, correcta = ? WHERE id = ? AND pregunta_id = ?',
        [resposta.resposta, resposta.correcta, resposta.id, idPregunta],
        (err) => {
            if (err) {
                callback(err);
                return;
            }

            actualitzarRespostes(respostes, idPregunta, i + 1, callback);
        }
    );
}

function crearPregunta(req, res) {

    console.log("ESTOY EN crearPregunta");

    let pregunta = req.body;

    con.query(
        'INSERT INTO preguntes (pregunta, imatge) VALUES (?, ?)',
        [pregunta.pregunta, pregunta.imatge],
        (err, result) => {

            if (err) {
                console.log("ERROR AL CREAR PREGUNTA:", err);
                res.status(500).json({ error: err.message });
                return;
            }

            console.log("PREGUNTA CREADA");

            let idPregunta = result.insertId;

            guardarRespostes(pregunta.respostes, idPregunta, 0, (err) => {

                if (err) {
                    console.log("ERROR AL GUARDAR RESPUESTAS:", err);
                    res.status(500).json({ error: err.message });
                    return;
                }

                console.log("RESPUESTAS CREADAS");

                res.status(201).json({
                    mensaje: 'Pregunta creada correctamente',
                    id: idPregunta
                });
            });
        }
    );
}

function modificarPregunta(req, res) {
    let idPregunta = req.params.id;
    let pregunta = req.body;

    con.query(
        'UPDATE preguntes SET pregunta = ?, imatge = ? WHERE id = ?',
        [pregunta.pregunta, pregunta.imatge, idPregunta],
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            actualitzarRespostes(pregunta.respostes, idPregunta, 0, (err) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }

                res.json({ mensaje: 'Pregunta actualizada correctamente' });
            });
        }
    );
}

function eliminarPregunta(req, res) {
    let idPregunta = req.params.id;

    con.query(
        'DELETE FROM respostes WHERE pregunta_id = ?',
        [idPregunta],
        (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            con.query(
                'DELETE FROM preguntes WHERE id = ?',
                [idPregunta],
                (err) => {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }

                    res.json({ mensaje: 'Pregunta eliminada correctamente' });
                }
            );
        }
    );
}

function enviarResultado(req, res) {
    let respuestasUsuario = req.body.respostesUsuari;
    let sessionId = req.body.sessionId;

    if (!Array.isArray(respuestasUsuario)) {
        res.status(400).json({ error: 'Las respuestas no son válidas' });
        return;
    }

    let correctas = new Set();

    con.query(
        'SELECT pregunta_id, id FROM respostes WHERE correcta = 1',
        (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }

            for (let respuesta of results) {
                correctas.add(`${respuesta.pregunta_id}-${respuesta.id}`);
            }

            let puntuacion = 0;

            for (let respuesta of respuestasUsuario) {
                if (respuesta === null) {
                    continue;
                }

                if (correctas.has(`${respuesta.ID}-${respuesta.Respuesta}`)) {
                    puntuacion++;
                }
            }

            res.json({
                puntuacion: puntuacion,
                total: respuestasUsuario.filter(r => r !== null).length
            });
        }
    );
}

app.get('/json1', (req, res) => {
    let sessionId = uuidv4();

    let preguntas = preguntasRandom(clientQuestions);

    selectedQuestions.set(sessionId, preguntas);
    sessions.set(sessionId, true);

    res.json({
        sessionId: sessionId,
        preguntes: preguntas
    });
});

app.post('/preguntes', (req, res) => {

    console.log("HE RECIBIDO POST /preguntes");

    crearPregunta(req, res);

});

app.post('/respostes', (req, res) => {
    enviarResultado(req, res);
});

app.get('/preguntes', (req, res) => {
    obtenirPreguntes((err, preguntes) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }

        res.json(preguntes);
    });
});


app.put('/preguntes/:id', modificarPregunta);

app.delete('/preguntes/:id', eliminarPregunta);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});

