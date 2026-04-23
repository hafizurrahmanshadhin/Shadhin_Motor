function submitStaticLogin(event) {
  event?.preventDefault();

  const btn = document.getElementById("loginBtn");

  if (btn) {
    btn.classList.add("loading");
    btn.disabled = true;
  }

  window.setTimeout(() => {
    if (btn) {
      btn.classList.remove("loading");
      btn.disabled = false;
    }

    toast("info", "Static login UI", "Connect your backend authentication when ready.");
  }, 520);

  return false;
}

function togStaticPassVis() {
  const input = document.getElementById("loginPass");
  const icon = document.getElementById("loginPassIc");
  if (!input || !icon) return;

  const reveal = input.type === "password";
  input.type = reveal ? "text" : "password";
  icon.className = reveal ? "bi bi-eye" : "bi bi-eye-slash";
}

function initLoginPage() {
  if (PAGE !== "login") return;

  document.getElementById("loginForm")?.addEventListener("submit", submitStaticLogin);
  document.querySelector('[data-action="login-pass-toggle"]')?.addEventListener("click", togStaticPassVis);

  runPreloader();
}

document.addEventListener("DOMContentLoaded", initLoginPage);

window.submitStaticLogin = submitStaticLogin;
window.togStaticPassVis = togStaticPassVis;
