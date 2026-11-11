(function () {
  var reduce = false;
  try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var narrow = matchMedia("(max-width: 700px)");
  var view = document.getElementById("view");
  var zoom = document.getElementById("zoom");
  var rail = document.getElementById("rail");
  var cards = rail.querySelectorAll(".card");
  var disc = document.querySelector(".disc.drift");
  var plus = document.getElementById("plus");
  var ticks = document.querySelectorAll(".stage-minimap a");
  var REST = 1;
  var AWAY = 0.68;
  var scale = 1;
  var target = 1;
  var settling = false;
  var pointers = null;

  function gap() {
    var g = getComputedStyle(rail).gap || getComputedStyle(rail).columnGap;
    var n = parseFloat(g);
    return n || (narrow.matches ? 12 : 14);
  }

  function stride() {
    return cards[0].offsetWidth + gap();
  }

  function layoutHeight() {
    var max = stride() * (cards.length - 1);
    document.body.style.height = (window.innerHeight + max) + "px";
    return max;
  }

  var slot = document.getElementById("disc");
  var discX = 0;
  var discReady = false;

  function trackDisc(index) {
    if (!slot || !cards[index]) return;
    var card = cards[index];
    var inset = parseFloat(getComputedStyle(slot).getPropertyValue("--inset-right"));
    if (isNaN(inset)) inset = narrow.matches ? 3 : 4;
    var heightRatio = narrow.matches ? 0.62 : 0.8;
    var topRatio = narrow.matches ? 0.19 : 0.1;
    var h = card.offsetHeight * heightRatio;
    if (h < 1) return;
    slot.style.height = h.toFixed(2) + "px";
    slot.style.width = h.toFixed(2) + "px";
    slot.style.top = (card.offsetTop + card.offsetHeight * topRatio).toFixed(2) + "px";
    var dest = card.offsetLeft + card.offsetWidth - h - card.offsetWidth * (inset / 100);
    if (!discReady || reduce) {
      discX = dest;
      discReady = true;
    } else {
      var delta = dest - discX;
      discX += delta * 0.22;
      if (Math.abs(delta) < 0.4) discX = dest;
    }
    slot.style.transform = "translate3d(" + discX.toFixed(2) + "px,0,0)";
  }

  function apply() {
    var y = window.scrollY;
    view.style.transform = "translate3d(" + (-y) + "px,0,0)";
    zoom.style.transform = "scale(" + scale.toFixed(4) + ")";
    var step = stride();
    var i = Math.round(y / step);
    if (i < 0) i = 0;
    if (i > cards.length - 1) i = cards.length - 1;
    ticks.forEach(function (a, n) {
      a.setAttribute("aria-current", n === i ? "true" : "false");
    });
    return i;
  }

  function frame() {
    scale += (target - scale) * (reduce ? 1 : 0.2);
    if (Math.abs(target - scale) < 0.001) scale = target;
    trackDisc(apply());
    requestAnimationFrame(frame);
  }

  function beginTravel() {
    settling = false;
    target = AWAY;
  }

  var idle = 0;
  function armSettle() {
    window.clearTimeout(idle);
    idle = window.setTimeout(settle, 160);
  }

  function settle() {
    settling = true;
    target = REST;
    var step = stride();
    var max = step * (cards.length - 1);
    var snapped = Math.round(window.scrollY / step) * step;
    if (snapped < 0) snapped = 0;
    if (snapped > max) snapped = max;
    window.scrollTo({ top: snapped, behavior: reduce ? "auto" : "smooth" });
  }

  window.addEventListener("scroll", function () {
    if (!settling) target = AWAY;
    apply();
    armSettle();
  }, { passive: true });

  window.addEventListener("wheel", function (event) {
    var dx = event.deltaX;
    var dy = event.deltaY;
    if (event.deltaMode === 1) { dx *= 16; dy *= 16; }
    if (event.deltaMode === 2) { dx *= window.innerWidth; dy *= window.innerHeight; }
    beginTravel();
    if (Math.abs(dx) > Math.abs(dy) && dx !== 0) {
      event.preventDefault();
      window.scrollBy(0, dx);
    }
  }, { passive: false });

  window.addEventListener("pointerdown", function (event) {
    if (event.target.closest && event.target.closest(".mini")) return;
    pointers = { x: event.clientX, y: event.clientY, top: window.scrollY, moved: false, id: event.pointerId };
  });
  window.addEventListener("pointermove", function (event) {
    if (!pointers || event.pointerId !== pointers.id) return;
    var dx = event.clientX - pointers.x;
    var dy = event.clientY - pointers.y;
    if (!pointers.moved && Math.hypot(dx, dy) < 6) return;
    pointers.moved = true;
    beginTravel();
    var delta = Math.abs(dx) > Math.abs(dy) ? -dx : dy;
    window.scrollTo(0, pointers.top + delta);
  });
  window.addEventListener("pointerup", function (event) {
    if (!pointers || event.pointerId !== pointers.id) return;
    var moved = pointers.moved;
    pointers = null;
    if (moved) armSettle();
  });
  window.addEventListener("click", function (event) {
    if (event.target.closest && event.target.closest("a.card") && window.__suppressCardClick) {
      event.preventDefault();
      window.__suppressCardClick = false;
    }
  }, true);
  var lastMoved = false;
  window.addEventListener("pointerup", function () {
    window.__suppressCardClick = lastMoved;
  });
  window.addEventListener("pointermove", function () {
    if (pointers && pointers.moved) lastMoved = true;
  });
  window.addEventListener("pointerdown", function () { lastMoved = false; });

  ticks.forEach(function (a, n) {
    a.addEventListener("click", function (event) {
      if (a.getAttribute("href").indexOf("#card-") !== 0) return;
      event.preventDefault();
      beginTravel();
      var step = stride();
      window.scrollTo({ top: step * n, behavior: reduce ? "auto" : "smooth" });
      window.setTimeout(function () { settling = true; target = REST; }, 40);
    });
  });

  window.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowRight" && event.key !== "ArrowUp" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    beginTravel();
    var dir = (event.key === "ArrowDown" || event.key === "ArrowRight") ? 1 : -1;
    window.scrollBy({ top: stride() * dir, behavior: reduce ? "auto" : "smooth" });
    window.setTimeout(function () { settling = true; target = REST; }, 40);
  });

  if (!reduce && disc) {
    window.addEventListener("pointermove", function (event) {
      var dx = (event.clientX / window.innerWidth - 0.72) * 14;
      if (dx < 0) dx = 0;
      var dy = (event.clientY / window.innerHeight - 0.5) * 10;
      disc.style.setProperty("--px", dx.toFixed(1) + "px");
      disc.style.setProperty("--py", dy.toFixed(1) + "px");
      if (plus) {
        plus.style.transform = "translate(" + event.clientX + "px," + event.clientY + "px)";
        plus.hidden = false;
      }
    });
  }

  window.addEventListener("resize", function () {
    discReady = false;
    layoutHeight();
  });
  layoutHeight();
  apply();
  requestAnimationFrame(frame);

  function layoutHeight() {
    document.body.style.height = (window.innerHeight + stride() * (cards.length - 1)) + "px";
  }
})();
