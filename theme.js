(function () {
  var key = "theme";
  var moon = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.6A7.2 7.2 0 1 1 9.4 4 5.8 5.8 0 0 0 20 14.6z"></path></svg>';
  var sun = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="3.5"></circle><path d="M12 3.5v2.2M12 18.3v2.2M3.5 12h2.2M18.3 12h2.2M6 6l1.6 1.6M16.4 16.4 18 18M18 6l-1.6 1.6M7.6 16.4 6 18"></path></svg>';

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
    button.setAttribute("aria-label", dark ? "切换到浅色" : "切换到深色");
    button.innerHTML = dark ? sun : moon;
  }
  function mount() {
    if (document.querySelector(".theme-toggle")) return;
    button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
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
