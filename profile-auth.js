// profile-auth.js – Auth guard + UI + charts + CSV loader (final)
let auth0Client;
const REDIRECT_BASE = "http://127.0.0.1:8000"; // or http://localhost:8000

// CSV paths to try (first that exists is used)
const CSV_PATHS = [
  "Assets/outage_predictions.csv",
  "Assets/sub.csv"
];

async function configureAuth0() {
  if (auth0Client) return auth0Client;
  const res = await fetch("./auth_config.json");
  const cfg = await res.json();
  auth0Client = await auth0.createAuth0Client({
    domain: cfg.domain,
    clientId: cfg.clientId,
    authorizationParams: {
      redirect_uri: `${REDIRECT_BASE}/profile.html`
    },
    cacheLocation: "localstorage"
  });
  return auth0Client;
}

/* ------------ CSV helper ------------ */
async function tryFetchText(path){
  try{
    const r = await fetch(path, { cache: "no-cache" });
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  }catch(e){
    console.warn(`[csv] could not load ${path}:`, e.message || e);
    return null;
  }
}
async function loadCsvTextFrom(paths){
  for(const p of paths){
    const txt = await tryFetchText(p);
    if(txt) return { txt, path: p };
  }
  throw new Error("No CSV found at configured paths.");
}
function parseOutageCsv(txt){
  const rows = txt.trim().split(/\r?\n/).map(r => r.split(",").map(c => c.trim()));
  const header = rows[0].map(h => h.toLowerCase());
  let regionIdx = header.findIndex(h => /region|area|city|location/.test(h));
  let probIdx = header.findIndex(h => /prob|chance|score|likelihood|outage/.test(h));

  let dataRows = rows;
  if (regionIdx !== -1 || probIdx !== -1) dataRows = rows.slice(1);
  if (regionIdx === -1) regionIdx = 0;
  if (probIdx === -1) probIdx = 1;

  const labels = [], values = [];
  for(const r of dataRows){
    const region = r[regionIdx];
    const raw = parseFloat(r[probIdx]);
    if(!region || Number.isNaN(raw)) continue;
    const pct = raw <= 1 ? raw * 100 : raw; // accept 0–1 or %
    labels.push(region);
    values.push(Math.max(0, Math.min(100, pct)));
  }
  return { labels, values };
}

/* ------------ Charts ------------ */
function renderChiGauge(canvas, chi=83){
  if(!canvas || typeof Chart === "undefined") return;
  new Chart(canvas, {
    type: "doughnut",
    data: { labels:["CHI",""], datasets:[{ data:[chi,100-chi], borderWidth:0, cutout:"70%" }] },
    options: { responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false}, tooltip:{enabled:false} }
    }
  });
}
function renderChiTrend(canvas){
  if(!canvas || typeof Chart === "undefined") return;
  const points=[68,72,74,73,75,79,80,82,83];
  new Chart(canvas, {
    type:"line",
    data:{ labels:["04:00","06:00","08:00","10:00","12:00","14:00","16:00","18:00","Now"],
      datasets:[{ data:points, tension:.35, borderWidth:3, fill:false }] },
    options:{ responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{display:false} },
      scales:{ y:{ suggestedMin:50, suggestedMax:100 } }
    }
  });
}
async function renderOutageBar(canvas){
  if(!canvas || typeof Chart === "undefined") return;
  try{
    const { txt, path } = await loadCsvTextFrom(CSV_PATHS);
    const { labels, values } = parseOutageCsv(txt);
    if(!labels.length){ canvas.replaceWith(makeNote(`No rows found in ${path}. Need "region, probability".`)); return; }
    new Chart(canvas, {
      type:"bar",
      data:{ labels, datasets:[{ data:values, borderWidth:0, borderRadius:8, label:"Outage Probability (%)" }] },
      options:{ responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{display:false} },
        scales:{ y:{ suggestedMin:0, suggestedMax:100, ticks:{ callback:v=>v+"%" } } }
      }
    });
  }catch(e){
    console.warn("[chart] outage bar error:", e);
    canvas.replaceWith(makeNote("Could not load outage CSV. Place file at Assets/outage_predictions.csv or Assets/sub.csv."));
  }
}
function makeNote(text){
  const div = document.createElement("div");
  div.className = "placeholder-chart";
  div.textContent = text;
  return div;
}

