(function () {
  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var narrow = matchMedia("(max-width: 700px)");
  var rail = document.getElementById("rail");
  var cards = rail.querySelectorAll(".card");
  var disc = document.querySelector(".disc.drift");
  var plus = document.getElementById("plus");
  var ticks = document.querySelectorAll(".stage-minimap a");

  function layout() {
    if (narrow.matches) {
      document.body.style.height = "";
      rail.style.transform = "none";
      ticks.forEach(function (a, n) { a.setAttribute("aria-current", n === 0 ? "true" : "false"); });
      return;
    }
    var vw = window.innerWidth;
    var cardW = Math.min(1059, vw * 0.735);
    var cardH = cardW * (635 / 1059);
    var gap = Math.max(20, vw * 0.024);
    document.documentElement.style.setProperty("--card-w", cardW + "px");
    document.documentElement.style.setProperty("--card-h", cardH + "px");
    document.documentElement.style.setProperty("--gap", gap + "px");
    var step = cardW + gap;
    var max = step * (cards.length - 1);
    document.body.style.height = (window.innerHeight + max) + "px";
    var x = Math.max(0, Math.min(max, window.scrollY));
    var left = vw * 0.133;
    var top = Math.max(72, (window.innerHeight - cardH) / 2);
    rail.style.transform = "translate3d(" + (left - x) + "px," + top + "px,0)";
    var i = Math.round(x / step);
    ticks.forEach(function (a, n) {
      a.setAttribute("aria-current", n === i ? "true" : "false");
    });
  }

  ticks.forEach(function (a, n) {
    a.addEventListener("click", function (event) {
      if (narrow.matches) return;
      if (a.getAttribute("href").indexOf("#card-") === 0) {
        event.preventDefault();
        var step = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--card-w")) +
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gap"));
        window.scrollTo({ top: step * n, behavior: reduce ? "auto" : "smooth" });
      }
    });
  });

  window.addEventListener("scroll", layout, { passive: true });
  window.addEventListener("resize", layout);
  layout();

  if (!reduce && disc) {
    window.addEventListener("pointermove", function (event) {
      var dx = (event.clientX / window.innerWidth - 0.62) * 36;
      var dy = (event.clientY / window.innerHeight - 0.5) * 22;
      disc.style.setProperty("--px", dx.toFixed(1) + "px");
      disc.style.setProperty("--py", dy.toFixed(1) + "px");
      if (plus) {
        plus.style.transform = "translate(" + event.clientX + "px," + event.clientY + "px)";
        plus.hidden = false;
      }
    });
  }

  window.addEventListener("keydown", function (event) {
    if (narrow.matches) return;
    if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") return;
    var step = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--card-w")) +
      parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--gap"));
    var dir = (event.key === "ArrowDown" || event.key === "ArrowRight") ? 1 : -1;
    event.preventDefault();
    window.scrollTo({ top: window.scrollY + step * dir, behavior: reduce ? "auto" : "smooth" });
  });
})();
