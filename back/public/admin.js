let parametros = new URLSearchParams(window.location.search);
let id = parametros.get("id");
let formCrear = document.getElementById("formCrear");
let idRespostes =[];


if (id) {
    document.getElementById("enviarPregunta").value = "Modificar Pregunta";

    fetch('/preguntes')
        .then(res => res.json())
        .then(preguntes => {

            for (let pregunta of preguntes) {

                if (pregunta.id == id) {

                    console.log("PREGUNTA:", pregunta);
                    console.log("RESPOSTES:", pregunta.respostes);

                    document.getElementById("pregunta").value = pregunta.pregunta;
                    document.getElementById("imatge").value = pregunta.imatge;

                    document.getElementById("respostes-1").value = pregunta.respostes[0].resposta;
                    document.getElementById("respostes-2").value = pregunta.respostes[1].resposta;
                    document.getElementById("respostes-3").value = pregunta.respostes[2].resposta;
                    document.getElementById("respostes-4").value = pregunta.respostes[3].resposta;
                    
                    for (let resposta of pregunta.respostes) {
                       
                        if (resposta.correcta == 1) {
                            document.getElementById("correcta").value = resposta.id;
                       
                        }
                    
                    }

                    idRespostes = [
                            pregunta.respostes[0].id,
                            pregunta.respostes[1].id,
                            pregunta.respostes[2].id,
                            pregunta.respostes[3].id
                    ];

                    console.log("IDS:", idRespostes);
                    document.getElementById("enviarPregunta").value = "Modificar Pregunta";
                }

            }

        });
        
        

}

fetch('/preguntes')
    .then(res => res.json())
    .then(preguntes => {

        let html = `<div class = "row mb-5 g-4">`;

        for (let pregunta of preguntes) {

            html += `<div class=" col-lg-4 ">
                <div class="card h-100 shadow p-3">

                    <div class="card-body">

                        <h2 class="card-title fs-5">
                            ${pregunta.pregunta}
                        </h2>

                        <img
                            src="${pregunta.imatge}"
                            class="card-img-top rounded mb-3"
                            alt="Imatge no diponible"
                            onerror="this.src='img/imagenNoDisponible.jpg'">

                        <h3 class="fs-6">
                            Respostes
                        </h3>

                        <div class = "container">
                            <div class = "row">
            `;

            for (let resposta of pregunta.respostes) {

                html += `<div class = "col-6 g-2">
                    <button class="btn btn-primary">
                        ${resposta.resposta}
                    </button>
                </div>`;

            }

            html += `</div>
                        </div>
                    </div>

                    <div class = "d-flex">
                        <button class="btn btn-warning w-50" onclick="modificarPregunta(${pregunta.id})">
                            Modificar
                        </button>

                        <button class="btn btn-danger w-50 ms-2" onclick="eliminarPregunta(${pregunta.id})">
                            Eliminar
                        </button>
                    </div>

                </div>
            </div>`;
        }

        html += `</div>`;

        let preguntas = document.getElementById("preguntes");

        if (preguntas) {
            preguntas.innerHTML = html;
        }

    });




if (formCrear) {

    formCrear.addEventListener("submit", (event) => {

        event.preventDefault();

        let correcta = Number(document.getElementById("correcta").value);

        console.log(idRespostes);
        let pregunta = {
    pregunta: document.getElementById("pregunta").value,
    imatge: document.getElementById("imatge").value,
    respostes: [
    {
        id: idRespostes[0],
        resposta: document.getElementById("respostes-1").value,
        correcta: correcta === 1 ? 1 : 0
    },
    {
        id: idRespostes[1],
        resposta: document.getElementById("respostes-2").value,
        correcta: correcta === 2 ? 1 : 0
    },
    {
        id: idRespostes[2],
        resposta: document.getElementById("respostes-3").value,
        correcta: correcta === 3 ? 1 : 0
    },
    {
        id: idRespostes[3],
        resposta: document.getElementById("respostes-4").value,
        correcta: correcta === 4 ? 1 : 0
    }
]
};
        if (
            pregunta.pregunta == "" ||
            pregunta.respostes[0].resposta == "" ||
            pregunta.respostes[1].resposta == "" ||
            pregunta.respostes[2].resposta == "" ||
            pregunta.respostes[3].resposta == ""
        ) {

            Swal.fire({
                title: "Falten dades",
                text: "Has d'omplir tots els camps",
                icon: "warning"
            });

            return;
        }

        if (id) {

            fetch(`/preguntes/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pregunta)
            })
            .then(res => res.json())
            .then(data => {

                Swal.fire({
                    title: "Pregunta modificada",
                    text: "La pregunta s'ha modificat correctament",
                    icon: "success"
                });

            });

        } else {

            fetch("/preguntes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(pregunta)
            })
            .then(res => res.json())
            .then(data => {

                Swal.fire({
                    title: "Pregunta creada",
                    text: "La pregunta s'ha creat correctament",
                    icon: "success"
                });

            });

        }

    });

}


function eliminarPregunta(id) {

    Swal.fire({
        title: "Estàs segur que vols eliminar aquesta pregunta?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancel·lar"
    }).then((result) => {

        if (result.isConfirmed) {

            fetch(`/preguntes/${id}`, {
                method: "DELETE"
            })
            .then(res => res.json())
            .then(data => {
                window.location.reload();
            });

        }

    });
}


function modificarPregunta(id) {
    window.location.href = `./crearPregunta.html?id=${id}`;
}