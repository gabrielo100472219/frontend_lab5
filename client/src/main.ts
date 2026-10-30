import "./style.css";
import * as fetchClient from "./hotels.api.ts";
import { getCities, getHotels, request } from "./hotels.api.ts";
import * as axiosClient from "./hotels.axios.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<main>
  <h1>Hoteles · laboratorio API REST</h1>
  <div class="actions">
    <button id="crud" type="button">Probar CRUD</button>
    <button id="crud-axios" type="button">Probar CRUD (axios)</button>
    <button id="load-all" type="button">Cargar todo</button>
    <button id="load-failing" type="button">Cargar con fallo</button>
    <button id="reload" type="button">Recargar</button>
  </div>
  <pre id="output" aria-live="polite"></pre>
</main>
`;

const output = document.querySelector<HTMLPreElement>("#output")!;

// Each step goes to the console (what the lab checks) and to the page.
const log = (...values: unknown[]) => {
  console.log(...values);
  output.textContent += values.map(String).join(" ") + "\n";
};

const logError = (error: unknown) => {
  console.error(error);
  output.textContent += `✖ ${error instanceof Error ? error.message : String(error)}\n`;
};

type HotelsClient = Pick<
  typeof fetchClient,
  "getHotels" | "getHotel" | "createHotel" | "updateHotel" | "deleteHotel"
>;

// The same walk-through works with both clients: they share the signatures.
const runCrud = async ({
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
}: HotelsClient) => {
  output.textContent = "";
  try {
    log("1", (await getHotels()).length);
    const created = await createHotel({
      name: "Hotel Tueste",
      city: "Seattle",
      lowRate: 90,
      highRate: 120,
    });
    log("2", created.name, created.id);
    log("3", (await getHotel(created.id))?.name);
    log("4", (await updateHotel(created.id, { lowRate: 95 })).lowRate);
    await deleteHotel(created.id);
    log("5", await getHotel(created.id));
    log("6", (await getHotels()).length);
  } catch (error) {
    logError(error);
  }
};

const ms = (start: number) => `${Math.round(performance.now() - start)} ms`;

const loadAll = async () => {
  output.textContent = "";
  try {
    let start = performance.now();
    const [hotels, cities] = await Promise.all([getHotels(), getCities()]);
    log(
      `En paralelo: ${hotels.length} hoteles, ${cities.length} ciudades (${ms(start)})`,
    );

    start = performance.now();
    const hotelsInOrder = await getHotels();
    const citiesInOrder = await getCities();
    log(
      `Una detrás de otra: ${hotelsInOrder.length} hoteles, ${citiesInOrder.length} ciudades (${ms(start)})`,
    );
  } catch (error) {
    logError(error);
  }
};

const loadWithFailure = async () => {
  output.textContent = "";

  log("— Promise.all");
  try {
    const [hotels, cities] = await Promise.all([
      getHotels(),
      getCities(),
      request("/nope"),
    ]);
    log(`${hotels.length} hoteles, ${cities.length} ciudades`);
  } catch (error) {
    logError(error);
  }

  log("— Promise.allSettled");
  const labels = ["hoteles", "ciudades", "/nope"];
  const results = await Promise.allSettled([
    getHotels(),
    getCities(),
    request("/nope"),
  ]);
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      const value = result.value as unknown[];
      log(`✔ ${labels[index]}: ${value.length}`);
    } else {
      logError(result.reason);
    }
  });
};

// Only the last click counts: each new one aborts the request still in flight.
let reloadController: AbortController | null = null;

const reload = async () => {
  reloadController?.abort();
  const controller = new AbortController();
  reloadController = controller;
  log("Recargando…");

  try {
    const hotels = await getHotels(controller.signal);
    log(`✔ ${hotels.length} hoteles`);
  } catch (error) {
    // We caused the AbortError ourselves: it is not a failure to show.
    if (error instanceof DOMException && error.name === "AbortError") {
      console.info("Petición anterior cancelada");
      return;
    }
    logError(error);
  }
};

document
  .querySelector("#crud")!
  .addEventListener("click", () => runCrud(fetchClient));
document
  .querySelector("#crud-axios")!
  .addEventListener("click", () => runCrud(axiosClient));
document.querySelector("#load-all")!.addEventListener("click", loadAll);
document
  .querySelector("#load-failing")!
  .addEventListener("click", loadWithFailure);
document.querySelector("#reload")!.addEventListener("click", reload);
