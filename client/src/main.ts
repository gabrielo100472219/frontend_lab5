import "./style.css";
import {
  createHotel,
  deleteHotel,
  getHotel,
  getHotels,
  updateHotel,
} from "./hotels.api.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
<main>
  <h1>Hoteles · laboratorio API REST</h1>
  <div class="actions">
    <button id="crud" type="button">Probar CRUD</button>
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

const runCrud = async () => {
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

document.querySelector("#crud")!.addEventListener("click", runCrud);
