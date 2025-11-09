// ===== Config =====
const BACKEND = "http://127.0.0.1:5001";          // your API (Gemini proxy etc.)
const REDIRECT_BASE = "http://127.0.0.1:8000";    // keep consistent across app

let auth0Client = null;

// ===== Auth0 =====
async function configureAuth0() {
  if (auth0Client) return auth0Client;
  const cfg = await (await fetch("./auth_config.json")).json();
  auth0Client = await auth0.createAuth0Client({
    domain: cfg.domain,
    clientId: cfg.clientId,
    authorizationParams: { redirect_uri: `${REDIRECT_BASE}/profile.html` },
    cacheLocation: "localstorage"
  });
  return auth0Client;
}

// ===== App Boot =====
async function bootApp() {
  const client = await configureAuth0();

  // Handle callback
  if (location.search.includes("code=") || location.search.includes("state=")) {
    await client.handleRedirectCallback();
    history.replaceState({}, document.title, location.pathname);
  }

  // Guard
  if (!(await client.isAuthenticated())) {
    location.href = "login.html";
    return;
  }

  // User
  const user = await client.getUser();
  const name = user?.name || "there";
  const first = name.split(" ")[0];

  document.getElementById("greet").textContent = `Hi, ${first} 👋`;
  document.getElementById("firstName").textContent = first;

  const picUrl =
    (user && user.picture) ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(first)}&background=274156&color=fff&size=96`;

  const avatar = document.getElementById("userPicture");
  avatar.src = picUrl;
  avatar.alt = name;
  avatar.onerror = () => {
    avatar.onerror = null;
    avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(first)}&background=274156&color=fff&size=96`;
  };

  const email = user?.email || "";
  document.getElementById("userName").textContent = name;
  document.getElementById("userEmail").textContent = email;

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    client.logout({ logoutParams: { returnTo: `${REDIRECT_BASE}/index.html` } });
  });

  // Sidebar collapse/expand
  document.getElementById("toggle")?.addEventListener("click", () => {
    document.getElementById("shell")?.classList.toggle("collapsed");
  });

  // Tabs
  const btns = [...document.querySelectorAll(".nav-btn")];
  const panels = ["dashboard","sentiment","outages","tasks","settings"]
    .reduce((acc,id)=> (acc[id]=document.getElementById(id), acc), {});
  function show(id){
    // Redirect to YouTube if outages tab is clicked
    if (id === "outages") {
      window.location.href = "https://www.youtube.com/watch?v=G3iyERBI--g";
      return;
    }
    btns.forEach(b => b.classList.toggle("active", b.dataset.tab===id));
    Object.entries(panels).forEach(([k,el]) => el.classList.toggle("show", k===id));
    window.scrollTo({top:0, behavior:"smooth"});
  }
  btns.forEach(b => b.addEventListener("click", () => show(b.dataset.tab)));
  show("dashboard");

  // Charts
  const trendEl = document.getElementById("trendChart");
  if (trendEl) {
    new Chart(trendEl, {
      type:"line",
      data:{ labels:["04:00","08:00","12:00","16:00","20:00","Now"],
        datasets:[{ data:[61,64,68,71,79,83], borderColor:"#D90368", fill:false, tension:.35, pointRadius:0 }]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}},
        scales:{ y:{ suggestedMin:50, suggestedMax:100, grid:{color:"#eef2f7"} }, x:{ grid:{display:false}}}}
    });
  }

  const barEl = document.getElementById("barChart");
  if (barEl) {
    new Chart(barEl, {
      type:"bar",
      data:{ labels:["West","East","Midwest"],
        datasets:[{ data:[32,45,23], backgroundColor:["#1C6E8C","#D90368","#F59E0B"], borderRadius:10 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{ max:100, beginAtZero:true }}}
    });
  }

  const compEl = document.getElementById("competitorChart");
  if (compEl) {
    new Chart(compEl, {
      type:"bar",
      data:{ labels:["HarmoniQ","Spectrum","Verizon"],
        datasets:[{ data:[83,76,79], backgroundColor:["#D90368","#9CA3AF","#9CA3AF"], borderRadius:10 }] },
      options:{ responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ y:{ suggestedMax:100 }}}
    });
  }

  // Gemini Suggestions
  async function aiTriage(){
    try{
      const payload = {
        chi:83,
        chi_trend:[68,72,74,73,75,79,80,82,83],
        outages:(window.__outages||[{region:"West",probability:0.32},{region:"East",probability:0.45},{region:"Midwest",probability:0.23}]),
        sentiment:{ pos:58, neg:29, neu:13 },
        incidents:[], backlog:[]
      };
      const r = await fetch(`${BACKEND}/ai/triage`, {
        method:"POST", headers:{ "Content-Type":"application/json" }, body:JSON.stringify(payload)
      });
      const data = await r.json();
      const ul = document.getElementById("aiTriageList");
      ul.innerHTML = "";
      data.prioritized_tasks.forEach(t=>{
        const li = document.createElement("li");
        li.innerHTML = `
          <div><strong>${t.title}</strong><br><small class="muted">${t.why}</small></div>
          <div style="display:flex;gap:6px;">
            <span class="pill ${t.priority==='P0'?'bad':t.priority==='P1'?'warn':'ok'}">${t.priority}</span>
            <span class="pill">${t.impact}</span>
            <span class="pill">${t.effort}</span>
          </div>`;
        ul.appendChild(li);
        addTask(`${t.priority}: ${t.title}`);
      });
    }catch(e){ console.error(e); alert("AI triage failed."); }
  }
  document.getElementById("aiTriageBtn")?.addEventListener("click", aiTriage);
  aiTriage();

  // Local Tasks
  const taskForm = document.getElementById("taskForm");
  const taskInput = document.getElementById("taskInput");
  const taskList = document.getElementById("taskList");
  const KEY="hq.tasks";
  let tasks = JSON.parse(localStorage.getItem(KEY)||"[]");
  function save(){ localStorage.setItem(KEY, JSON.stringify(tasks)); }
  function render(){
    taskList.innerHTML="";
    tasks.forEach((t,i)=>{
      const li=document.createElement("li");
      li.className=t.done?"done":"";
      li.innerHTML=`<div><strong>${t.text}</strong></div>
        <div style="display:flex;gap:8px;">
          <button class="btn btn-primary" data-done="${i}">${t.done?"Undone":"Done"}</button>
          <button class="btn btn-ghost" data-del="${i}">Delete</button>
        </div>`;
      taskList.appendChild(li);
    });
    document.getElementById("openTasksBadge").textContent = `${tasks.filter(t=>!t.done).length} open tasks`;
  }
  function addTask(text){ tasks.unshift({text,done:false}); save(); render(); }
  taskForm?.addEventListener("submit",(e)=>{ e.preventDefault(); const v=taskInput.value.trim(); if(!v) return; addTask(v); taskInput.value=""; });
  taskList?.addEventListener("click",(e)=>{
    const d=e.target.dataset;
    if("done" in d){ const i=+d.done; tasks[i].done=!tasks[i].done; save(); render(); }
    if("del" in d){ const i=+d.del; tasks.splice(i,1); save(); render(); }
  });
  render();

  // Live Sentiment - Load from JSON
  let COMMENTS=[];
  const tbody=document.getElementById("commentsBody");
  
  function drawRows(items){
    if(!items.length){
      tbody.innerHTML=`<tr><td colspan="5" class="muted" style="text-align:center;padding:22px;">No rows</td></tr>`;
      return;
    }
    tbody.innerHTML=items.map(x=>`
      <tr>
        <td>${x.platform||""}</td>
        <td>${x.username||""}</td>
        <td>${x.comment}</td>
        <td><span class="pill ${x.sentiment==='Negative'?'bad':x.sentiment==='Positive'?'':'warn'}">${x.sentiment||'Neutral'}</span></td>
        <td>${x.engagement||0}</td>
      </tr>`).join("");
  }
  
  // Load JSON data automatically on page load
  async function loadSocialData(){
    try {
      const response = await fetch('./Assets/social_media_feedback.json');
      COMMENTS = await response.json();
      drawRows(COMMENTS);
    } catch(e) {
      console.error("Failed to load social media data:", e);
      tbody.innerHTML=`<tr><td colspan="5" class="muted" style="text-align:center;padding:22px;">Failed to load data</td></tr>`;
    }
  }
  
  // Filter handler
  document.getElementById("sentFilter")?.addEventListener("change",(e)=>{
    const val=e.target.value; 
    drawRows(COMMENTS.filter(x=>val==="all"?true:x.sentiment.toLowerCase()===val.toLowerCase()));
  });
  
  // Load data on page load
  loadSocialData();

  // Outage Map + Predict
  function initMap(){
    const el=document.getElementById("map"); if(!el||typeof L==="undefined") return;
    const map=L.map(el).setView([32.7767,-96.7970],6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{ attribution:'&copy; OpenStreetMap' }).addTo(map);
    const pts=[
      { name:"Dallas", lat:32.7767, lng:-96.7970, p:0.35 },
      { name:"Houston", lat:29.7604, lng:-95.3698, p:0.72 },
      { name:"Austin", lat:30.2672, lng:-97.7431, p:0.28 },
    ];
    window.__outages = pts.map(x=>({region:x.name, probability:x.p}));
    pts.forEach(x=>L.circle([x.lat,x.lng],{
      radius:15000,
      color: x.p>0.6?"#D90368":(x.p>0.4?"#F59E0B":"#1C6E8C")
    }).addTo(map).bindPopup(`${x.name}: ${Math.round(x.p*100)}%`));
  }
  initMap();

  async function predict(){
    const region=document.getElementById("regionSel").value;
    const out=document.getElementById("predictOut");
    const r=await fetch(`${BACKEND}/predict/outage?region=${encodeURIComponent(region)}`);
    const j=await r.json();
    out.innerHTML=`<div class="pill ${j.label==='high'?'bad':j.label==='medium'?'warn':'ok'}">${j.region}: ${j.probability}% (${j.label})</div>`;
  }
  document.getElementById("predictBtn")?.addEventListener("click", predict);

  // Gemini Chat
  const chatFab = document.getElementById("chatFab");
  const chatPanel = document.getElementById("chatPanel");
  const chatClose = document.getElementById("chatClose");
  const chatFeed = document.getElementById("chatFeed");
  const chatInput = document.getElementById("chatInput");
  const chatSend = document.getElementById("chatSend");

  function pushBubble(text, who="me"){
    const b = document.createElement("div");
    b.className = `bubble ${who}`;
    b.textContent = text;
    chatFeed.appendChild(b);
    chatFeed.scrollTop = chatFeed.scrollHeight;
  }

  async function askGemini(prompt){
    try{
      const r = await fetch(`${BACKEND}/ai/chat`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ prompt })
      });
      const j = await r.json();
      return j.reply || "(no response)";
    }catch(e){
      console.error(e);
      return "Hmm, I couldn't reach the AI service.";
    }
  }

  chatFab?.addEventListener("click", () => chatPanel.classList.toggle("show"));
  chatClose?.addEventListener("click", () => chatPanel.classList.remove("show"));
  chatSend?.addEventListener("click", async () => {
    const msg = chatInput.value.trim(); if(!msg) return;
    pushBubble(msg, "me"); chatInput.value = "";
    const reply = await askGemini(msg);
    pushBubble(reply, "ai");
  });
  chatInput?.addEventListener("keydown", (e)=>{ if(e.key==="Enter" && !e.shiftKey){ e.preventDefault(); chatSend.click(); }});
}

document.addEventListener("DOMContentLoaded", bootApp);
