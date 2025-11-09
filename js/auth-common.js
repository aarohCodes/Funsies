<script type="module">
const REDIRECT_BASE = "http://127.0.0.1:8000";
let client;

async function configure(){
  if(client) return client;
  const cfg = await (await fetch("./auth_config.json")).json();
  client = await auth0.createAuth0Client({
    domain: cfg.domain,
    clientId: cfg.clientId,
    authorizationParams:{ redirect_uri: `${REDIRECT_BASE}${location.pathname}` },
    cacheLocation:"localstorage"
  });
  return client;
}

async function guard(){
  const c = await configure();
  if(location.search.includes("code=")||location.search.includes("state=")){
    await c.handleRedirectCallback();
    history.replaceState({}, document.title, location.pathname);
  }
  const ok = await c.isAuthenticated();
  if(!ok){ location.href = "login.html"; return null; }
  return c;
}

export async function initPage(){
  const c = await guard(); if(!c) return;
  const user = await c.getUser();
  // Fill sidebar mirrors inside shadow DOM
  document.querySelectorAll("hq-sidebar").forEach(el=>{
    const u = el.hq; if(!u) return;
    u.name.textContent  = user?.name || "User";
    u.email.textContent = user?.email || "";
    if(user?.picture){ u.pic.src = user.picture; u.pic.alt=user.name; }
    u.out.addEventListener("click", ()=>c.logout({logoutParams:{returnTo:`${REDIRECT_BASE}/index.html`}}));
  });
  return { client:c, user };
}
</script>
