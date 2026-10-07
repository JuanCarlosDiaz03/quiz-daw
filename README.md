# Quiz

App de preguntas desarrollada con Node.js, Express y MySQL.

## Tecnologías

- Node.js
- Express
- MySQL
- Docker
- Bootstrap

## Cómo arrancarlo

```bash
docker compose up --build
```

- App: [http://localhost:30001](http://localhost:30001)
- Adminer: [http://localhost:8080](http://localhost:8080)

Datos de acceso a Adminer:

- Servidor: `mysql-quiz`
- Usuario: `root`
- Contraseña: `1234`
- Base de datos: `quiz`

La primera vez puede tardar aproximadamente 1 minuto, ya que se crea la base de datos y se cargan las preguntas automáticamente.

Para empezar de cero y eliminar los datos de Docker:

```bash
docker compose down -v
```
