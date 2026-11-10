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
| `npm run dev`     | incia el servidor en modo de desarrollo |
| `npm start`       | incia el servidor en modo de produccion |
| `npm test`        | Ejecuta la suite de pruebas unitarias     |
| `npm run test:e2e`| Ejecuta la suite de pruebas End-to-End (E2E) con bases de datos reales|
| `npm run lint`    | Analiza todo el proyecto desde la raiz  |
| `ctrl + c`        | Detiene el servidor una vez iniciado    |

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

## Instalación desde cero

### Requisitos
- Node.js 
- PostgreSQL
- MongoDB local **o** acceso a un cluster de Atlas
- Git

### Pasos

1. Clona el repositorio e ingresa a la carpeta:

```bash
git clone https://github.com/nekomimint/stride-co.git
cd stride-co
```

2. Instala las dependencias:

```bash
npm install
```

3. Crea el archivo de configuración a partir de la plantilla:

```bash
cp config/local-development.example.json config/local-development.json
```


4. Edita `config/local-development.json` con tus valores:

```json
{
    "postgres":
    {
        "host": "your_provider",
        "port": "5432_or_your_port",
        "user": "user_to_access",
        "password": "password_to_access"
    },
    "mongodb": {
        "url": "your_provider_url",
        "user": "user_to_access",
        "password": "password_to_access",
        "protocol": "atlas_uses_mongodb+srv://_chech_the_url_of_your_provider"
    },
    "auth": {
        "jwtSecret": "your_very_secret_key",
        "saltRounds": 10,
        "jwtExpires": "your_time_like_30m_or_1h",
        "jwtIssuer": "your_issuer",
        "jwtAudience": "your_audience"
    }
}
```

5. Crea la base de datos en PostgreSQL

```bash
createdb stride-co
```

6. Carga los datos iniciales con `npm run seed` (ver sección *Poblar las bases de datos*).

7. Inicia el servidor:

```bash
npm run dev
```

### Bases de datos en desarrollo

El proyecto usa dos bases de datos:

| Base de datos | Uso |
| :--- | :--- |
| **PostgreSQL** | Usuarios, roles, permisos (`roles`, `permissions`, `role_permissions`), productos, variantes e inventario |
| **MongoDB** | Órdenes y clientes |

### Poblar las bases de datos (seed)
Antes de ejecutar el seed, verifica que:
1. PostgreSQL y MongoDB (local o Atlas) estén en ejecución.
2. Exista `config/local-development.json` con las credenciales correctas.

Ejecuta:

```bash
npm run seed
```
### Endpoints y permisos RBAC

