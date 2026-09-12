const urlBase = 'http://localhost:8080/api';

let skillsEnMemoria = [];
let favoritosUsuarioIds = new Set();
let plataformaActual = 'PlayStation'; // 'PlayStation' o 'Xbox'
let modoRegistro = false;
let filtroActivo = { tipo: 'TODAS', valor: null };
let contadorFlechaReloj = 0;

// 1. Estado de Sesión y Header
function obtenerUsuarioActual() {
    const raw = localStorage.getItem('fc_user');
    return raw ? JSON.parse(raw) : null;
}

function renderizarHeaderAuth() {
    const authContenedor = document.getElementById('auth-contenedor');
    if (!authContenedor) return;

    const usuario = obtenerUsuarioActual();

    if (usuario) {
        authContenedor.innerHTML = `
            <div class="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700">
                <span class="text-xs font-bold text-white">👤 ${usuario.username}</span>
                ${usuario.role === 'ROLE_ADMIN'
            ? '<a href="admin.html" class="text-[10px] bg-fc text-slate-950 px-2 py-0.5 rounded font-black uppercase hover:opacity-90 transition-opacity">Panel Admin</a>'
            : '<span class="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">USER</span>'}
            </div>
            <button onclick="cerrarSesion()" class="text-xs text-red-400 hover:text-red-300 font-bold px-2 py-1 transition-colors">
                Salir
            </button>
        `;
    } else {
        authContenedor.innerHTML = `
            <button onclick="abrirModalAuth(false)" class="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg border border-slate-700 transition-colors">
                Iniciar Sesión
            </button>
            <button onclick="abrirModalAuth(true)" class="bg-fc text-slate-950 font-black text-xs px-3.5 py-2 rounded-lg hover:scale-105 transition-transform shadow-[0_0_10px_rgba(0,255,135,0.2)]">
                Registro
            </button>
        `;
    }
}

// 2. Modal y Operaciones de Autenticación
function abrirModalAuth(esRegistro = false) {
    modoRegistro = esRegistro;
    actualizarTextoModalAuth();

    // Pausar videos de las cartas para liberar CPU/GPU
    document.querySelectorAll('#contenedor-skills video').forEach(v => v.pause());

    const modal = document.getElementById('modal-auth');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
}

function cerrarModalAuth() {
    const modal = document.getElementById('modal-auth');
    modal.classList.add('opacity-0');
    setTimeout(() => {
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        document.getElementById('form-auth').reset();

        // Reanudar reproducción
        document.querySelectorAll('#contenedor-skills video').forEach(v => v.play().catch(() => {}));
    }, 250);
}

function alternarModoAuth() {
    modoRegistro = !modoRegistro;
    actualizarTextoModalAuth();
}

function actualizarTextoModalAuth() {
    document.getElementById('auth-titulo').textContent = modoRegistro ? 'Crear Cuenta' : 'Iniciar Sesión';
    document.getElementById('auth-subtitulo').textContent = modoRegistro ? 'Registrate para guardar tus regates favoritos' : 'Ingresá para sincronizar tus favoritos';
    document.getElementById('btn-auth-submit').textContent = modoRegistro ? 'Registrarse' : 'Entrar';
    document.getElementById('btn-switch-auth').textContent = modoRegistro ? '¿Ya tenés cuenta? Iniciá sesión' : '¿No tenés cuenta? Registrate acá';
}

async function ejecutarAuth(event) {
    event.preventDefault();
    const endpoint = modoRegistro ? `${urlBase}/auth/register` : `${urlBase}/auth/login`;

    const payload = {
        username: document.getElementById('auth-user').value.trim(),
        password: document.getElementById('auth-pass').value.trim()
    };

    try {
        const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('fc_user', JSON.stringify({ username: data.username, role: data.role }));
            cerrarModalAuth();
            renderizarHeaderAuth();
            await sincronizarFavoritosUsuario();
            cargarSkills();
        } else {
            alert(data.mensaje || "Error en la autenticación");
        }
    } catch (err) {
        alert("Error de conexión con el servidor");
    }
}

function cerrarSesion() {
    localStorage.removeItem('fc_user');
    favoritosUsuarioIds.clear();
    renderizarHeaderAuth();
    cargarSkills();
}

// 3. Sincronización de Favoritos con Backend
async function sincronizarFavoritosUsuario() {
    const usuario = obtenerUsuarioActual();
    if (!usuario) {
        favoritosUsuarioIds.clear();
        return;
    }

    try {
        const res = await fetch(`${urlBase}/skills/favoritos?username=${usuario.username}`);
        if (res.ok) {
            const favs = await res.json();
            favoritosUsuarioIds = new Set(favs.map(s => s.id));
        }
    } catch (err) {
        console.error("No se pudieron cargar los favoritos:", err);
    }
}

