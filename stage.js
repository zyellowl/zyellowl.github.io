(function () {
  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var narrow = matchMedia("(max-width: 700px)");
  var scroller = document.getElementById("scroller");
  var cards = document.querySelectorAll("#rail .card");
  var disc = document.querySelector(".disc.drift");
  var plus = document.getElementById("plus");
  var ticks = document.querySelectorAll(".stage-minimap a");

  function stepSize() {
    if (!cards.length) return 1;
    var gap = parseFloat(getComputedStyle(document.getElementById("rail")).columnGap || getComputedStyle(document.getElementById("rail")).gap) || 14;
    return cards[0].getBoundingClientRect().width + gap;
  }

  function mark() {
    var step = stepSize();
    var i = Math.round(scroller.scrollLeft / step);
    if (i < 0) i = 0;
    if (i > cards.length - 1) i = cards.length - 1;
    ticks.forEach(function (a, n) {
      a.setAttribute("aria-current", n === i ? "true" : "false");
    });
  }

  scroller.addEventListener("scroll", mark, { passive: true });
  window.addEventListener("resize", mark);
  mark();

  window.addEventListener("wheel", function (event) {
    if (narrow.matches) return;
    if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    event.preventDefault();
    scroller.scrollLeft += event.deltaY;
  }, { passive: false });

  ticks.forEach(function (a, n) {
    a.addEventListener("click", function (event) {
      if (a.getAttribute("href").indexOf("#card-") !== 0) return;
      event.preventDefault();
      var card = document.getElementById("card-" + n);
      if (!card) return;
      var left = card.offsetLeft - (narrow.matches ? 16 : 28);
      scroller.scrollTo({ left: left, behavior: reduce ? "auto" : "smooth" });
    });
  });

  if (!reduce && disc) {
    window.addEventListener("pointermove", function (event) {
      var dx = (event.clientX / window.innerWidth - 0.72) * 18;
      if (dx < 0) dx = 0;
      var dy = (event.clientY / window.innerHeight - 0.5) * 12;
      disc.style.setProperty("--px", dx.toFixed(1) + "px");
      disc.style.setProperty("--py", dy.toFixed(1) + "px");
      if (plus) {
        plus.style.transform = "translate(" + event.clientX + "px," + event.clientY + "px)";
        plus.hidden = false;
      }
    });
  }

  window.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") return;
    var dir = (event.key === "ArrowDown" || event.key === "ArrowRight") ? 1 : -1;
    event.preventDefault();
    scroller.scrollBy({ left: stepSize() * dir, behavior: reduce ? "auto" : "smooth" });
  });
})();