/* ------------ Main ------------ */
async function requireAuthAndRender(){
  const client = await configureAuth0();

  // Complete redirect if returning from Auth0
  if (location.search.includes("code=") || location.search.includes("state=")){
    await client.handleRedirectCallback();
    history.replaceState({}, document.title, location.pathname);
  }

  // Guard
  const isAuthed = await client.isAuthenticated();
  if(!isAuthed){ location.href = "login.html"; return; }

  // User info
  const user = await client.getUser();
  const name = user?.name || "there";
  const email = user?.email || "";
  const nameEl = document.getElementById("userName");
  const emailEl = document.getElementById("userEmail");
  const picEl = document.getElementById("userPicture");
  const greetEl = document.getElementById("dashGreeting");
  if(nameEl) nameEl.textContent = name;
  if(emailEl) emailEl.textContent = email;
  if(greetEl) greetEl.textContent = `Hi, ${name.split(" ")[0]} 👋`;
  if(picEl && user?.picture){ picEl.src = user.picture; picEl.alt = name; }

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    client.logout({ logoutParams: { returnTo: `${REDIRECT_BASE}/index.html` } });
  });
  document.getElementById("logoutBtnRail")?.addEventListener("click", () => {
  client.logout({ logoutParams: { returnTo: `${REDIRECT_BASE}/index.html` } });
});

  // Tabs
  // support both the old text tabs and the new rail buttons
    const tabs = Array.from(document.querySelectorAll(".dash-tab, .rail-btn"));

  const panels = {
    home: document.getElementById("tab-home"),
    dashboard: document.getElementById("tab-dashboard"),
    sentiment: document.getElementById("tab-sentiment"),
    feedback: document.getElementById("tab-feedback"),
    outages: document.getElementById("tab-outages"),
    tasks: document.getElementById("tab-tasks"),
    settings: document.getElementById("tab-settings"),
  };
  function showTab(id){
    tabs.forEach(b => b.classList.toggle("active", b.dataset.tab === id));
    Object.entries(panels).forEach(([k,el]) => el.classList.toggle("show", k===id));
    window.scrollTo({ top:0, behavior:"smooth" });
  }
  tabs.forEach(btn => btn.addEventListener("click", () => showTab(btn.dataset.tab)));

  document.querySelectorAll(".q-link")?.forEach(a => {
    a.addEventListener("click", () => showTab(a.dataset.go));
  });

  // Tasks (local)
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const KEY = "hq.tasks";
  let tasks = JSON.parse(localStorage.getItem(KEY) || "[]");
  function renderTasks(){
    if(!taskList) return;
    taskList.innerHTML = "";
    tasks.forEach((t,i) => {
      const li = document.createElement("li");
      li.className = t.done ? "done" : "";
      li.innerHTML = `<span>${t.text}</span>
        <div class="row">
          <button class="btn-primary" data-done="${i}">${t.done ? "Undone" : "Done"}</button>
          <button class="dash-logout" data-del="${i}">Delete</button>
        </div>`;
      taskList.appendChild(li);
    });
  }
  function save(){ localStorage.setItem(KEY, JSON.stringify(tasks)); }
  taskForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const v = taskInput.value.trim();
    if(!v) return;
    tasks.unshift({ text:v, done:false });
    taskInput.value = "";
    save(); renderTasks();
  });
  taskList?.addEventListener("click", (e) => {
    const d = e.target.dataset || {};
    if("done" in d){ const i=+d.done; tasks[i].done=!tasks[i].done; save(); renderTasks(); }
    if("del" in d){ const i=+d.del; tasks.splice(i,1); save(); renderTasks(); }
  });
  renderTasks();

  // Sidebar toggle
  document.getElementById("sidebarToggle")?.addEventListener("click", () => {
    document.getElementById("appShell")?.classList.toggle("collapsed");
  });

  // Default tab (home like the screenshot)
  showTab("home");

  // Charts (Dashboard tab)
  renderChiGauge(document.getElementById("chiGauge"), 83);
  renderChiTrend(document.getElementById("chiTrend"));
  renderOutageBar(document.getElementById("outageBar"));
}

document.addEventListener("DOMContentLoaded", requireAuthAndRender);