async function toggleFavorito(skillId, event) {
    event.stopPropagation();
    const usuario = obtenerUsuarioActual();

    if (!usuario) {
        abrirModalAuth(false);
        return;
    }

    try {
        const res = await fetch(`${urlBase}/skills/${skillId}/favorito?username=${usuario.username}`, {
            method: 'POST'
        });

        if (res.ok) {
            if (favoritosUsuarioIds.has(skillId)) {
                favoritosUsuarioIds.delete(skillId);
            } else {
                favoritosUsuarioIds.add(skillId);
            }
            dibujarSkills(skillsEnMemoria);
        }
    } catch (err) {
        console.error("Error al actualizar favorito:", err);
    }
}

// 4. Selector de Mando (PlayStation / Xbox)
function cambiarPlataforma(nuevaPlataforma) {
    plataformaActual = nuevaPlataforma;

    const btnPs = document.getElementById('btn-ps');
    const btnXbox = document.getElementById('btn-xbox');

    if (btnPs && btnXbox) {
        if (plataformaActual === 'PlayStation') {
            btnPs.className = "px-4 py-1.5 rounded-full text-xs font-black transition-all bg-blue-600 text-white shadow-lg";
            btnXbox.className = "px-4 py-1.5 rounded-full text-xs font-black transition-all bg-slate-800 text-slate-400 hover:text-white";
        } else {
            btnXbox.className = "px-4 py-1.5 rounded-full text-xs font-black transition-all bg-green-600 text-white shadow-lg";
            btnPs.className = "px-4 py-1.5 rounded-full text-xs font-black transition-all bg-slate-800 text-slate-400 hover:text-white";
        }
    }

    dibujarSkills(skillsEnMemoria);
}

// 5. Formateador de Comandos 3D
function formatearComando(texto) {
    if (!texto) return '<span class="text-slate-500 text-xs italic">Sin comando</span>';

    // 1. Separar variantes alternativas ("OR" u "O")
    const variantes = texto.split(/\s+(?:OR|O)\s+/i);

    const htmlVariantes = variantes.map(variante => {
        // 2. Separar pulsaciones simultáneas ("+")
        const pasos = variante.trim().split(/\s*\+\s*/);
        const htmlPasos = pasos.map(paso => {
            const tokens = paso.trim().split(/\s+/);
            const htmlTokens = tokens.map(token => renderizarBoton(token)).join('');
            return `<span class="inline-flex items-center gap-1 bg-slate-950/70 px-2 py-1.5 rounded-xl border border-slate-800 shadow-inner">${htmlTokens}</span>`;
        });
        return htmlPasos.join('<span class="text-fc font-black text-xs mx-1 select-none">+</span>');
    });

    // Unir variantes con un divisor visual "Ó"
    return htmlVariantes.join('<span class="text-[10px] font-black text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-1 rounded-md mx-2 uppercase tracking-wider">ó</span>');
}

function anguloDesdeHora(hora) {
    // 12 en punto = -90° (arriba), avanzando en sentido horario
    return (hora % 12) * 30 - 90;
}

function puntoEnCirculo(cx, cy, radio, anguloGrados) {
    const rad = anguloGrados * Math.PI / 180;
    return {
        x: cx + radio * Math.cos(rad),
        y: cy + radio * Math.sin(rad)
    };
}

