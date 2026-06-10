// ======================
// CONFIGURACIÓN
// ======================

const URL_APPS_SCRIPT =
    "https://script.google.com/macros/s/AKfycbzT_5cQdMjz_lb_100C4L4YfenUuuuia3jbOAT9S-sczCfThhj_vL9JuLtSo1hLHV5Iaw/exec";

const URL_SOCKET =
    "https://servermundials12026.onrender.com";

// Datos globales
let equipos = [];


// ======================
// CARGA INICIAL
// ======================

async function cargarRankingInicial() {

    try {

        const response = await fetch(
            `${URL_APPS_SCRIPT}?t=${Date.now()}`
        );

        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }

        const ranking = await response.json();

        equipos = ranking;

        crearTabla();

        console.log(
            "Ranking inicial cargado"
        );

    }
    catch (error) {

        console.error(
            "Error cargando ranking:",
            error
        );

    }

}


// ======================
// SOCKET.IO
// ======================

function conectarSocket() {

    const socket =io(URL_SOCKET);

    socket.on(
        "connect",
        () => {

            console.log(
                "Socket conectado:",
                socket.id
            );

        }
    );

    socket.on(
        "disconnect",
        () => {

            console.log(
                "Socket desconectado"
            );

        }
    );

    socket.on(
        "ranking",
        ranking => {

            console.log(
                "Nuevo ranking recibido",
                ranking
            );

            equipos = ranking;

            actualizarTabla(true);

        }
    );

}


// ======================
// INICIO
// ======================

async function iniciar() {

    await cargarRankingInicial();

    conectarSocket();

}

iniciar();




function crearTabla() {

    const tablaranking = document.getElementById("tablaranking");

    tablaranking.innerHTML = "";

    equipos.forEach(equipo => {

        const fila = document.createElement("div");

        fila.classList.add("fila");

        fila.dataset.id = equipo.id;

        fila.innerHTML = `
            <div class="posicion"></div>
            <div class="nombre">
                <span>
                    <img class="bandera" src="/FrontendMundialS12026/imagenes/${equipo.bandera}.webp">
                </span>
                ${equipo.nombre}
            </div>
            <div class="puntos"></div>
        `;

        tablaranking.appendChild(fila);
    });

    actualizarTabla(false);

}


function actualizarTabla(animar = true) {

    const rankingAnterior = {};

    [...tablaranking.children].forEach((fila, index) => {
        rankingAnterior[fila.dataset.id] = index + 1;
    });

    const state = Flip.getState(".fila");

    // ordenar datos
    equipos.sort((a, b) => b.puntos - a.puntos);

    // reordenar elementos DOM
    equipos.forEach((equipo, index) => {

        const fila = tablaranking.querySelector(
            `[data-id="${equipo.id}"]`
        );

        fila.querySelector(".posicion").textContent = index + 1;
        fila.querySelector(".puntos").textContent = equipo.puntos;

        tablaranking.appendChild(fila);
    });

    // limpiar estados
    [...tablaranking.children].forEach(fila => {
        fila.classList.remove("sube");
        fila.classList.remove("baja");
    });

    // detectar movimientos
    [...tablaranking.children].forEach((fila, index) => {

        const anterior =
            rankingAnterior[fila.dataset.id];

        const actual = index + 1;

        if (!anterior) return;

        if (actual < anterior) {
            fila.classList.add("sube");
        }

        if (actual > anterior) {
            fila.classList.add("baja");
        }
    });

    if (animar) {

        Flip.from(state, {
            duration: 1,
            ease: "power4.out",
            stagger: 0.05,
            scale: true

        });

    }
}