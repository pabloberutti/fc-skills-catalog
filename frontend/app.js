const urlBase = 'http://localhost:8080/api';

// Función para convertir texto en botones 3D adaptada para giros
function formatearComando(texto) {
    if (!texto) return '<span class="text-slate-500 text-xs font-medium italic">Comando no definido</span>';

    // Ahora cortamos SÓLO cuando haya un " + " (con espacios a los lados)
    const partes = texto.split(' + ');
    let htmlFinal = '';

    partes.forEach((parte, index) => {
        // Le damos estilo de tecla más ancha (tipo píldora) para que entre bien el texto
        htmlFinal += `<span class="inline-block bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-lg border-b-4 border-slate-400 mx-1 text-xs shadow-sm">${parte}</span>`;

        // Si no es el último botón de la lista, le agregamos el "+" visual en el medio
        if (index < partes.length - 1) {
            htmlFinal += `<span class="text-slate-500 font-black text-sm mx-1">+</span>`;
        }
    });

    return htmlFinal;
}

let skillsEnMemoria = []; // Acá guardamos las skills para filtrarlas rápido

// --- SISTEMA DE FAVORITOS ---

// Lee la memoria del navegador
function obtenerFavoritos() {
    const guardados = localStorage.getItem('fc_skills_favs');
    return guardados ? JSON.parse(guardados) : [];
}

// Agrega o saca una skill de favoritos
function toggleFavorito(id, event) {
    // Evitamos que al tocar el corazón se abra el video de fondo
    event.stopPropagation();

    let favs = obtenerFavoritos();

    if (favs.includes(id)) {
        // Si ya estaba, lo sacamos
        favs = favs.filter(favId => favId !== id);
    } else {
        // Si no estaba, lo agregamos
        favs.push(id);
    }

    // Guardamos la nueva lista en el navegador
    localStorage.setItem('fc_skills_favs', JSON.stringify(favs));

    // Redibujamos la pantalla para que el corazón cambie de color
    filtrarSkills();
}

// Función para el botón del menú principal
function cargarFavoritos() {
    const favs = obtenerFavoritos();
    const skillsFiltradas = skillsEnMemoria.filter(skill => favs.includes(skill.id));
    dibujarSkills(skillsFiltradas);
}

function cargarSkills(url) {
    const contenedor = document.getElementById('contenedor-skills');
    contenedor.innerHTML = '<p class="text-center col-span-full text-slate-400 animate-pulse">Cargando skills...</p>';

    fetch(url)
        .then(respuesta => respuesta.json())
        .then(skills => {
            skillsEnMemoria = skills; // Guardamos los datos
            document.getElementById('buscador').value = ''; // Limpiamos el buscador al cambiar de filtro
            dibujarSkills(skillsEnMemoria); // Mandamos a dibujar
        })
        .catch(error => console.error("Error:", error));
}

