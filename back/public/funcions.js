//------------------------------------------------- VARIABLES GLOBALES 
const NPRG = 10;
let nombreLS;
let contador;
let preguntaActual = 0;

let estatDeLaPartida = { 
    contadorPreguntes: 0, 
    respostesUsuari: new Array(NPRG).fill(null) // Inicializado correctamente
}; 

let arrayPreguntes = [];
let sessionId; 


//-------------------------------------------- FUNCIONES ----------------------------------

function marcar(pregunta, opcion, id) {
    console.log(`Opción ${opcion} de la pregunta ${pregunta} escogida`);

    let botones = document.querySelectorAll(`[data-pregunta="${pregunta}"]`);

    for (let boton of botones) {
        boton.classList.remove("border","border-dark","border-3","shadow");
    }

    document.getElementById(`${pregunta}${opcion}`).classList.add("border","border-dark","border-3","shadow");

    if (estatDeLaPartida.respostesUsuari[pregunta] === null) {
        estatDeLaPartida.contadorPreguntes++;
        renderitzarMarcador();
        tiempo();
    }

    estatDeLaPartida.respostesUsuari[pregunta] = {
        ID: id,
        Pregunta: parseInt(pregunta),
        Respuesta: parseInt(opcion)
    };

    if (preguntaActual < NPRG - 1) {
        pasarSiguientePregunta();
    }

    console.log("Contador de preguntes:", estatDeLaPartida.contadorPreguntes);
    console.log("Respuestas usuario:", estatDeLaPartida.respostesUsuari);
}

function iniciarPartida(preguntes) {
    let htmlStr = "";

    for (let i = 0; i < NPRG; i++) {
        htmlStr += `
        <div id="pregunta-${i}" class="d-none bg-light w-75 mx-auto p-3 mb-3 border border-primary-subtle border-3 rounded" style="min-height: 300px;">
            <h1 class="bg-primary text-white text-center">Pregunta ${i + 1}</h1>
            <img class="d-block mx-auto mt-3" width="150px" src="${preguntes[i].imatge}" onerror="this.src='img/imagenNoDisponible.jpg'">
            
            <p class="mt-3 fs-5">${preguntes[i].pregunta}</p>
            
            <div class="text-center">
                <button class="btn btn-primary resposta" data-pregunta="${i}" id = "${i}${preguntes[i].respostes[0].id}" value="${preguntes[i].respostes[0].id}">${preguntes[i].respostes[0].resposta}</button>
                <button class="btn btn-primary resposta" data-pregunta="${i}" id = "${i}${preguntes[i].respostes[1].id}" value="${preguntes[i].respostes[1].id}">${preguntes[i].respostes[1].resposta}</button>
                <button class="btn btn-primary resposta" data-pregunta="${i}" id = "${i}${preguntes[i].respostes[2].id}" value="${preguntes[i].respostes[2].id}">${preguntes[i].respostes[2].resposta}</button>
                <button class="btn btn-primary resposta" data-pregunta="${i}" id = "${i}${preguntes[i].respostes[3].id}" value="${preguntes[i].respostes[3].id}">${preguntes[i].respostes[3].resposta}</button>
            </div>
        </div>`;
    }
    
    document.getElementById("partida").innerHTML = htmlStr;
    document.getElementById("pregunta-0").classList.remove("d-none");

    console.log("Pregunta 0:", document.getElementById("pregunta-0"));
    console.log("Juego:", document.getElementById("juegoCompleto").className);
    
    renderitzarMarcador();
}

function pasarAnteriorPagina() {
let idPreguntaActual = document.getElementById(`pregunta-${preguntaActual}`);
idPreguntaActual.classList.add("d-none");


preguntaActual--;

if (preguntaActual < 0) {
    preguntaActual = NPRG - 1;
}

let idPreguntaAnterior = document.getElementById(`pregunta-${preguntaActual}`);
idPreguntaAnterior.classList.remove("d-none");


}

document.getElementById("izquierda").addEventListener("click", function() {
    pasarAnteriorPagina();
});


function pasarSiguientePregunta() {
document.getElementById(`pregunta-${preguntaActual}`).classList.add("d-none");


preguntaActual++;

if (preguntaActual >= NPRG) {
    preguntaActual = 0;
}

document.getElementById(`pregunta-${preguntaActual}`).classList.remove("d-none");


}


document.getElementById("derecha").addEventListener("click", function() {
    pasarSiguientePregunta();
});

function renderitzarMarcador() {
    let preguntesRespondidas = estatDeLaPartida.contadorPreguntes;
    let pctActual = (preguntesRespondidas / NPRG) * 100;

    let marcadorEl = document.getElementById("marcador");
    if (marcadorEl) {
        marcadorEl.innerHTML = `
        <div class="progress position-fixed top-0 start-0 w-100" role="progressbar" aria-valuenow="${pctActual}" aria-valuemin="0" aria-valuemax="100" style="height: 8px">
            <div class="progress-bar" style="width: ${pctActual}%"></div>
        </div>`;
    }

    // Si ha respondido todas las preguntas, mostramos el botón de enviar
    if (preguntesRespondidas === NPRG) {
        let boton = document.getElementById("envioFinal");
        if (boton) {
            boton.classList.remove("d-none");
            // Eliminamos el listener por si acaso y lo re-añadimos para evitar llamadas dobles
            boton.removeEventListener("click", enviarDatos);
            boton.addEventListener("click", enviarDatos);
        }
    }
}