| Método | Endpoint | Permiso RBAC requerido | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/products` | `products:read:any` | Lista todos los productos |
| **GET** | `/products/:id` | `products:read:any` | Obtiene un producto por id |
| **POST** | `/products` | `products:create:any` | Crea un producto |
| **PUT** | `/products/:id` | `products:update:any` | Edita un producto |
| **DELETE** | `/products/:id` | `products:delete:any` | Elimina un producto |
| **GET** | `/variants` | `variants:read:any` | Lista las variantes |
| **GET** | `/variants/:id` | `variants:read:any` | Obtiene una variante por id |
| **POST** | `/variants` | `variants:create:any` | Crea una variante |
| **PUT** | `/variants/:id` | `variants:update:any` | Edita una variante |
| **DELETE** | `/variants/:id` | `variants:delete:any` | Elimina una variante |
| **GET** | `/inventory` | `inventory:read:any` | Lista el inventario |
| **GET** | `/inventory/:id` | `inventory:read:any` | Obtiene un registro de inventario |
| **POST** | `/inventory` | `inventory:create:any` | Crea un registro de inventario |
| **PUT** | `/inventory/:id` | `inventory:update:any` | Edita un registro de inventario |
| **DELETE** | `/inventory/:id` | `inventory:delete:any` | Elimina un registro de inventario |
| **GET** | `/orders` | `orders:read:any` | Lista todas las órdenes |
| **GET** | `/orders/:id` | `orders:read:own` | Obtiene una orden por id (propia) |
| **POST** | `/orders` | `orders:create:own` / `orders:create:any` | Crea una orden propia (`user`) o para cualquier cliente (`sales`, `admin`) |
| **PUT** | `/orders/:id` | `orders:update:own` | Edita una orden propia |
| **GET** | `/customers` | `customers:read:any` | Lista todos los clientes |
| **GET** | `/customers/:id` | `customers:read:own` | Obtiene un cliente por id (propio) |
| **POST** | `/customers` | `customers:create:any` | Crea un cliente |
| **PUT** | `/customers/:id` | `customers:update:any` / `customers:update:own` | Edita cualquier cliente (`sales`, `admin`) o el propio (`user`) |
| **DELETE** | `/customers/:id` | `customers:delete:any` | Elimina un cliente |
| **GET** | `/users` | `users:read:any` | Lista todos los usuarios |
| **GET** | `/users/:id` | `users:read:own` | Obtiene un perfil (propio) |
| **POST** | `/users` | `users:create:any` | Crea un usuario |
| **PUT** | `/users/:id` | `users:update:any` / `users:update:own` | Edita cualquier usuario (`admin`) o el perfil propio |
| **DELETE** | `/users/:id` | `users:delete:any` | Elimina un usuario |
| **GET** | `/roles` | `roles:read:any` | Lista los roles |
| **POST** | `/roles` | `roles:manage:any` | Crea un rol |
| **PUT** | `/roles/:id` | `roles:manage:any` | Edita un rol |
| **DELETE** | `/roles/:id` | `roles:manage:any` | Elimina un rol |
| **POST** | `/roles/assign` | `roles:assign:any` | Asigna un rol a un usuario |
| **GET** | `/permissions` | `permissions:read:any` | Lista los permisos |
| **POST** | `/permissions` | `permissions:manage:any` | Crea un permiso |
| **PUT** | `/permissions/:id` | `permissions:manage:any` | Edita un permiso |
| **DELETE** | `/permissions/:id` | `permissions:manage:any` | Elimina un permiso |

## Control de acceso basado en roles

#### Roles utilizados
* **`admin`**: Administrador con acceso global a todos los recursos y operaciones (incluye la gestión de usuarios, roles y permisos).
* **`sales`**: Vendedor. Puede ver productos, variantes e inventario; crear y consultar órdenes (de cualquier cliente o propias); crear, ver y editar clientes; y ver y editar su propio perfil. No puede eliminar recursos ni administrar usuarios, roles o permisos.
* **`user`**: Usuario final. Puede ver productos y variantes, crear, ver y editar únicamente sus propias órdenes, y ver y editar su propio perfil y su propio cliente.

### Convención utilizada para Permission.key

Los permisos siguen una estructura sencilla que consta de tres partes separadas por dos puntos:

`recurso:accion:posesion`

* **Recurso:** Es el módulo (por ejemplo `products`, `orders`, `users`, `variants`, `inventory`, `customers`, `roles`, `permissions`).
* **Acción:** Lo que se quiere hacer (por ejemplo `create`, `read`, `update`, `delete`). En `roles` y `permissions` se usan además `manage` (crear, editar y eliminar) y `assign` (asignar roles a usuarios).
* **Posesión:** El alcance del permiso (`any` para cualquier registro o `own` solo para los propios).


### Permisos definidos

##### Products
* **`products:create:any`**: Crear productos.
* **`products:read:any`**: Ver productos.
* **`products:update:any`**: Editar productos.
* **`products:delete:any`**: Eliminar productos.

##### Orders
* **`orders:create:any`**: Crear órdenes para cualquiera.
* **`orders:create:own`**: Crear órdenes propias.
* **`orders:read:any`**: Ver todas las órdenes de forma global.
* **`orders:read:own`**: Ver únicamente las órdenes propias.
* **`orders:update:own`**: Editar únicamente las órdenes propias.

##### Users
* **`users:create:any`**: Crear usuarios.
* **`users:read:any`**: Ver listado y detalles de todos los usuarios.
* **`users:read:own`**: Ver el perfil propio.
* **`users:update:any`**: Editar la información de cualquier usuario.
* **`users:update:own`**: Editar el perfil propio.
* **`users:delete:any`**: Eliminar usuarios.

##### Variants
* **`variants:create:any`**: Crear variantes.
* **`variants:read:any`**: Ver variantes.
* **`variants:update:any`**: Editar variantes.
* **`variants:delete:any`**: Eliminar variantes.

##### Inventory
* **`inventory:create:any`**: Crear inventario.
* **`inventory:read:any`**: Ver inventario.
* **`inventory:update:any`**: Editar inventario.
* **`inventory:delete:any`**: Eliminar inventario.

##### Customers
* **`customers:create:any`**: Crear clientes.
* **`customers:read:any`**: Ver todos los clientes.
* **`customers:read:own`**: Ver el cliente propio.
* **`customers:update:any`**: Editar cualquier cliente.
* **`customers:update:own`**: Editar el cliente propio.
* **`customers:delete:any`**: Eliminar clientes.

##### Roles
* **`roles:read:any`**: Ver roles.
* **`roles:manage:any`**: Gestionar roles (crear, editar, eliminar).
* **`roles:assign:any`**: Asignar roles a usuarios.

##### Permissions
* **`permissions:read:any`**: Ver permisos.
* **`permissions:manage:any`**: Gestionar permisos.

### Matriz RBAC

| Permiso (`Permission.key`) | Descripción | Admin | Sales | User |
| :--- | :--- | :---: | :---: | :---: |
| **`products:create:any`** | Crear productos | Sí | - | - |
| **`products:read:any`** | Ver productos | Sí | Sí | Sí |
| **`products:update:any`** | Editar productos | Sí | - | - |
| **`products:delete:any`** | Eliminar productos | Sí | - | - |
| **`orders:create:any`** | Crear órdenes para cualquiera | Sí | Sí | - |
| **`orders:create:own`** | Crear órdenes propias | Sí | - | Sí |
| **`orders:read:own`** | Ver órdenes propias | Sí | Sí | Sí |
| **`orders:read:any`** | Ver todas las órdenes | Sí | Sí | - |
| **`orders:update:own`** | Editar órdenes propias | Sí | Sí | Sí |
| **`users:create:any`** | Crear usuarios | Sí | - | - |
| **`users:read:any`** | Ver todos los usuarios | Sí | - | - |
| **`users:read:own`** | Ver perfil propio | Sí | Sí | Sí |
| **`users:update:any`** | Editar cualquier usuario | Sí | - | - |
| **`users:update:own`** | Editar perfil propio | Sí | Sí | Sí |
| **`users:delete:any`** | Eliminar usuarios | Sí | - | - |
| **`variants:read:any`** | Ver variantes | Sí | Sí | Sí |
| **`variants:create:any`** | Crear variantes | Sí | - | - |
| **`variants:update:any`** | Editar variantes | Sí | - | - |
| **`variants:delete:any`** | Eliminar variantes | Sí | - | - |
| **`inventory:read:any`** | Ver inventario | Sí | Sí | - |
| **`inventory:create:any`** | Crear inventario | Sí | - | - |
| **`inventory:update:any`** | Editar inventario | Sí | - | - |
| **`inventory:delete:any`** | Eliminar inventario | Sí | - | - |
| **`customers:create:any`** | Crear clientes | Sí | Sí | - |
| **`customers:read:any`** | Ver todos los clientes | Sí | Sí | - |
| **`customers:read:own`** | Ver cliente propio | Sí | Sí | Sí |
| **`customers:update:any`** | Editar cualquier cliente | Sí | Sí | - |
| **`customers:update:own`** | Editar cliente propio | Sí | Sí | Sí |
| **`customers:delete:any`** | Eliminar clientes | Sí | - | - |
| **`roles:read:any`** | Ver roles | Sí | - | - |
| **`roles:manage:any`** | Gestionar roles (crear, editar, eliminar) | Sí | - | - |
| **`roles:assign:any`** | Asignar roles a usuarios | Sí | - | - |
| **`permissions:read:any`** | Ver permisos | Sí | - | - |
| **`permissions:manage:any`** | Gestionar permisos | Sí | - | - |


### Endpoints protegidos
`products`, `orders`, `users`, `variants`, `inventory`, `customers`, `roles`, `permissions`

### Ejemplo de permiso any

Pensada para el administrador, el cual puede eliminar cualquier recurso:

```javascript
/* DELETE product by id (DELETE ANY - Solo Admin) */
router.delete('/:id', authorize('products', 'delete', 'any'), log('Deleting product'), controller.destroy);
```

### Ejemplo de permiso own

Pensada para que el usuario autenticado solo pueda consultar o gestionar sus propios registros:

```javascript
/* GET order by id (READ OWN - Ver orden propia) */
router.get('/:id', authorize('orders', 'read', 'own'), log('Searching order by id'), controller.find);
```

### Como se obtiene la configuración de permisos desde la base de datos

Con el archivo `seed.js` se realizan las inserciones a las tres tablas de nuestra base de datos: `roles`, `permissions` y `role_permissions`. Dentro de estas tablas hemos definido quién puede hacer qué (34 permisos en total, asignados a los roles `admin`, `sales` y `user` según la matriz RBAC). Luego, cuando el cliente hace una petición a una ruta protegida, es el middleware `authorize` el que se encarga de verificar quién está ejecutando la acción (lo sabe gracias al JWT y a `req.auth`), consulta la configuración de permisos y confirmar que tenga asignado dicho permiso.

## Internacionalización

- La internacionalización se lleva a cabo mediante la librería i18N.
  
- Actualmente la internacionalización de la app web cuenta con 2 idiomas, inglés y español (en y es), siendo inglés el idioma por defecto.
  
- Para elegir el idioma a usar se deberán cambiar las cookies de idioma (lang), el método para hacerlo varía dependiendo de donde se esté usandola app:
    
    - Postman (agregar la cookie lang): Primero hay que añadir la cookie haciendo click en el botón "cookies" justo debajo del botón "send", en el menú que se despliega hay que hacer click en "add  new cookie" y reemplazar ```Cookie_1=value;``` por ```lang=en;``` o ```lang=es```, la cookie se guardará automáticamente.
      
    - Postman (Seleccionar idioma): Para cambiar de idioma modifica la cookie lang haciendo click al botón "cookies" y click a la cookie l"lang" que creamos anteriormente, aquí cambia el idioma de lang por el deseado, por ejemplo, para cambiar de inglés a español hay que cambiar ```lang=en;``` a ```lang=es```.
      
    - Navegador: Para cambiar de idioma en navegador hay que escribir ```?lang=<tu idioma como en o es>``` al final de la liga sin espacios, si no se escribe esta extensión la app se mostrará en inglés por ser el idioma por defecto.

Cabe notar que no existe soporte para variaciones regionales de los idiomas, así que si en la cookie se escribe algo como lang=es-MX la app mostrará la versión básica del idioma que si es soportada.

- Para agregar un nuevo idioma se deben de seguir una serie de pasos:
    
    - En config/i18n.js en la parte "locales" añadir letras representativas del idioma que se desee, por ejemplo "fr" para francés o "po" para portugués, estas letras servirán para saber el archivo json al cual la cookie deberá dirigirse, también se deberá actualizar el fallback agregando el nuevo idioma por ejemplo, escribir ```'po-*': 'po'``` para detectar cuando se escriba una variación del portugués como "po-BR" y redirigirlo al idioma básico.
      
    - Ahora hay que crear un nuevo archivo json en la carpeta "locales" utilizando las letras elegidas para representar nuestro idioma como nombre, siguiendo nuestro ejemplo el nombre del archivo sería "po.json".
      
    - Dentro del archivo json es donde se encuentran los textos traducidos y desde donde se cargan al resto del código, lo más simple sería copiar el contenido de uno de los archivos json ya existentes dentro de locales y solo reescribir los textos usando el idioma deseado, los textos se estructuran por grupos, los cuales contienen variables que representan los textos traducidos, el nombre de la variable es el texto entre " de la izquierda de los dos puntos y el texto traducido es el de la parte derecha, lo que se debe reescribir es el texto de la parte derecha de los dos puntos, una vez hecho esto solo hay que guardar el documento y los textos se cargarán cuando se cambie la cookie.
      
    - Para añadir nuevo texto hay que añadirlo primero a los archivos json en locales, ya sea añadiendo una nueva variable de texto a algún grupo o creando un nuevo grupo con nuevas variables de texto, y traducirlo al idioma respectivo de cada archivo, hay que procurar que todos los archivos json queden parejos (es decir con las mismas variables), luego hay que llamar al texto en donde se necesite colocando esta estructura ```req.__('<Nombre del grupo del texto>.<Nombre de la variable del texto>')``` en donde se devuelva un json, después del message. 


## Configuracion y Secretos
### Config - Cargado de variables de entorno
Para utilizar la aplicacion y hacer su despliegue se hacen uso de secretos y variables de entorno mediante la libreria ```config```.
La configuracion de variables de entorno pasa de ser en archivo ```.env``` multiples archivos que configuran cada entorno de ejecución, ```production```, ```development``` y ```test```.
Estructura de archivos
```
stride-co/
├── bin/
├── config/
│   ├──custom-environment-variables.json
│   ├──default.json
│   ├──local-development-example.json
│   ├──local-development.json
│   ├──local-production.json
│   ├──production.json
│   ├──test.json
... └── ...
```
Cada archivo proporciona diferentes variables y permite la separacion de responsabilidades, descentralizando los valores con los que se trabajan.
### Secuencia de registro/mapeo de variables
La manera ne la que trabaja config es que lee el archivo con menor prioridad y guarda sus datos, una vez hecho lee el siguente archivo que dependera de nuestra variable de ejecucion (```NODE_ENV=production||development||test```), los valores mapeados (entendiendo mapeado como declarados en el archivo ```.JSON```) se sobreescribiran en el archivo final.
#### Orden de ejecucion (```NODE_ENV=development```)
```default.json``` -> ```development.json``` -> ```local-development.json``` -> ```custom-environment-variables.json```.

Esto se aplica en cada entorno: 

```default.json``` -> ```production.json``` -> ```local-production.json``` -> ```custom-environment-variables.json```.

```default.json``` -> ```test.json``` -> ```custom-environment-variables.json```.

De esta manera podemos tener diferentes conexiones, nombres de bases de datos y ejecuciones en un solo proyecto sin necesidad de declarar muchisimas variables de entorno en un ```.env``` y cargarlo segun una de ellas.

### Secretos - Render
Los archivos secretos contienen informacion que nadie deberia conocer, se agrega al ```.gitignore``` para evitar la filtracion igual en el ```.dockerignore``` para no filtrar informacion sensible en la imagen generada.

La forma de cargar secretos en Render es accediendo al Dashboard de nuestro deploy e ingresar a la seccion "Environment" (Entorno). Dentro encontraremos dos cuadrados los cuales son las secciones de "Environment Variables" y "Secrets Files".
#### Environment Variables
Al presionar el boton de "Edit" podremos agregar las variables de entorno que ocupemos para poner en produccion nuestra aplicación.
[![0eZD75at9X](https://yourimageshare.com/ib/0eZD75at9X.png)](https://yourimageshare.com/ib/0eZD75at9X)
Una vez agregadas nuestras variables de entorno podremos guardarlas y re-desplegar nuestra aplicación con la nueva configuración.

Redner terminara ejecutando ```NODE_ENV=<value> PORT=<value> npm start```.
#### Secretos
Con los secretos, exactamente el mismo procedimiento pero ahora en la seccion de "Secret Files", en el botón "Edit" nos permitira agregar archivos, pero no subirlo si no que hay que especificar su nombre, extension y despues pegar el contenido dentro. En ningun momento se deben subir archivos de manera automatica.
[![N2tsMTRBAP](https://yourimageshare.com/ib/N2tsMTRBAP.png)](https://yourimageshare.com/ib/N2tsMTRBAP)
De la misma manera, guardar y re-desplegar la aplicación.
#### Uso de secretos
Por defecto, Render subira nuestros secretos a ```/etc/secrets/<filename>```, no podremos elegir donde ubicarlos, y como vimos, config ocupa que el archivo local-production.json detro de su propia carpeta, por lo que tendremos que especificar en el ```Dockerfile``` un comando para copiar el archivo en el arranque de la aplicación.
```shell
CMD ["sh", "-c", "cp /etc/secrets/local-production.json config/local-production.json && exec npm start"]
```
Podremos ver como hacemos copiado manualmente del archivo de la ruta predeterminada a nuestro directorio especificado, con esto la aplicación ya se encuentra lista para el despliegue.

## Pruebas
El proyecto cuenta con una suite automatizada construida sobre Jest y Supertest para garantizar el correcto funcionamiento de los controladores, middlewares y reglas de negocio de la API REST. Las pruebas están divididas en dos modalidades:

- Pruebas Unitarias y de Integración con Mocks (npm test)

Evalúan la lógica del sistema aislando las bases de datos externas (PostgreSQL en Render y MongoDB Atlas) mediante la simulación (mocking) de Sequelize, Mongoose y el middleware de control de acceso RBAC (AccessControl).
Para ejecutar el set de pruebas unitarias:
*npm test*

- Pruebas End-to-End (npm run test:e2e)

Validan el flujo real de la aplicación conectándose a la infraestructura remota de PostgreSQL y MongoDB Atlas.
Para ejecutar las pruebas E2E:
*npm run test:e2e*

- Evidencia de ejecución de las pruebas 2e2:
<img width="456" height="150" alt="image" src="https://github.com/user-attachments/assets/dd3f2c1b-1ace-4719-b624-2063ec77e71c" />

**Bitácora y documentación de la sesión:** [docs/e2e-antigravity.md](./docs/e2e-antigravity.md)

## Análisis de calidad de código
El análisis de calidad y formateo de código se realiza con ESLint para asegurar el cumplimiento de buenas prácticas.
Para ejecutar la revisión estática ejecuta:
*npm run lint*

## Configuración y secretos (pendiente)


## API PÚBLICA
### Url Pública 
https://stride-co-drfc.onrender.com/
### Health check
<img width="1014" height="277" alt="image" src="https://github.com/user-attachments/assets/debf30ba-0db5-4af7-a3f7-4eae8f0e70a1" />

### Usuarios de demostración
Creados por `npm run seed`. Las contraseñas son exclusivas de estas cuentas
y no se reutilizan en ningún otro lugar.
 
| Rol   | Nombre         | Correo          | Contraseña |
|-------|----------------|-----------------|------------|
| admin | Jesus Vill     | jesus@gmail.com | admin123   |
| sales | Dany Martinez  | dany@gmail.com  | sales123   |
| user  | Sofia Rivero   | sofia@gmail.com | usuario123 |

### Ejemplo de uso (pendiente)

### Render PostgresSQL (pendiende)
Fecha de creación: 2 de Noviembre de 2026 (02/11/2026)

### MongoDB Atlas (pendiente)
Proovedor: MongoDB
Región del cluster: AWS / Oregon (us-west-2)
Networks Access: Se configuro que se pueda consultar la base de datos desde todas las IP, agregando la dirección 0.0.0.0.
### Secretos (pendiente)
local-production.json
```shell
{
    "postgres":
    {
        "host": "",
        "port": "",
        "user": "",
        "password": ""
    },
    "mongodb": {
        "url": "",
        "user": "",
        "password": "",
        "protocol": ""
    },
    "auth": {
        "jwtSecret": "",
        "saltRounds": Number,
        "jwtExpires": "",
        "jwtIssuer": "",
        "jwtAudience": ""
    }
}
```

## Autores

* **Jesús Manuel Villegas Terrazas** — 385743
* **Alan Fabricio Vega Gutiérrez** — 385658 
* **Edgar Klassen Saenz** — 385429
* **Amir Ovedi Mendiaz Rodriguez** — 385686
