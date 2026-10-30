# 🏨 Hoteles · Laboratorio del módulo 5 (API REST)

Un cliente en TypeScript (sin framework) que habla con el `hotels-server` del módulo: CRUD completo con `fetch`, la misma API desde otro origen (CORS), peticiones en paralelo, con fallos y canceladas, y además una versión con axios, el proxy de Vite y validación con Zod. Parte de `05-api-rest/.start-code`. Cada obligatorio y cada opcional tiene su propio commit (`git log --oneline`).

Versiones: Node 22.17, Vite 8.3, TypeScript 6.0, axios 1.21, Zod 4.6 · servidor: Express 5.3, cors 2.8, tsx 4.23.

## 🚀 Cómo arrancarlo

**1. El servidor** (en una terminal):

```bash
cd hotels-server
npm install
npm run dev                        # http://localhost:3000, sin CORS
USE_CORS=yes npm run dev           # con CORS (macOS / Linux)
$env:USE_CORS="yes"; npm run dev   # con CORS (Windows PowerShell)
```

> Los datos viven en memoria: cada reinicio (también al guardar un fichero del servidor, por `tsx watch`) vuelve a los 10 hoteles iniciales.

**2. El cliente** (en otra terminal), de tres formas:

```bash
cd client
npm install
npm run build       # compila y copia dist/ a hotels-server/front → abrir http://localhost:3000
npm run dev         # Vite en http://localhost:5173, llama a http://localhost:3000/api (necesita USE_CORS)
npm run dev:proxy   # Vite en :5173 con proxy: llama a /api y Vite lo reenvía a :3000 (sin CORS)
```

| Modo                     | Origen de la página | `VITE_API_BASE`             | ¿Necesita `USE_CORS`?          |
| ------------------------ | ------------------- | --------------------------- | ------------------------------ |
| `npm run build` (O2, O4) | `localhost:3000`    | `http://localhost:3000/api` | No: mismo origen               |
| `npm run dev` (O3)       | `localhost:5173`    | `http://localhost:3000/api` | Sí (y aun así el POST falla)   |
| `npm run dev:proxy` (P2) | `localhost:5173`    | `/api` (de `.env.proxy`)    | No: el navegador sólo ve :5173 |

> ⚠️ Con `USE_CORS=yes` el servidor sirve `public/` en lugar de `front/`, así que en ese modo `http://localhost:3000` no muestra el cliente: hay que usar `npm run dev`.
>
> El `.npmrc` de cada carpeta apunta al registro público de npm: en mi máquina el registro global es uno corporativo que no da acceso a estos paquetes.

La página tiene cinco botones y un panel donde se escribe lo mismo que sale por consola:

| Botón                   | Qué hace                                                                                           | Apartado |
| ----------------------- | -------------------------------------------------------------------------------------------------- | -------- |
| **Probar CRUD**         | El recorrido de 6 pasos con el cliente `fetch` (`hotels.api.ts`).                                  | O2 / O3  |
| **Probar CRUD (axios)** | El mismo recorrido con el cliente axios (`hotels.axios.ts`).                                       | P1       |
| **Cargar todo**         | Hoteles y ciudades con `Promise.all`, y después una detrás de otra, con el tiempo de cada versión. | O4       |
| **Cargar con fallo**    | Lo mismo más `/api/nope`, primero con `Promise.all` y después con `Promise.allSettled`.            | O4       |
| **Recargar**            | Pide los hoteles cancelando la petición anterior si aún no ha terminado.                           | O4       |

## 🗂️ Estructura

```
.
├── hotels-server/            # el servidor del módulo, sin cambios (salvo .gitignore y .npmrc)
│   ├── src/index.ts          # rutas y orden de middlewares
│   ├── src/middleware.ts     # checkContentTypeJSON → 406
│   └── front/                # aquí copia el cliente `npm run build`
├── client/
│   ├── .env                  # VITE_API_BASE=http://localhost:3000/api   (O3)
│   ├── .env.proxy            # VITE_API_BASE=/api                         (P2)
│   ├── vite.config.ts        # server.proxy                               (P2)
│   └── src/
│       ├── hotels.api.ts     # modelo, esquema Zod, request<T> y las funciones (O2, O3, P5)
│       ├── hotels.axios.ts   # las mismas cinco funciones con axios       (P1)
│       ├── vite-env.d.ts     # tipo de import.meta.env.VITE_API_BASE
│       └── main.ts           # los botones (O2, O4, P1)
└── docs/                     # capturas
```

