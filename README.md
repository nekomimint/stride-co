# stride-co

### Datos académicos

| Campo | Detalle |
|---|---|
| **Universidad** | Universidad Autónoma de Chihuahua |
| **Facultad** | Facultad de Ingeniería |
| **Carrera** | Ingeniería en Computación |
| **Materia** | Desarrollo De Aplicaciones Web |
| **Docente** | Ramírez Martínez Luis Antonio |
| **Actividad** | Proyecto Integrador - Stide-co |
| **Equipo** | Equipo N° 4 |
| **Integrantes** | • Jesús Manuel Villegas Terrazas (385743)<br>• Alan Fabricio Vega Gutiérrez (385658)<br>• Edgar Klassen Saenz (385429)<br>• Amir Ovedi Mendiaz Rodriguez (385686) |
| **Fecha de entrega** | 20/09/2026 |

## Descripción

Este proyecto consiste en el diseño y desarrollo de una plataforma web integral para **Stride & Co.**, una tienda deportiva que busca digitalizar y automatizar la gestión de su catálogo de productos, control de inventarios, administración de pedidos y coordinación del equipo de ventas. 

A lo largo del semestre, el desarrollo se realiza de manera iterativa mediante la metodología **Scrum**. 

*Primera etapa (Sprint 0/1)*
Se establece la configuración inicial del backend con Node.js y Express Generator, sentando las bases técnicas de arquitectura, enrutamiento, controladores mock, calidad de código y pruebas automatizadas que permitirán la integración progresiva de reglas de negocio, persistencia de datos y autenticación en los siguientes sprints...

## Objetivo

Diseñar e implementar una solución web escalable y modular recorriendo un ciclo completo de ingeniería de software para digitalizar los procesos operativos y comerciales de Stride & Co. 

## Tecnologías utilizadas
- **Node.js**: Entorno de ejecución para JavaScript en el servidor.
- **JavaScript (ES6+)**: Lenguaje de programación principal del proyecto.
- **Express.js**: Framework web para la creación y gestión de la API REST.
- **Log4js**: Middleware para el registro (*logging*) de solicitudes HTTP en consola.
- **Jest**: Herramienta y framework para la ejecución de pruebas automatizadas de endpoints.
- **ESLint**: Herramienta de análisis estático para garantizar la calidad y estilo del código.

## Requisitos previos
- Node.js (v18.0.0 o superior)
- npm (v9.0.0 o superior)

## Instalación

