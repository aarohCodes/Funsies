// login-auth.js – only loaded by login.html
let auth0Client;

async function configureAuth0() {
  if (auth0Client) return auth0Client;
  const res = await fetch("./auth_config.json");
  const cfg = await res.json();
  const REDIRECT_BASE = "http://127.0.0.1:8000"; // <— your consistent base URL

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

function bindLoginUI() {
  const emailForm = document.getElementById("emailForm");
  const btnGoogle = document.getElementById("btnGoogle");
  const btnMicrosoft = document.getElementById("btnMicrosoft");
  const forgotLink = document.getElementById("forgotLink");
  const signupLink = document.getElementById("signupLink");

  // Email/password via Universal Login
  emailForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const c = await configureAuth0();
    await c.loginWithRedirect(); // shows hosted Universal Login
  });

  // Google
  btnGoogle?.addEventListener("click", async () => {
    const c = await configureAuth0();
    await c.loginWithRedirect({
      authorizationParams: { connection: "google-oauth2" }
    });
  });

  // Microsoft – use your actual connection name from Auth0
  btnMicrosoft?.addEventListener("click", async () => {
    const c = await configureAuth0();
    await c.loginWithRedirect({
      authorizationParams: { connection: "windowslive" } // or "azuread"/"windowslive"
    });
  });

  // Optional convenience links
  forgotLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    const c = await configureAuth0();
    await c.loginWithRedirect(); // takes user to hosted page where they can reset
  });

  signupLink?.addEventListener("click", async (e) => {
    e.preventDefault();
    const c = await configureAuth0();
    await c.loginWithRedirect({
      authorizationParams: { screen_hint: "signup" }
    });
  });
}

// Initialize on this page only
document.addEventListener("DOMContentLoaded", async () => {
  await configureAuth0();
  bindLoginUI();

  // If user somehow arrives here with a code/state (rare), complete it and go to profile
  if (location.search.includes("code=") || location.search.includes("state=")) {
    const c = await configureAuth0();
    await c.handleRedirectCallback();
    history.replaceState({}, document.title, location.pathname);
    location.href = "profile.html";
  }
});