## ✅ Checklist

### Obligatorios

- [x] **O1** · Explorar la API con `curl` y rellenar la tabla.
- [x] **O2** · Cliente `fetch` con `request<T>` y las cinco funciones; botón «Probar CRUD».
- [x] **O3** · URL base en `VITE_API_BASE`; probado desde `:5173` sin y con CORS.
- [x] **O4** · «Cargar todo», «Cargar con fallo» y «Recargar».
- [x] **O5** · Este README y la bitácora.

### Opcionales

- [x] **P1** · Lo mismo con axios.
- [x] **P2** · El proxy de Vite.
- [ ] P3 · El ejercicio `client-cors`.
- [ ] P4 · Tueste con `json-server`.
- [x] **P5** · Validar con Zod.

### Desafíos

- [ ] D1 · Arreglar el servidor.
- [ ] D2 · Tiempo máximo y reintentos.
- [ ] D3 · Diseñar la API de Tueste.

## 📸 Capturas

| Error de CORS en consola (O3, sin `USE_CORS`)       | `OPTIONS` con 406 (O3, con `USE_CORS`)                       |
| --------------------------------------------------- | ------------------------------------------------------------ |
| ![Error de CORS en la consola](docs/cors-error.png) | ![Petición OPTIONS respondida con 406](docs/options-406.png) |

| Peticiones `(canceled)` (O4, Slow 4G, 5 clics en «Recargar»)           | «Cargar con fallo» (O4)                                                                                         |
| ---------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| ![Cuatro peticiones canceladas y la última con 200](docs/canceled.png) | ![Promise.all va al catch; Promise.allSettled muestra hoteles, ciudades y el error](docs/cargar-con-fallo.png) |

## 🔎 O1 · La API, probada con `curl`

Todas con `curl -i` contra `http://localhost:3000` y el servidor recién arrancado, en este orden (el DELETE afecta a la última fila). Salvo la primera, todas llevan `-H "Accept: application/json"`; el POST y el PUT, además, `-H "Content-Type: application/json"`.

| Petición | Código de estado | ¿Qué devuelve en el cuerpo? |
| --- | --- | --- |
| `GET /api/hotels` sin cabecera `Accept` | `406 Not Acceptable` | `{"error":"Not Acceptable"}` |
| `GET /api/hotels` con `Accept: application/json` | `200 OK` | `{"data":[…]}`: los 10 hoteles, cada uno con ~30 campos. |
| `GET /api/hotels/1` | `200 OK` | `{"data":{"id":"1","name":"Motif Seattle","city":"Seattle","lowRate":259,"highRate":289,…}}` |
| `GET /api/hotels/999` | `200 OK` ⚠️ | `{}`: un objeto vacío, **sin** la clave `data`. |
| `GET /api/cities` | `200 OK` | `{"data":[{"id":"Seattle","name":"Seattle"},…]}`: 5 ciudades. |
| `POST /api/hotels` con `{"name":"Hotel Tueste","city":"Seattle","lowRate":90,"highRate":120}` | `201 Created` | `{"data":{…lo enviado, "id":"<uuid>","created":…,"modified":…}}`: el servidor añade `id`, `created` y `modified`. |
| `PUT /api/hotels/1` con `{"lowRate":199}` | `200 OK` | `{"data":{…el hotel 1 completo con "lowRate":199 y "modified" nuevo}}`: mezcla los cambios, no sustituye el recurso. |
| `DELETE /api/hotels/1` | `204 No Content` | Nada. |
| `GET /api/hotels/1` después de borrarlo | `200 OK` ⚠️ | `{}`, igual que el 999. |

Probé también algunas más que no pedía la tabla, porque ayudan a entender el resto:

| Petición | Código | Cuerpo |
| --- | --- | --- |
| `PUT /api/hotels/999` | `200 OK` ⚠️ | `{"data":null}` |
| `DELETE /api/hotels/999` | `204` ⚠️ | Nada (no distingue si existía). |
| `GET /api/nope` | `404` | Una página **HTML** de Express: `Cannot GET /api/nope`. |
| `OPTIONS /api/hotels` (como un preflight) | `406` | `{"error":"Not Acceptable"}` |

**🔎 Comprobaciones**