function tiempo() {
    clearInterval(contador);

    let t = 30;
    let temporizadorEl = document.getElementById("temporizador");
    if (!temporizadorEl) return;

    temporizadorEl.classList.remove("d-none");
    temporizadorEl.innerHTML = t;

    contador = setInterval(function() {
        t--;
        temporizadorEl.innerHTML = t;

        if (t <= 0) {
            clearInterval(contador);

            document.querySelectorAll(`#pregunta-${preguntaActual} .resposta`).forEach(function(boton) {
                boton.disabled = true;
            });

            if (estatDeLaPartida.respostesUsuari[preguntaActual] === null) {
                estatDeLaPartida.contadorPreguntes++;
                estatDeLaPartida.respostesUsuari[preguntaActual] = null;
                renderitzarMarcador();
            }

            Swal.fire({
                title: 'S\'ha acabat el temps!',
                text: 'Passem a la següent pregunta.',
                icon: 'warning',
                confirmButtonText: 'Continuar',
                confirmButtonColor: '#2EAF7D'
            }).then(() => {
                pasarSiguientePregunta();
                tiempo();
            });
        }
    }, 1000);
}


// Delegación de eventos para capturar los clicks en las respuestas dinámicas
document.getElementById("partida").addEventListener("click", function(event) {
    if (event.target.classList.contains("resposta")) {
        let idPregunta = event.target.getAttribute("data-pregunta") || event.target.id;
        let idOpcion = event.target.value;

        if (arrayPreguntes[idPregunta]) {
            marcar(idPregunta, idOpcion, arrayPreguntes[idPregunta].id);
        }
    }
});


document.getElementById("formNombre").addEventListener("submit", (event) => {
    event.preventDefault();
    document.getElementById("envioNombre").click();
});

// Guardar Nombre de Usuario
document.getElementById("envioNombre").addEventListener("click", function(event) {
    event.preventDefault();

    
    let nombre = document.getElementById("inputNombre").value.trim();

    if (nombre === "") {

    Swal.fire({
        title: "Falta el nom!",
        text: "Si us plau, introdueix un nom vàlid.",
        icon: "warning",
        confirmButtonText: "Acceptar",
        confirmButtonColor: "#2EAF7D"
    });

    return;
    }else if (nombre.length < 3) {
    Swal.fire({
        title: "Nom molt curt",
        text: "El nom ha de tenir 3 caràcters.",
        icon: "warning",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#2EAF7D"
    });

    return;
}

    localStorage.setItem("inputNombre", nombre);
    nombreLS = nombre;

    nombreUsuario(nombre);

    document.getElementById("nomUsuari").classList.add("d-none");
    document.getElementById("juegoCompleto").classList.remove("d-none");

    // Iniciar temporizador al empezar a jugar
    tiempo();
});

function nombreUsuario(nombre) {
    let htmlStr = `
    <div class="card border-primary shadow mb-3">
        <div class="card-body text-center">
            <p class="mb-2 fw-bold text-primary">
                Nom de jugador: ${nombre}
            </p>
            <button id="btnEsborrar" class="btn btn-outline-danger btn-sm">Esborrar nom</button>
        </div>
    </div>`;

    document.getElementById("idNomUsuari").innerHTML = htmlStr;

    document.getElementById("btnEsborrar").addEventListener("click", function(event) {
        event.preventDefault();

        localStorage.removeItem("inputNombre");
        nombreLS = null;

        // Detener tiempo si se borra el usuario
        clearInterval(contador);
        document.getElementById("temporizador").classList.add("d-none");

        document.getElementById("nomUsuari").classList.remove("d-none");
        document.getElementById("juegoCompleto").classList.add("d-none");
        document.getElementById("idNomUsuari").innerHTML = "";
    });
}


function enviarDatos() {
    clearInterval(contador);

    fetch('/respostes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            sessionId: sessionId,
            respostesUsuari: estatDeLaPartida.respostesUsuari
        })
    })
    .then(res => res.json())
    .then(data => {
        console.log("Respuesta recibida del servidor:", data);
        mostrarResultados(data); // AQUÍ ES DONDE SE MUESTRA LA PANTALLA FINAL
    })
    .catch(err => console.error("Error al enviar respuestas:", err));
}

function mostrarResultados(data) {
// Ocultamos el juego y el reloj
document.getElementById("juegoCompleto").classList.add("d-none");
document.getElementById("temporizador").classList.add("d-none");
document.getElementById("idNomUsuari").classList.add("d-none");

// Mostramos la pantalla final
document.getElementById("pantallaResultados").classList.remove("d-none");

// Mostramos la puntuación
document.getElementById("resumenPuntacion").innerText = `¡Has acertado ${data.puntuacion} de ${data.total} preguntas!`;

Swal.fire({
    title: 'Partida terminada!',
    text: `Has encertat ${data.puntuacion} de ${data.total} preguntes`,
    icon: 'success',
    confirmButtonText: 'Aceptar',
    confirmButtonColor: '#2EAF7D'
});

}


document.getElementById("btnReiniciar").addEventListener("click", () => {
    location.reload();
});

//------------------------------------- MAIN (Carga inicial) ---------------------------------------
fetch('/json1')
.then(dades => dades.json())
.then(data => {
    sessionId = data.sessionId;
    arrayPreguntes = data.preguntes;

    console.log("Dades carregades!", data);

    // Inicializar preguntas
    iniciarPartida(arrayPreguntes);

    // Comprobar si ya existe un nombre en LocalStorage
    nombreLS = localStorage.getItem("inputNombre");

    if (nombreLS) {
        nombreUsuario(nombreLS);
        document.getElementById("nomUsuari").classList.add("d-none");
        document.getElementById("juegoCompleto").classList.remove("d-none");
        tiempo();
    } else {
        document.getElementById("nomUsuari").classList.remove("d-none");
        document.getElementById("juegoCompleto").classList.add("d-none");
    }
})
.catch(err => console.error("Error al cargar las preguntas del servidor:", err));