function iconoStickReloj(desdeHora, hastaHora, sentido = 'CW') {
    contadorFlechaReloj++;
    const idFlecha = `flecha-stick-${contadorFlechaReloj}`;
    const cx = 20, cy = 20, radio = 12;

    const anguloInicio = anguloDesdeHora(desdeHora);
    const anguloFin = anguloDesdeHora(hastaHora);

    const p1 = puntoEnCirculo(cx, cy, radio, anguloInicio);
    const p2 = puntoEnCirculo(cx, cy, radio, anguloFin);

    const esHorario = sentido.toUpperCase() !== 'CCW';
    const sweepFlag = esHorario ? 1 : 0;

    let diferencia = esHorario
        ? ((anguloFin - anguloInicio) % 360 + 360) % 360
        : ((anguloInicio - anguloFin) % 360 + 360) % 360;

    const largeArcFlag = diferencia > 180 ? 1 : 0;

    return `
        <svg viewBox="0 0 40 40" class="w-7 h-7 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <marker id="${idFlecha}" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
                    <path d="M0,0 L5,2.5 L0,5 Z" fill="#00ff87" />
                </marker>
            </defs>
            <!-- Cuerpo del Stick analógico cóncavo -->
            <circle cx="20" cy="20" r="17" fill="#090d16" stroke="#334155" stroke-width="1.5" />
            <circle cx="20" cy="20" r="14" fill="#0f172a" stroke="#1e293b" stroke-width="1" />

            <!-- Muescas cardinales (12, 3, 6, 9) -->
            <line x1="20" y1="4" x2="20" y2="7" stroke="#475569" stroke-width="1.2" />
            <line x1="20" y1="33" x2="20" y2="36" stroke="#475569" stroke-width="1.2" />
            <line x1="4" y1="20" x2="7" y2="20" stroke="#475569" stroke-width="1.2" />
            <line x1="33" y1="20" x2="36" y2="20" stroke="#475569" stroke-width="1.2" />

            <!-- Punto de origen del movimiento -->
            <circle cx="${p1.x}" cy="${p1.y}" r="2" fill="#94a3b8" />

            <!-- Arco de rotación hacia el destino con flecha verde neón -->
            <path d="M ${p1.x} ${p1.y} A ${radio} ${radio} 0 ${largeArcFlag} ${sweepFlag} ${p2.x} ${p2.y}"
                  fill="none" stroke="#00ff87" stroke-width="2.2" stroke-linecap="round" marker-end="url(#${idFlecha})" />
        </svg>
    `;
}

function renderizarBoton(t) {
    const raw = t.trim();

    // 0. Detección de giros analógicos estilo reloj: RS(3,9,CW) o LS(12,6,CCW)
    const matchReloj = raw.match(/^(RS|LS)\((\d{1,2}),(\d{1,2})(?:,(CW|CCW))?\)$/i);
    if (matchReloj) {
        const [, stick, desde, hasta, sentido] = matchReloj;
        return `
            <span class="inline-flex flex-col items-center gap-0.5 px-1 py-0.5" title="Stick ${stick.toUpperCase()}: de las ${desde} a las ${hasta} en punto (${sentido || 'CW'})">
                ${iconoStickReloj(parseInt(desde), parseInt(hasta), sentido || 'CW')}
                <span class="text-[8px] font-black text-slate-400 uppercase tracking-tighter">${stick.toUpperCase()}</span>
            </span>
        `;
    }

    const token = raw.toUpperCase();

    // 1. Sticks Analógicos estáticos (RS / LS sin giro)
    if (token === 'RS' || token === 'LS') {
        const stickNombre = token === 'RS' ? 'R' : 'L';
        return `
            <span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-slate-600 shadow-[0_3px_5px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.3)] text-[11px] font-black text-white tracking-tighter" title="Stick ${token}">
                <span class="w-5 h-5 rounded-full bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center border border-slate-700/80 text-fc">
                    ${stickNombre}
                </span>
            </span>
        `;
    }

    // 2. Flechas direccionales sueltas
    const direcciones = ['➡', '⬅', '⬆', '⬇', '↗', '↘', '↖', '↙'];
    if (direcciones.includes(token)) {
        return `
            <span class="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-900 border border-slate-700/80 text-fc font-black text-xs shadow-sm">
                ${token}
            </span>
        `;
    }

    // 3. Bumpers Superiores (L1 / R1 / LB / RB)
    if (['L1', 'R1', 'LB', 'RB'].includes(token)) {
        return `
            <span class="inline-flex items-center justify-center px-2 py-1 rounded-md bg-gradient-to-b from-slate-300 to-slate-400 border-b-2 border-slate-600 text-slate-900 font-black text-[10px] tracking-wider shadow-sm uppercase">
                ${token}
            </span>
        `;
    }

    // 4. Gatillos Traseros (L2 / R2 / LT / RT)
    if (['L2', 'R2', 'LT', 'RT'].includes(token)) {
        return `
            <span class="inline-flex items-center justify-center px-2.5 py-1 rounded-t-md rounded-b-lg bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-t border-slate-400 border-b-2 border-black text-white font-mono font-black text-[10px] tracking-wider shadow-md uppercase">
                ${token}
            </span>
        `;
    }

    // 5. Botones Xbox
    if (plataformaActual === 'Xbox') {
        if (token === 'A') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-700 border border-emerald-400 text-white font-black text-xs shadow-md">A</span>`;
        if (token === 'B') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 border border-rose-400 text-white font-black text-xs shadow-md">B</span>`;
        if (token === 'X') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-b from-blue-500 to-blue-700 border border-blue-400 text-white font-black text-xs shadow-md">X</span>`;
        if (token === 'Y') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 border border-amber-300 text-white font-black text-xs shadow-md">Y</span>`;
    }

    // 6. Botones PlayStation
    if (plataformaActual === 'PlayStation') {
        if (token === 'X' || token === '✖') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border border-slate-600 text-blue-400 font-black text-xs shadow-md">✖</span>`;
        if (token === 'O' || token === '⭕') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border border-slate-600 text-rose-400 font-black text-xs shadow-md">⭕</span>`;
        if (token === 'TRIANGULO' || token === '▲') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border border-slate-600 text-emerald-400 font-black text-xs shadow-md">▲</span>`;
        if (token === 'CUADRADO' || token === '■') return `<span class="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 border border-slate-600 text-pink-400 font-black text-xs shadow-md">■</span>`;
    }

    // Modificadores de ejecución táctica
    if (token === 'MANTENER' || token === '(MANTENER)') {
        return `<span class="inline-flex items-center bg-amber-500/20 border border-amber-500/40 text-amber-300 font-black px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider shadow-sm">Mantener</span>`;
    }
    if (token === 'TOQUE' || token === '(TOQUE)') {
        return `<span class="inline-flex items-center bg-sky-500/20 border border-sky-500/40 text-sky-300 font-black px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider shadow-sm">Toque</span>`;
    }

    // Fallback
    return `<span class="inline-block bg-slate-800 text-slate-300 font-bold px-2 py-0.5 rounded text-[10px] tracking-wide border border-slate-700">${token}</span>`;
}