- **Sin `Accept: application/json` todo falla.** En `middleware.ts`, `checkContentTypeJSON` compara la cabecera con `!==`: tiene que ser exactamente `application/json`. Si no, responde 406 y no llama a `next()`. Ni `*/*` (lo que manda curl por defecto) ni `application/json, text/plain, */*` (lo que manda axios, P1) pasan, aunque los dos aceptan JSON. Además, el nombre engaña: no comprueba el `Content-Type` sino el `Accept`.
- **Los datos vienen envueltos** en `{ "data": ... }`, tanto la colección como un hotel suelto.
- **Lo que no cuadra con la teoría:**
  1. `GET /api/hotels/999` (y el 1 ya borrado) devuelve **200 con `{}`** en lugar de 404. `findById` devuelve `undefined`, `res.json({ data: undefined })` serializa como `{}`, y nadie mira si existía.
  2. Un **`PUT` o `DELETE` sobre un hotel que no existe** responde 200 `{"data":null}` y 204: el concepto 02 dice que el código tiene que reflejar lo que ha pasado de verdad.
  3. El **`POST` no valida nada**: con un cuerpo cualquiera crea igual un hotel y responde 201 (debería ser 400).
  4. El cuerpo del **406** es `{"error":"Not Acceptable"}`, no el sobre de error del concepto 02 (`{ "error": { "code", "message", "field" } }`), y el **404 de una ruta desconocida** es HTML, no JSON.
  5. El `PUT` hace en realidad lo que el concepto 01 llama `PATCH` (mezcla los campos enviados con el hotel existente).
  6. Los comentarios de `smoke-api-test.sh` dicen que el POST y el PUT devuelven 204, pero devuelven 201 y 200 con el recurso. Además, el script no manda `Accept`, así que todas sus peticiones dan 406.

## 📝 Respuestas

### O1 · Explorar la API

**¿Qué código debería devolver `GET /api/hotels/999`? ¿Qué devuelve? ¿Qué problema le causa al front?**
Según el concepto 01, `404 Not Found` («the requested URI does not exist»). Este servidor devuelve `200 OK` con `{}`. Para el front, eso significa que `response.ok` es `true` y el «no existe» no se puede detectar con el código de estado: hay que mirar el cuerpo y saber que un `{}` sin `data` quiere decir «no encontrado». Si no lo haces, `data` es `undefined` y el error salta más tarde y lejos de su causa (`Cannot read properties of undefined (reading 'name')`). Es lo que hago en `getHotel` (O2), y es una regla que depende de un detalle de implementación del servidor: si mañana devuelve `{"data":null}` también la cubre (`?? null`), pero si devuelve otra cosa, no.

**¿Por qué el DELETE no devuelve cuerpo? ¿Qué código lo indica?**
Porque después de borrar no queda ningún recurso que devolver: el cliente sólo necesita saber que ha ido bien. Lo indica `204 No Content` («la acción ha ido bien y no hay cuerpo»). Por eso el cliente no debe llamar a `response.json()` en un 204: no hay JSON que leer y lanzaría `Unexpected end of JSON input`.

**¿Qué ventaja tiene envolver las respuestas en `{ "data": ... }` frente a devolver el array?**
Que el objeto se puede ampliar sin romper a nadie. Mañana se puede añadir `pagination`, `meta` o un `error` al lado de `data`, y los clientes que leen `data` siguen funcionando. Con un array en la raíz no hay sitio para nada más, y añadirlo obliga a cambiar el formato. Además, todas las respuestas tienen la misma forma, así que el cliente puede desenvolverlas en un único sitio (`request<T>`).

### O2 · Un cliente con `fetch`

**`fetch` no lanza con un 404 o un 500. ¿Cuándo sí lanza? ¿Qué pasaría si no comprobaseis `response.ok`?**
`fetch` sólo rechaza cuando **no llega ninguna respuesta HTTP utilizable**: fallo de red, servidor apagado, DNS, una respuesta que el navegador bloquea por CORS (`TypeError: Failed to fetch`, lo vimos en O3), o una petición cancelada con un `AbortSignal` (`AbortError`). Un 404 o un 500 son respuestas válidas para `fetch`, y resuelve con `ok: false`.
Sin comprobar `response.ok`, el código seguiría como si todo hubiera ido bien. Con el 406, `response.json()` devuelve `{"error":"Not Acceptable"}`, el `data` desestructurado es `undefined` y `getHotels()` devolvería `undefined` sin avisar. El primer error visible sería un `Cannot read properties of undefined (reading 'length')` en `main.ts`, muy lejos de la causa. Con el 404 en HTML de `/api/nope`, `response.json()` lanzaría un `SyntaxError` igual de engañoso. Con la comprobación, quitar el `Accept` de `request` hace que la consola diga `GET http://localhost:3000/api/hotels → 406 Not Acceptable`.

