# Quiz

App de preguntas (Node.js + Express + MySQL).

## Cómo arrancarlo

    docker compose up --build

- App: http://localhost:30001
- Adminer: http://localhost:8080 (servidor `mysql-quiz`, usuario `root`, contraseña `1234`, base `quiz`)

La primera vez tarda ~1 minuto: se crea la base de datos y se cargan las preguntas automáticamente.
Para empezar de cero: `docker compose down -v`.