// 6. Carga de Skills desde la API paginada
async function cargarSkills(urlFiltro = `${urlBase}/skills?size=50`) {
    const contenedor = document.getElementById('contenedor-skills');
    contenedor.innerHTML = '<p class="text-center col-span-full text-slate-400 animate-pulse">Cargando catálogo...</p>';

    try {
        await sincronizarFavoritosUsuario();

        const res = await fetch(urlFiltro);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        skillsEnMemoria = data.content || [];

        const buscador = document.getElementById('buscador');
        if (buscador) buscador.value = '';

        dibujarSkills(skillsEnMemoria);

        // Deep linking
        const parametros = new URLSearchParams(window.location.search);
        const skillIdUrl = parametros.get('skill');
        if (skillIdUrl) {
            abrirModal(parseInt(skillIdUrl));
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    } catch (err) {
        console.error("Error al obtener catálogo:", err);
        contenedor.innerHTML = '<p class="text-center col-span-full text-red-400 font-bold">Error al conectar con el servidor.</p>';
    }
}

// 7. Renderizado de Tarjetas
function dibujarSkills(lista) {
    const contenedor = document.getElementById('contenedor-skills');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="text-center col-span-full text-slate-400 font-bold mt-10">No se encontraron jugadas registradas.</p>';
        return;
    }

    lista.forEach(skill => {
        const comandoObj = skill.comandos ? skill.comandos.find(c => c.plataforma.toLowerCase() === plataformaActual.toLowerCase()) : null;
        const textoComando = comandoObj ? comandoObj.comando : (skill.comandos && skill.comandos[0] ? skill.comandos[0].comando : '');
        const esFav = favoritosUsuarioIds.has(skill.id);

        const card = `
            <div class="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col h-full">
                
                <!-- Video / Thumbnail -->
                <div class="relative bg-black aspect-video flex items-center justify-center border-b border-slate-700 cursor-pointer group" onclick="abrirModal(${skill.id})">
                    <video src="${skill.urlVideo}" autoplay loop muted playsinline class="w-full h-full object-cover opacity-80 group-hover:opacity-50 transition-opacity"></video>
                    
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-75 group-hover:scale-100 transform">
                        <div class="bg-fc text-slate-900 rounded-full p-3 shadow-[0_0_20px_rgba(0,255,135,0.5)]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 ml-0.5"><path fill-rule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clip-rule="evenodd" /></svg>
                        </div>
                    </div>

                    <div class="absolute top-3 right-3 bg-black/80 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider text-fc border border-slate-600/50 backdrop-blur-sm">
                        ${skill.categoria}
                    </div>
                </div>

                <!-- Info de la Skill -->
                <div class="p-5 flex-grow flex flex-col">
                    <div class="flex justify-between items-start mb-2">
                        <h2 class="text-lg font-black uppercase tracking-wide text-white">${skill.nombre}</h2>
                        <div class="flex items-center gap-2">
                            <!-- Compartir -->
                            <button onclick="compartirSkill(${skill.id}, event)" class="text-slate-500 hover:text-blue-400 transition-colors focus:outline-none" title="Copiar link directo">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                            </button>
                            <!-- Favorito -->
                            <button onclick="toggleFavorito(${skill.id}, event)" class="focus:outline-none" title="${esFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}">
                                ${esFav
            ? '<svg class="w-6 h-6 text-red-500 transform scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" /></svg>'
            : '<svg class="w-6 h-6 text-slate-500 hover:text-red-400 transition-colors" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>'
        }
                            </button>
                        </div>
                    </div>

                    <!-- Dificultad -->
                    <div class="flex justify-between items-center my-3 pb-2 border-b border-slate-700/50">
                        <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Estrellas</span>
                        <span class="text-yellow-400 text-sm tracking-widest">${'★'.repeat(skill.estrellas || 1)}</span>
                    </div>

                    <!-- Botonera Gamer -->
                    <div class="bg-slate-900/60 rounded-lg p-2.5 text-center border border-slate-700/40 mt-auto">
                        <p class="text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Comando (${plataformaActual})</p>
                        <div class="flex flex-wrap justify-center items-center">
                            ${formatearComando(textoComando)}
                        </div>
                    </div>
                </div>
            </div>
        `;
        contenedor.innerHTML += card;
    });
}

