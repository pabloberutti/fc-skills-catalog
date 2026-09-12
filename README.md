# 🎮 EA SPORTS FC™ - Skills & Mechanics Catalog (Full-Stack Platform)

Plataforma integral y profesional para el aprendizaje, visualización táctica y consulta interactiva de regates (*skill moves*) y mecánicas competitivas de EA SPORTS FC™, diseñada bajo una arquitectura modular y orientada a microservicios contenerizados.

---

## 🏗️ Arquitectura del Sistema

El ecosistema se distribuye en tres contenedores independientes orquestados mediante **Docker Compose**:

```text
       [ Cliente / Navegador ]
                  │
        Puerto 80 │ (HTTP)
                  ▼
     ┌────────────────────────┐
     │   fc_frontend_web      │ ── Servidor Web Nginx (Alpine)
     │   (HTML5, Tailwind,    │    Sirve Single Page Application y
     │    Vanilla JS ES6+)    │    Streaming optimizado de video MP4
     └────────────────────────┘
                  │
      Puerto 8080 │ (REST API / JSON)
                  ▼
     ┌────────────────────────┐
     │   fc_backend_api       │ ── Spring Boot 3 / 4 (Java 17 JRE)
     │   (Spring Security,    │    Capa REST, DTOs, Mappers,
     │    Data JPA, Hibernate)│    BCrypt Hashing, Subida Multipart
     └────────────────────────┘
                  │
      Puerto 3306 │ (MySQL Protocol)
                  ▼
     ┌────────────────────────┐
     │   fc_mysql_db          │ ── MySQL 8.0 Engine
     │   (InnoDB, Relacional, │    Persistencia de catálogo, comandos,
     │    Healthcheck activo) │    usuarios y favoritos (Many-to-Many)
     └────────────────────────┘
```

---

## 🚀 Tecnologías Utilizadas

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend** | Vanilla JavaScript (ES6+ reactivo), HTML5 Semántico, Tailwind CSS (Utility-First), Nginx Alpine |
| **Backend** | Java 17, Spring Boot, Spring Data JPA, Spring Security 6 / 7, Hibernate 7, Lombok |
| **Base de Datos** | MySQL 8.0, DBeaver para administración relacional, InnoDB Engine |
| **Seguridad** | Hashing criptográfico con **BCrypt**, Roles RBAC (`ROLE_ADMIN`, `ROLE_USER`), Auth Guard en cliente |
| **Infraestructura** | Docker Engine, Docker Compose, Multi-stage Docker Builds |
| **Documentación** | OpenAPI 3.0 / Swagger UI interactivo |

---

## 📁 Estructura del Repositorio

```text
fc-skills-catalog/
├── docker-compose.yml              # Orquestación global multicontenedor
├── README.md                       # Documentación técnica de producción
│
├── frontend/                       # Aplicación Web Cliente
│   ├── index.html                  # Catálogo público, buscador y modo cine
│   ├── admin.html                  # Panel administrativo y carga de jugadas
│   ├── app.js                      # Controlador JS, conmutador de mando y auth
│   ├── nginx.conf                  # Configuración de Nginx con soporte MP4
│   ├── Dockerfile                  # Imagen ligera para servir estáticos
│   └── assets/
│       └── videos/                 # Volumen persistente de clips MP4
│
└── fc-backend/                     # Microservicio de Backend (Spring Boot)
    ├── Dockerfile                  # Compilación multi-stage con Maven
    ├── pom.xml                     # Dependencias y plugins del proyecto
    └── src/main/java/com/skills/fc_backend/
        ├── config/                 # SecurityConfig, DataInitializer, CORS
        ├── controller/             # SkillMoveController, AuthController
        ├── dto/                    # Request/Response Records (DTO Pattern)
        ├── exception/              # GlobalExceptionHandler y errores REST
        ├── model/                  # Entidades JPA (SkillMove, AppUser, etc.)
        ├── repository/             # Repositorios JPA con Spring Data
        └── service/                # Lógica transaccional y almacenamiento
```