**¿Por qué `createHotel` no envía el `id`? ¿Quién lo decide?**
Lo decide el servidor: `HotelRepository.create` genera un `crypto.randomUUID()` y añade `created` y `modified`. El servidor es el que conoce todos los hoteles, así que es el único que puede garantizar que el id es único. Por eso el tipo de entrada es `NewHotel = Omit<Hotel, "id">`, y el id se lee de la respuesta del 201 (`created.id`), que es el recurso ya creado.

### O3 · CORS

**¿Quién bloquea la respuesta: el servidor o el navegador? ¿Por qué `curl` no tenía este problema?**
El **navegador**. El servidor recibió la petición y respondió con normalidad (en su terminal sale `GET /api/hotels 200`, o `304` si estaba en caché, y en Network la petición aparece). Pero esa respuesta no traía `Access-Control-Allow-Origin`, y como la página es de `http://localhost:5173` y la API de `http://localhost:3000` (otro puerto = otro origen), el navegador aplica la política del mismo origen y no le entrega la respuesta a JavaScript: `fetch` rechaza con `TypeError: Failed to fetch`. CORS es una regla del navegador para proteger al usuario. `curl` no es un navegador: no hay página, ni origen, ni usuario cuyas cookies proteger, así que no aplica esa política y enseña la respuesta tal cual.

**¿Por qué el GET no necesita la petición `OPTIONS` y el POST sí?**
El GET es una **petición simple**: método `GET` y sólo cabeceras de la lista segura (`Accept` lo es). El navegador la manda directamente y luego decide si deja leer la respuesta. El POST lleva `Content-Type: application/json`, y para que una petición siga siendo simple el `Content-Type` sólo puede ser `text/plain`, `multipart/form-data` o `application/x-www-form-urlencoded`. Con JSON, el navegador primero manda un **preflight**: un `OPTIONS` con `Origin`, `Access-Control-Request-Method: POST` y `Access-Control-Request-Headers: accept, content-type`, para preguntar si puede. Sólo si el servidor responde bien (2xx con las cabeceras `Access-Control-Allow-*`) manda el POST de verdad. Lo mismo pasaría con PUT y DELETE, que no son métodos simples.

**El error del POST y por qué el `OPTIONS` responde 406.**
La consola dice:

> Access to fetch at 'http://localhost:3000/api/hotels' from origin 'http://localhost:5173' has been blocked by CORS policy: **Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.**

En la tabla de la demo 04 cumple dos filas a la vez. Es la de *«Response to preflight request doesn't pass access control check»*, porque el `OPTIONS` no tiene un estado OK (406). Y es la de *«No 'Access-Control-Allow-Origin' header is present»*, porque esa respuesta no lleva la cabecera. Las dos tienen la misma causa: el **orden de los middlewares** en `index.ts`:

```ts
app.use('/api', checkContentTypeJSON);   // 1º
// …
if (useCORS) {
  app.use("/api", cors());               // 2º
}
```

El preflight lo genera el navegador, no nuestro código, así que no lleva nuestro `Accept: application/json`, sino `Accept: */*`. `checkContentTypeJSON` corre primero, ve un `Accept` distinto de `application/json` y responde 406 **sin llamar a `next()`**. `cors()` no llega a ejecutarse, así que no contesta el `OPTIONS` con su 204 ni añade `Access-Control-Allow-Origin` (en el log del servidor: `OPTIONS /api/hotels 406`). El GET sí funciona porque lleva el `Accept` correcto: pasa el primer middleware y `cors()` le añade `Access-Control-Allow-Origin: *`. El arreglo (D1, no hecho) sería registrar `cors()` antes de `checkContentTypeJSON`, o dejar pasar los `OPTIONS` en el middleware.

### O4 · Varias peticiones

**Lo que medí.** Con la red sin limitar las dos versiones tardan lo mismo (3-4 ms: no hay espera que solapar). Con **Slow 4G**, en paralelo tardó **586 ms** y una detrás de otra **1149 ms**, casi el doble, que es lo esperable: en paralelo se tarda lo que la más lenta, en secuencia la suma. En el Waterfall, las dos peticiones de `Promise.all` empiezan a la vez, y en la versión secuencial la de ciudades empieza cuando acaba la de hoteles. Con «Cargar con fallo», `Promise.all` va directo al `catch` con `GET …/api/nope → 404 Not Found` y no pinta nada (aunque hoteles y ciudades sí llegaron), mientras que `Promise.allSettled` pinta los 10 hoteles, las 5 ciudades y el error. Con Slow 4G y cinco clics seguidos en «Recargar», las cuatro primeras peticiones aparecen como `(canceled)` y sólo la última pinta «✔ 10 hoteles».

