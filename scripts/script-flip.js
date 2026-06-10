// let equipos = [
//     { id: 1, nombre: "Colombia", puntos: 0, bandera: "colombia" },
//     { id: 2, nombre: "Japón", puntos: 0, bandera: "japon" },
//     { id: 3, nombre: "Francia", puntos: 0, bandera: "francia" },
//     { id: 4, nombre: "Brasil", puntos: 0, bandera: "brasil" },
//     { id: 5, nombre: "Argentina", puntos: 0, bandera: "argentina" },
//     { id: 6, nombre: "España", puntos: 0, bandera: "espana" }
// ];


let inicio = true;

let equipos = [];

async function cargarRankingInicial() {

    try {

        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbzT_5cQdMjz_lb_100C4L4YfenUuuuia3jbOAT9S-sczCfThhj_vL9JuLtSo1hLHV5Iaw/exec"
        );

        const ranking = await response.json();

        equipos = ranking;

        actualizarTabla(false);

        console.log(
            `Ranking inicial cargado ${equipos}`
        );

    }
    catch (error) {

        console.error(
            "Error cargando ranking:",
            error
        );

    }

}


// const socket =    io("http://localhost:3000");

const socket = io("https://servermundials12026.onrender.com");


socket.on(
    "connect",
    () => {
        console.log("Conectado:", socket.id);
    }
);

socket.on(
    "ranking",
    ranking => {

        console.log(
            "Ranking recibido",
            ranking
        );

        equipos = ranking;

        actualizarTabla();
    }
);



const tablaranking = document.getElementById("tablaranking");

// Crear filas una sola vez
function crearTabla() {

    const titulo = document.createElement("div");
    titulo.innerHTML = `
            <div class="posicion">Posición</div>
            <div class="nombre">País</div>
            <div class="puntos">Puntos</div>
        `;
    titulo.classList.add("titulo");
    tablaranking.appendChild(titulo);

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

async function iniciarAplicacion(){

    await cargarRankingInicial();

    // conectarSocket();
    inicio= false;
}

iniciarAplicacion();

console.log(equipos);
crearTabla();


// setInterval(() => {

//     const equipo =
//         equipos[Math.floor(Math.random() * equipos.length)];

//     equipo.puntos += Math.floor(Math.random() * 4);

//     actualizarTabla();

// }, 2000);