---

## ⚡ Puesta en Marcha Rápida (Quickstart)

### Prerrequisitos
* Tener instalado **Docker Desktop** (con soporte WSL2 en Windows o Docker daemon en Linux/Mac).
* Git para clonar el repositorio.

### 1. Clonar el repositorio
```bash
git clone https://github.com/pabloberutti/fc-skills-catalog.git
cd fc-skills-catalog
```

### 2. Levantar el entorno con Docker Compose
Con un único comando se construyen las imágenes, se inicializan las tablas y se puebla la información inicial:
```bash
docker compose up --build -d
```

### 3. Verificar el estado de los servicios
```bash
docker compose ps
```
Los tres contenedores (`fc_mysql_db`, `fc_backend_api` y `fc_frontend_web`) deben figurar en estado `Up` o `Healthy`.

---

## 🌐 Puntos de Acceso

| Servicio | URL Local | Descripción |
| :--- | :--- | :--- |
| **Catálogo Público** | `http://localhost/` | Vista de usuario, buscador, selector de mando y modo cine |
| **Panel Admin** | `http://localhost/admin.html` | Panel de gestión y carga (requiere `ROLE_ADMIN`) |
| **Swagger UI** | `http://localhost:8080/swagger-ui/index.html` | Documentación interactiva de la API |
| **MySQL Database** | `localhost:3306` | Base de datos (`fc_skills` / `root` / `root`) |

---

## 🔐 Cuentas Sembradas por Defecto

El sistema incluye un cargador automático (`DataInitializer`) que puebla usuarios y catálogo al arrancar por primera vez:

| Usuario | Contraseña | Rol | Permisos |
| :--- | :--- | :--- | :--- |
| **`admin`** | `admin123` | `ROLE_ADMIN` | Acceso a panel admin, creación, edición y eliminación de skills |
| **`wolfo`** | `wolfo123` | `ROLE_USER` | Navegación, guardado de favoritos sincronizados en MySQL |

---

## 📡 Referencia de la API REST

### Autenticación (`/api/auth`)
* `POST /api/auth/register` - Registra un nuevo usuario (`ROLE_USER`).
* `POST /api/auth/login` - Verifica credenciales y retorna rol asignado.

### Catálogo de Skills (`/api/skills`)
* `GET /api/skills?page=0&size=50` - Listado paginado con filtros combinados.
* `GET /api/skills/{id}` - Obtiene el detalle técnico de un regate.
* `POST /api/skills` - Registra una nueva skill (Admin).
* `POST /api/skills/upload-video` - Sube un archivo `.mp4` vía `MultipartFile`.
* `PATCH /api/skills/{id}/vista` - Incrementa el contador analítico de reproducciones.
* `DELETE /api/skills/{id}` - Elimina una jugada del catálogo (Admin).

### Favoritos de Usuario
* `GET /api/skills/favoritos?username={user}` - Retorna los regates guardados del usuario en MySQL.
* `POST /api/skills/{id}/favorito?username={user}` - Alterna (toggle) el estado de favorito.

---

## 🎮 Características Destacadas

1. **Conmutador Dinámico de Mandos (PlayStation / Xbox):** Renderiza en tiempo real los botones y combinaciones de palancas analógicas (`RS`, `LS`, `L1/LB`, `R2/RT`) con estética 3D según el control seleccionado por el usuario.
2. **Modo Cine Táctico:** Reproducción de video inmersiva con análisis contextual para 1v1, desborde por banda o definición.
3. **Optimización de Renderizado:** Desactivación de filtros pesados (`backdrop-filter`) y pausa automática de videos en segundo plano para evitar sobrecarga en la GPU.
4. **Almacenamiento Desacoplado:** Subida de videos mediante volúmenes Docker compartidos entre Spring Boot y Nginx.