**¿`Promise.all` o `Promise.allSettled`?**
Para una pantalla que necesita hoteles **y** ciudades para funcionar, `Promise.all`: si falta una de las dos la pantalla no sirve, así que conviene fallar en cuanto falle cualquiera y enseñar un único error (o reintentar) en vez de pintar media pantalla. Para un panel de bloques independientes (el tiempo, las noticias, la bolsa), `Promise.allSettled`: que falle la bolsa no debe impedir ver el tiempo. Cada bloque se pinta con su dato o con su propio mensaje de error.

**¿Dónde habíamos usado ya un `AbortController`? ¿Para qué?**
En el laboratorio 4 (O3), en el `useEffect` de `useCoffees`/`useCoffee` (`core/coffees/hooks.ts`): se crea un controlador, se pasa su `signal` a la llamada a la API y la función de limpieza hace `controller.abort()`. Así, si el componente se desmonta (o cambia el id) antes de que llegue la respuesta, la petición se cancela y no se hace un `setState` con datos viejos sobre un componente que ya no está. En `StrictMode` se ve el montaje, la limpieza y el segundo montaje. Aquí es la misma idea para otro caso: la cancelación la provoca un clic nuevo, no un desmontaje. En los dos el `AbortError` no es un fallo: lo hemos provocado nosotros, así que no se enseña como error (en «Recargar» sale como `console.info`).

### P1 · axios frente a `fetch`

La primera versión de `hotels.axios.ts`, sin configurar nada, falló con **406**. En Network se ve que axios manda por defecto `Accept: application/json, text/plain, */*`, que acepta JSON pero no es exactamente `application/json`, y el middleware compara con `!==`. Lo arreglé una sola vez creando la instancia con `axios.create({ baseURL, headers: { Accept: "application/json" } })`, y todas las funciones la usan.

| | `fetch` + `request<T>` | axios |
| --- | --- | --- |
| Errores HTTP | Hay que comprobar `response.ok` a mano; `fetch` sólo rechaza si no hay respuesta. | **Rechaza con cualquier estado fuera de 2xx** (`AxiosError`, con `error.response.status`). No hace falta comprobar nada, pero un 404 que quieras tratar como «no existe» va al `catch` y hay que distinguirlo allí. |
| JSON | `JSON.stringify` del cuerpo, `Content-Type` y `response.json()`, a mano. | Serializa el cuerpo, pone `Content-Type: application/json` y parsea la respuesta solo. |
| 204 | Hay que saltarse `response.json()` a mano. | Lo gestiona solo (`data` vacío). |
| Configuración común | La función `request<T>` que he escrito yo. | `axios.create` (`baseURL`, cabeceras, interceptores). |
| Peso | Nativo, 0 KB. | Una dependencia más en el bundle. |

Lo que axios me ahorra es casi exactamente lo que hace `request<T>`. Lo que no me ahorra es el sobre `{ data }`: el `data` de axios es el cuerpo entero, así que queda el `data.data`. Y con este servidor no hay diferencia en `getHotel`, porque el «no existe» llega como 200 `{}`, no como 404.

### P2 · Por qué el proxy de Vite no sirve en producción

Con `npm run dev:proxy`, el cliente llama a `/api/...` en **su propio origen** (`localhost:5173`) y el servidor de desarrollo de Vite reenvía la petición a `localhost:3000`, de servidor a servidor. El navegador sólo ve un origen, así que no hay CORS ni preflight, y el CRUD completo funciona sin `USE_CORS` (en Network las siete peticiones van a `localhost:5173/api/...`).
Pero `server.proxy` es una opción de `vite dev`. `npm run build` sólo genera ficheros estáticos en `dist/`: en producción no hay ningún servidor de Vite que reenvíe nada, y un `/api` relativo apuntaría al servidor que sirva esos ficheros. Para producción hay que publicar el front y la API en el mismo origen (como hace `hotels-server` con `front/`, o con un proxy inverso tipo Nginx), o configurar CORS bien en la API. El proxy sólo esconde el problema en local.