// 9. Modo Cine
function abrirModal(id) {
    const skill = skillsEnMemoria.find(s => s.id === id);
    if (!skill) return;

    fetch(`${urlBase}/skills/${id}/vista`, { method: 'PATCH' }).catch(() => {});

    const modal = document.getElementById('video-modal');
    const video = document.getElementById('modal-video');
    const titulo = document.getElementById('modal-titulo');
    const comando = document.getElementById('modal-comando');
    const escenario = document.getElementById('modal-escenario');

    titulo.textContent = skill.nombre;
    video.src = skill.urlVideo;

    const comandoObj = skill.comandos ? skill.comandos.find(c => c.plataforma.toLowerCase() === plataformaActual.toLowerCase()) : null;
    const textoComando = comandoObj ? comandoObj.comando : '';

    comando.innerHTML = formatearComando(textoComando);
    escenario.textContent = skill.descripcionTactico || 'Sin análisis táctico disponible.';

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
        modal.classList.remove('flex');
        modal.classList.add('hidden');
        video.pause();
        video.src = '';
    }, 300);
}

function compartirSkill(id, event) {
    event.stopPropagation();
    const url = `${window.location.origin}${window.location.pathname}?skill=${id}`;
    navigator.clipboard.writeText(url).then(() => {
        alert("Enlace copiado al portapapeles.");
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') cerrarModal();
});

// Manejador del botón activo y sus estilos
function seleccionarFiltro(tipo, valor, botonClickeado) {
    if (tipo === 'FAVORITOS' && !obtenerUsuarioActual()) {
        abrirModalAuth(false);
        return;
    }

    filtroActivo = { tipo, valor };

    // Actualizar estilo visual: marcar el activo con verde neón y desmarcar el resto
    document.querySelectorAll('.btn-filtro').forEach(btn => {
        btn.className = "btn-filtro bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2 px-5 rounded-full text-xs uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-1.5";
    });

    if (botonClickeado) {
        botonClickeado.className = "btn-filtro bg-fc font-bold py-2 px-5 rounded-full text-xs uppercase tracking-wider text-slate-950 transition-all shadow-[0_0_15px_rgba(0,255,135,0.3)] flex items-center gap-1.5";
    }

    ejecutarFiltroCombinado();
}

// Pipeline que combina el buscador de texto con el botón seleccionado
function ejecutarFiltroCombinado() {
    const textoBuscador = document.getElementById('buscador')?.value.toLowerCase().trim() || '';

    let filtradas = skillsEnMemoria.filter(skill => {
        // 1. Condición de texto (nombre o descripción táctica)
        const coincideTexto = !textoBuscador ||
            skill.nombre.toLowerCase().includes(textoBuscador) ||
            (skill.descripcionTactico && skill.descripcionTactico.toLowerCase().includes(textoBuscador));

        if (!coincideTexto) return false;

        // 2. Condición de categoría / estrellas / favoritos
        switch (filtroActivo.tipo) {
            case 'ESTRELLAS':
                return skill.estrellas === filtroActivo.valor;
            case 'CATEGORIA':
                return skill.categoria && skill.categoria.toLowerCase().includes(filtroActivo.valor.toLowerCase());
            case 'FAVORITOS':
                return favoritosUsuarioIds.has(skill.id);
            case 'TODAS':
            default:
                return true;
        }
    });

    dibujarSkills(filtradas);
}

// El input del buscador ahora llama al pipeline combinado
function filtrarSkills() {
    ejecutarFiltroCombinado();
}

// Inicialización
renderizarHeaderAuth();
cargarSkills();