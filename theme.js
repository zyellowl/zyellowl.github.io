(function () {
  var key = "theme";
  var icon = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="6.25" fill="none" stroke="currentColor" stroke-width="1.5"></circle><path fill="currentColor" d="M8 2.5A5.5 5.5 0 0 0 8 13.5Z"></path></svg>';

  function system() {
    try { return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
    catch (e) { return "light"; }
  }
  function saved() {
    try {
      var value = localStorage.getItem(key);
      return value === "dark" || value === "light" ? value : null;
    } catch (e) { return null; }
  }
  function apply(theme) {
    document.documentElement.setAttribute("data-theme", theme);
  }
  function current() {
    return document.documentElement.getAttribute("data-theme") || system();
  }

  apply(saved() || system());

  var button = null;
  function sync() {
    if (!button) return;
    var theme = current();
    var dark = theme === "dark";
    button.setAttribute("aria-pressed", dark ? "true" : "false");
    button.setAttribute("aria-label", "Toggle dark mode");
  }
  function mount() {
    if (document.querySelector(".theme-toggle")) return;
    button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.innerHTML = icon;
    button.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      try { localStorage.setItem(key, next); } catch (e) {}
      apply(next);
      sync();
    });
    sync();
    document.body.appendChild(button);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();

  try {
    matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (saved()) return;
      apply(system());
      sync();
    });
  } catch (e) {}
})();