### P5 · Validar lo que llega

`hotelSchema` (Zod) describe los cinco campos que uso, y el tipo `Hotel` sale de él con `z.infer`, así que no hay dos definiciones que mantener sincronizadas. `getHotels` y `getHotel` pasan la respuesta por `safeParse`: si no cuadra, lanzan un error con `z.prettifyError`, y si cuadra devuelven sólo esos cinco campos (Zod descarta el resto). Para probarlo rompí el hotel 2:

```bash
curl -X PUT -H "Accept: application/json" -H "Content-Type: application/json" \
  -d '{"lowRate":"barato"}' http://localhost:3000/api/hotels/2
```

El servidor lo acepta (200, no valida). «Cargar todo» muestra entonces `Respuesta inesperada de /hotels: ✖ Invalid input: expected number, received string → at [1].lowRate`, y `getHotel("2")` falla con el mismo error `→ at lowRate`. Con un `as Hotel[]`, ese `"barato"` habría llegado hasta la interfaz y algo como `lowRate.toFixed(2)` habría fallado mucho más tarde. Valido sólo en las lecturas (lo que pide el enunciado). `createHotel` y `updateHotel` confían en la respuesta del servidor.

## 🤖 Bitácora de IA

**Herramienta:** Claude Code (Claude Opus 5.5) en la terminal, con acceso al repositorio, a los apuntes del módulo (`05-api-rest`) y a Chrome mediante DevTools para comprobar cada paso en Network y consola.

### Cómo trabajé

Le pasé el enunciado completo y le pedí que leyese los conceptos y las demos antes de escribir nada. Primero lanzó todas las peticiones de O1 con `curl -i` contra el servidor y, a partir de esas respuestas reales (no de lo que dice la teoría), escribió el cliente. Cada obligatorio y cada opcional se comprobó en el navegador y tiene su propio commit.

### Detectar el «no existe» en `getHotel` (O2)

#### Prompt

"`getHotel` devuelve `Promise<Hotel | null>`: `null` cuando el hotel no existe (os toca decidir cómo detectarlo, viendo lo que descubristeis en O1)."

#### Qué me dio

Un `getHotel` que devuelve `null` cuando el `data` desenvuelto es `undefined` (`hotel ?? null`).

#### Qué corregí y por qué

No hubo que corregirlo, pero sí comprobarlo, porque la pista del enunciado («200 con `{}`») invita a mirar si el hotel es un objeto vacío. El `{}` es la respuesta **entera**, no el `data`: `res.json({ data: undefined })` se queda sin la clave. Después de desenvolver, lo que llega es `undefined`. Una comprobación de «objeto vacío» sobre `data` no se cumpliría nunca y `getHotel` devolvería `undefined` en lugar de `null`. Lo confirmé con `curl -i` (cuerpo de 2 bytes: `{}`) y con el paso 5 del recorrido, que imprime `null`.

### El 406 de axios (P1)

#### Prompt

"Haz P1: crea hotels.axios.ts con las mismas cinco funciones usando axios. Primero sin tocar nada, para ver el fallo."

#### Qué me dio

La versión directa con `axios.create({ baseURL })`, que falló con `Request failed with status code 406`.

#### Qué corregí y por qué

En vez de suponer la causa, miramos las cabeceras de la petición en Network: axios manda `Accept: application/json, text/plain, */*`. Esa cabecera **sí** acepta JSON (un servidor que negociase el contenido bien la daría por buena), pero el middleware compara con `!==`. Lo arreglé poniendo `Accept: application/json` una sola vez en la instancia, no en cada llamada. El fallo de fondo es del servidor, que debería usar `req.accepts("json")` en lugar de comparar la cadena.

### El `postbuild` del código de partida

#### Prompt

"Como en las demos, el cliente se construye y lo sirve el propio servidor: `npm run build` en client y abrid http://localhost:3000."

#### Qué me dio

El build tal cual, con el `postbuild` del código de partida: `cp -r dist/ ../hotels-server/front`.

#### Qué corregí y por qué

Ese `cp` copia encima de lo que ya hay, así que `front/assets` iba acumulando los `index-*.js` de todos los builds anteriores (el código de partida ya traía cinco). Como `front/` está en el repositorio, cada build habría metido ficheros muertos en el commit. Ahora el `postbuild` borra la carpeta antes de copiar: `rm -rf ../hotels-server/front && cp -r dist ../hotels-server/front`.
