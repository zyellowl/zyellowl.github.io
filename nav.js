(function () {
  var path = location.pathname.replace(/index\.html$/, "");
  if (path.length > 1 && path.endsWith("/")) path = path.slice(0, -1);
  var best = null;
  var bestLen = -1;
  document.querySelectorAll(".mini a").forEach(function (a) {
    var p = a.pathname.replace(/\/$/, "") || "/";
    if (p === "/") {
      if (path === "/" || path === "") { best = a; bestLen = 1; }
      return;
    }
    if (path === p || path.indexOf(p + "/") === 0) {
      if (p.length > bestLen) { best = a; bestLen = p.length; }
    }
  });
  if (best) best.setAttribute("aria-current", "true");
})();
