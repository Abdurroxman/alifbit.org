// Mavzu sahifa chizilishidan oldin qo'yiladi: aks holda bir lahza boshqa rang miltillaydi.
(function () {
  var t = "dark";
  try {
    var v = localStorage.getItem("alifbit-theme");
    if (v === "light" || v === "dark") t = v;
  } catch (e) {}
  if (location.pathname.indexOf("/admin") === 0) {
    t = "light";
    try {
      if (localStorage.getItem("alifbit-admin-theme") === "dark") t = "dark";
    } catch (e) {}
  }
  document.documentElement.setAttribute("data-theme", t);
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", t === "dark" ? "#0B0D0C" : "#F9F8F5");
})();