// Dibuja las tarjetas en pantalla
function dibujarSkills(listaDeSkills) {
    const contenedor = document.getElementById('contenedor-skills');
    contenedor.innerHTML = '';

    if(listaDeSkills.length === 0) {
        contenedor.innerHTML = '<p class="text-center col-span-full text-slate-400 font-bold mt-10">No se encontraron skills con ese nombre.</p>';
        return;
    }

    listaDeSkills.forEach(skill => {
        const card = `
                <div class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-all duration-300">
                    <!-- Contenedor del Video CLICKEEABLE -->
                    <div class="relative bg-black aspect-video flex items-center justify-center border-b border-slate-700 cursor-pointer group" onclick="abrirModal('${skill.urlVideo}', '${skill.nombre}', '${skill.urlComando}')">
                        <video src="${skill.urlVideo}" autoplay loop muted playsinline class="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-all duration-300"></video>

                        <!-- Ícono de Play flotante (Aparece al pasar el mouse) -->
                        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 scale-75 group-hover:scale-100 transform">
                            <div class="bg-fc text-slate-900 rounded-full p-3 shadow-[0_0_20px_rgba(0,255,135,0.5)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-8 h-8 ml-1">
                                    <path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </div>

                        <!-- Etiqueta flotante de la Zona -->
                        <div class="absolute top-3 right-3 bg-black/80 px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider text-fc border border-slate-600/50 backdrop-blur-sm z-10">
                            ${skill.zona.nombre}
                        </div>
                    </div>
                    <div class="p-5">
                        <!-- Título y Corazón -->
                        <div class="flex justify-between items-start mb-3">
                            <h2 class="text-xl font-black uppercase tracking-wide text-slate-100">${skill.nombre}</h2>
                            <button onclick="toggleFavorito(${skill.id}, event)" class="transform transition-transform hover:scale-125 focus:outline-none">
                                ${obtenerFavoritos().includes(skill.id)
            ? '<svg class="w-7 h-7 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>'
            : '<svg class="w-7 h-7 text-slate-500 hover:text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>'
        }
                            </button>
                        </div>
                        <div class="flex justify-between items-center mb-5 pb-4 border-b border-slate-700/50">
                            <span class="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dificultad</span>
                            <span class="text-yellow-400 text-lg tracking-widest drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">${'★'.repeat(skill.estrellas)}</span>
                        </div>
                        <div class="bg-slate-900/50 rounded-lg p-3 text-center border border-slate-700/30">
                            <p class="text-[10px] text-slate-500 mb-2 uppercase tracking-widest font-bold">Ejecución</p>
                            <div class="flex flex-wrap justify-center items-center mt-2">
                                ${formatearComando(skill.urlComando)}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        contenedor.innerHTML += card;
    });
}

// El motor de búsqueda en tiempo real
function filtrarSkills() {
    const textoBuscado = document.getElementById('buscador').value.toLowerCase();

    // Filtramos la lista que ya tenemos en memoria
    const skillsFiltradas = skillsEnMemoria.filter(skill => {
        return skill.nombre.toLowerCase().includes(textoBuscado);
    });

    // Dibujamos solo las que coinciden
    dibujarSkills(skillsFiltradas);
}

function cargarZonas() {
    fetch(`${urlBase}/zonas`)
        .then(respuesta => respuesta.json())
        .then(zonas => {
            const contenedorFiltros = document.getElementById('filtros');

            let botonesHTML = `
                    <button onclick="cargarSkills('${urlBase}/skills')"
                            class="bg-fc font-bold py-2 px-6 rounded-full transition-transform hover:scale-105 shadow-[0_0_15px_rgba(0,255,135,0.3)] text-slate-900">
                        Todas
                    </button>
                    <button onclick="cargarFavoritos()"
                            class="bg-red-500/20 border border-red-500 text-red-400 font-bold py-2 px-6 rounded-full hover:bg-red-500 hover:text-white transition-colors flex items-center gap-2">
                        <span>Favoritos</span> <span class="text-sm">🤍</span>
                    </button>
                `;

            // Recorremos las zonas de MySQL y creamos un botón para cada una
            zonas.forEach(zona => {
                botonesHTML += `
                        <button onclick="cargarSkills('${urlBase}/skills/zona/${zona.id}')"
                                class="bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2 px-6 rounded-full hover:bg-slate-700 hover:text-white transition-colors">
                            ${zona.nombre}
                        </button>
                    `;
            });

            contenedorFiltros.innerHTML = botonesHTML;
        });
}

// --- LÓGICA DEL MODO CINE ---

// Ahora recibe también el comando
function abrirModal(videoSrc, titulo, comandoRaw) {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    const tituloElemento = document.getElementById('modal-titulo');
    const comandoElemento = document.getElementById('modal-comando');

    // Llenamos los datos
    tituloElemento.textContent = titulo;
    video.src = videoSrc;

    // Reutilizamos tu función para dibujar los botones 3D acá también
    comandoElemento.innerHTML = formatearComando(comandoRaw);

    // Truco para centrar: sacamos 'hidden' y ponemos 'flex'
    modal.classList.remove('hidden');
    modal.classList.add('flex');

    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }, 10);
}

function cerrarModal() {
    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');

    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');

    setTimeout(() => {
        // Volvemos a ocultarlo correctamente
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        video.pause();
        video.src = '';
    }, 300);
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        cerrarModal();
    }
});

cargarZonas();
cargarSkills(`${urlBase}/skills`);