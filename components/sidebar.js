<script type="module">
// HarmoniQ Sidebar Web Component
const TPL = document.createElement("template");
TPL.innerHTML = `
  <style>
    :host { display:block; }
    .sidebar{
      background:#FFFFFF;
      border-right:1px solid #E6E8F0;
      width:240px; min-height:100vh; padding:16px;
      display:flex; flex-direction:column; gap:16px;
      position:sticky; top:0;
    }
    .brand{ display:flex; align-items:center; gap:10px; text-decoration:none; }
    .nav{ display:flex; flex-direction:column; gap:8px; }
    .item{
      display:flex; align-items:center; gap:10px;
      padding:10px 12px; border-radius:12px; font-weight:600;
      color:#334155; text-decoration:none; position:relative;
    }
    .item:hover{ background:#F5F7FB; }
    /* Active state: Cerulean background with Dogwood Rose accent */
    .item.active{
      background:rgba(28,110,140,0.10); color:#0E1320;
      box-shadow:inset 0 0 0 2px rgba(28,110,140,0.18);
    }
    .item.active::before{
      content:""; position:absolute; left:-16px; top:8px; bottom:8px;
      width:4px; border-radius:4px; background:#D90368; /* dogwood rose */
    }
    .bottom{ margin-top:auto; display:flex; flex-direction:column; gap:10px; }
    .user{ display:flex; gap:10px; align-items:center; }
    .avatar{ width:36px; height:36px; border-radius:50%; background:#EEF1F7; object-fit:cover; }
    .logout{ border:1px solid #E6E8F0; background:#fff; border-radius:10px; padding:8px 10px; cursor:pointer; text-align:left; }
    .collapse{
      position:absolute; left:240px; top:16px; z-index:5;
      border:1px solid #E6E8F0; background:#fff; border-radius:10px; padding:6px 8px; cursor:pointer;
    }
    :host(.collapsed) .sidebar{ width:80px; }
    :host(.collapsed) .txt{ display:none; }
    :host(.collapsed) .brand .title{ display:none; }
    :host(.collapsed) .collapse{ left:80px; }
    /* tiny icons */
    .ico{ width:18px; text-align:center; }
  </style>

  <button class="collapse" title="Toggle sidebar">☰</button>
  <aside class="sidebar">
    <a href="index.html" class="brand">
      <img src="Assets/Logo.png" class="logo-icon-img" alt="">
      <img src="Assets/Title.png" class="title" alt="HarmoniQ">
    </a>

    <nav class="nav">
      <a class="item" data-page="home"      href="profile-home.html"><span class="ico">🏠</span><span class="txt">Home</span></a>
      <a class="item" data-page="dashboard" href="profile-dashboard.html"><span class="ico">📊</span><span class="txt">Dashboard</span></a>
      <a class="item" data-page="sentiment" href="profile-sentiment.html"><span class="ico">😊</span><span class="txt">Live Sentiment</span></a>
      <a class="item" data-page="feedback"  href="profile-feedback.html"><span class="ico">💬</span><span class="txt">Feedback Stream</span></a>
      <a class="item" data-page="outages"   href="profile-outages.html"><span class="ico">⚡</span><span class="txt">Outage Predictor</span></a>
      <a class="item" data-page="tasks"     href="profile-tasks.html"><span class="ico">✅</span><span class="txt">Tasks</span></a>
      <a class="item" data-page="settings"  href="profile-settings.html"><span class="ico">⚙️</span><span class="txt">Settings</span></a>
    </nav>

    <div class="bottom">
      <div class="user">
        <img id="hqUserPic" class="avatar" alt="">
        <div>
          <div id="hqUserName" style="font-weight:700;">&nbsp;</div>
          <div id="hqUserEmail" style="font-size:12px;color:#667085;"></div>
        </div>
      </div>
      <button id="hqLogout" class="logout">↩ Logout</button>
    </div>
  </aside>
`;

class HQSidebar extends HTMLElement{
  connectedCallback(){
    this.attachShadow({mode:"open"}).appendChild(TPL.content.cloneNode(true));
    const pg = document.body.dataset.page; // set on each page
    this.shadowRoot.querySelectorAll(".item").forEach(a=>{
      if(a.dataset.page === pg) a.classList.add("active");
    });
    this.shadowRoot.querySelector(".collapse")?.addEventListener("click",()=>{
      this.classList.toggle("collapsed");
    });
    // bubble user areas so auth-common can fill them
    this._wireUserMirrors();
  }
  _wireUserMirrors(){
    // expose mirrors so external script can fill user data
    const name  = this.shadowRoot.getElementById("hqUserName");
    const email = this.shadowRoot.getElementById("hqUserEmail");
    const pic   = this.shadowRoot.getElementById("hqUserPic");
    const out   = this.shadowRoot.getElementById("hqLogout");
    this.hq = { name, email, pic, out };
  }
}
customElements.define("hq-sidebar", HQSidebar);
</script>