Clonar el repositorio del proyecto:

   *git clone [https://github.com/nekomimint/stride-co.git](https://github.com/nekomimint/stride-co.git)*

Navegar al directorio del proyecto
*cd stride-co*

Instalar todas las dependencias 
*npm install*

Iniciar el servidor en modo desarrollo
*npm run dev*

## Ejecución
Para poner el funccionamiento el servidor en entorno de desarrollo:
*npm run dev*

Para iniciar el servidor en entorno de produccion:
*npm start*

## Scripts / comandos disponibles

| Comando | Descripción |
|---|---|
| `npm run dev`  | incia el servidor en modo de desarrollo |
| `npm start`    | incia el servidor en modo de produccion |
| `npm test`     | Ejecuta el set de pruebas unitarias     |
| `npm run lint` | Analiza todo el proyecto desde la raiz  |
| `ctrl + c`     | Detiene el servidor una vez iniciado    |

## Endpoints de la API

Los siguientes recursos forman parte de la arquitectura inicial y responden con datos mock:

    /api/users — Gestión de usuarios

    /api/roles — Gestión de roles del sistema

    /api/permissions — Permisos asociados a roles

    /api/products — Catálogo de productos

    /api/variants — Variantes de productos (talla, color, SKU)

    /api/inventory — Control e inventario de productos

    /api/customers — Información de clientes (MongoDB)

    /api/orders — Procesamiento de órdenes e historial (MongoDB)

## Operaciones REST
*Obtener listado (GET /api/<recurso>)*: Devuelve el listado general del recurso.

*Obtener por ID (GET /api/<recurso>/:id)*: Devuelve un elemento específico por su identificador.

*Crear registro (POST /api/<recurso>)*: Recibe un payload JSON y retorna la confirmación de creación (HTTP 201).

*Actualizar registro (PUT /api/<recurso>/:id)*: Modifica la información del elemento especificado.

*Eliminar registro (DELETE /api/<recurso>/:id)*: Elimina el registro por su identificador.

## Pruebas
El proyecto cuenta con pruebas automatizadas integradas para validar el comportamiento de los controladores y endpoints de la API.
Para correr las pruebas ejecute:
*npm test*

## Análisis de calidad de código
El análisis de calidad y formateo de código se realiza con ESLint para asegurar el cumplimiento de buenas prácticas.
Para ejecutar la revisión estática ejecuta:
*npm run lint*


## Estructura general del proyecto

```text
stride-co/
├── bin/
│   └── www               # Script de arranque del servidor HTTP
├── controllers/          # Lógica de controladores (procesamiento de peticiones)
├── routes/               # Definición de endpoints y enrutamiento REST
├── public/               # Archivos estáticos de la aplicación
├── views/                # Plantillas Pug de vistas (error e index)
├── test/                 # Pruebas automatizadas (Jest)
├── app.js                # Configuración principal de Express y middlewares
├── eslint.config.js      # Configuración de reglas de ESLint
├── .gitignore            # Exclusión de archivos sensibles y node_modules
├── package.json          # Configuración de scripts y dependencias
└── README.md             # Documentación general del proyecto
```

## Authentication

- Metodo utilizado para proteger contraseñas (bcrypt, factor de costo y campos salt key y password hash).

    - Bcrypt : Hashing de contraseñas
    - Factor de costo -> 10, es el trabajo computacional que le cuesta a bcrypt encriptar una contraseña.
    - Salt key -> Es un valor unico por contraseña que altera como se genera, esta incorporado por default en el bcrypt y se almacena en la base de datos.
    - Password Hash -> Es el campo que se almacena en la base de datos en la columna 'password'.
- Librerias utilizadas para emitir y verificar el JWT.

    Se utilizaron 3 librerias para emitir y verificar JWT:
    ```jsonwebtoken``` -> Crear y verificar los tokens, utiliza header.payload.signature para generarlos y compararlos.
    ```express-jwt``` -> Protege las rutas de expressJS, es el middleware que integra la verificacion.
    ```bcrypt``` -> Transformar la contraseña en un hash para almcenarlo en la base de datos.
- Endpoint de login.

    El endopint de login se accede mediante una peticion POST a ```'api/auth/login```, y si las credenciales son correctas, retorna un token que se utiliza para autenticarse en los demás endpoints.
- Endpoint /api/auth/me.

    Retorna la información del usuario con el que haz iniciado sesión, y para ello ocupas tener previamente tu token de autenticación, de lo contrario retornara token expirado o invalido.
- Variables de entorno requeridas.

    Se requieren un total de 5 variables de entorno: 
    - ```SECRET_KEY``` -> Es la llave que utiliza JWT para firmar y verificar tokens, tambien permite detectar si un token fue alterado.
    - ```BCRYPT_SALT_ROUNDS``` -> Cantidad de veces que bcrypt repite el proceso de un cifrado mediante un exponente con base 2 (2^BCRYPT_SALT_ROUNDS)
    - ```JWT_EXPIRES_IN```-> Es el tiempo que tarda en expirar el token, cuando expira ya no es valido para inciar autenticarse.
    - ```JWT_ISSUER``` -> Quien emite el token.
    - ```JWT_AUDIENCE``` -> Quienes usan el token.
- Ejemplo del header Authorization: 
    
    Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiaWF0IjoxNzkyMzc1NDk0LCJleHAiOjE3OTIzNzYzOTQsImF1ZCI6InN0cmlkZS1jby1hcGkiLCJpc3MiOiJzdHJpZGUtY28ifQ.XQet3s1lwifmih4F5a1BfAOH7u9PuxQcsqfFTIRnHKg
- Tiempo de expiracion configurado.

    15 minutos, quiere decir que hay 15 minutos disponibles desde que se hace un login para hacer peticiones o consultas en la API, una vez finalizan los 15 minutos cualquier intento dará como respuesta un mensaje de token expirado.

## Autores

* **Jesús Manuel Villegas Terrazas** — 385743
* **Alan Fabricio Vega Gutiérrez** — 385658 
* **Edgar Klassen Saenz** — 385429
* **Amir Ovedi Mendiaz Rodriguez** — 385686
