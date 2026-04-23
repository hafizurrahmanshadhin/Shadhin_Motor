function updateDashboardMeta() {
  const now = new Date();
  const hour = now.getHours();
  const greeting =
    hour < 12 ? "Good morning ☀️" : hour < 17 ? "Good afternoon ☀️" : "Good evening 🌙";

  const greetEl = document.getElementById("dashGreet");
  const dateEl = document.getElementById("dashDate");

  if (greetEl) greetEl.textContent = greeting;
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  }
}

function renderDash() {
  toast("info", "Dashboard refreshed", "Static HTML cards are already up to date.");
}

function initDashboardPage() {
  if (PAGE !== "dashboard") return;

  updateDashboardMeta();
  document.querySelector('[data-action="dash-refresh"]')?.addEventListener("click", renderDash);
}

document.addEventListener("DOMContentLoaded", initDashboardPage);

window.renderDash = renderDash;
