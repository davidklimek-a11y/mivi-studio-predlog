(function () {
"use strict";
var doc = document.documentElement;
doc.classList.add("js");
var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function markLoaded(img) { img.classList.add("is-loaded"); }
document.querySelectorAll(".ph img").forEach(function (img) {
if (img.complete && img.naturalWidth) { markLoaded(img); }
else {
img.addEventListener("load", function () { markLoaded(img); }, { once: true });
img.addEventListener("error", function () { markLoaded(img); }, { once: true });
}
});
var header = document.querySelector(".site-header");
if (header) {
var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });
}
var band = document.querySelector(".draft");
if (band) { doc.style.setProperty("--band-h", band.offsetHeight + "px"); }
var btn = document.querySelector(".menu-btn");
var panel = document.getElementById("nav-panel");
if (btn && panel) {
var setOpen = function (open) {
btn.setAttribute("aria-expanded", open ? "true" : "false");
panel.classList.toggle("is-open", open);
document.body.classList.toggle("menu-open", open);
var label = btn.querySelector(".menu-label");
if (label) { label.textContent = open ? btn.dataset.close : btn.dataset.open; }
if (band) { doc.style.setProperty("--band-h", (window.scrollY < band.offsetHeight ? band.offsetHeight - window.scrollY : 0) + "px"); }
};
btn.addEventListener("click", function () { setOpen(btn.getAttribute("aria-expanded") !== "true"); });
document.addEventListener("keydown", function (e) { if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setOpen(false); btn.focus(); } });
panel.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
}
var mark = document.querySelector(".brand .mark");
if (mark && !reduce) {
var seen = false;
try { seen = sessionStorage.getItem("mivi-mark") === "1"; sessionStorage.setItem("mivi-mark", "1"); } catch (e) { seen = true; }
if (!seen) { mark.classList.add("is-drawing"); }
}
var drawings = document.querySelectorAll(".drawing");
if (drawings.length) {
if (reduce || !("IntersectionObserver" in window)) {
drawings.forEach(function (d) { d.classList.add("is-drawn"); });
} else {
var io = new IntersectionObserver(function (entries) {
entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-drawn"); io.unobserve(en.target); } });
}, { threshold: 0.35 });
drawings.forEach(function (d) { io.observe(d); });
}
}
var groups = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
if (groups.length && !reduce && "IntersectionObserver" in window) {
var compact = window.matchMedia("(max-width: 899px)");
var LINE = 0.92;
var place = function (el) {
if (el.dataset.reveal !== "img") { return; }
var r = el.getBoundingClientRect();
var centre = r.left + r.width / 2;
var middle = Math.abs(centre - window.innerWidth / 2) < window.innerWidth * 0.12;
if (compact.matches || middle) { el.style.setProperty("--rx", "0px"); el.style.setProperty("--ry", "64px"); }
else { el.style.setProperty("--rx", (centre < window.innerWidth / 2 ? -96 : 96) + "px"); el.style.setProperty("--ry", "0px"); }
};
var armed = [];
groups.forEach(function (el) {
if (el.getBoundingClientRect().top < window.innerHeight * LINE) { return; }
place(el);
if (el.dataset.reveal === "text") {
Array.prototype.forEach.call(el.children, function (c, i) { c.style.setProperty("--ri", i); });
}
el.classList.add("reveal-armed");
armed.push(el);
});
var watch = new IntersectionObserver(function (entries) {
entries.forEach(function (en) {
if (en.isIntersecting) { en.target.classList.add("is-in"); }
else if (en.boundingClientRect.top > 0) { en.target.classList.remove("is-in"); }
});
}, { rootMargin: "0px 0px -8% 0px" });
armed.forEach(function (el) { watch.observe(el); });
var settle = function (el) { el.classList.add("is-in"); watch.unobserve(el); };
document.addEventListener("focusin", function (e) {
var g = e.target.closest && e.target.closest(".reveal-armed");
if (g) { settle(g); }
});
window.addEventListener("beforeprint", function () { armed.forEach(settle); });
var onCompact = function () { armed.forEach(function (el) { if (!el.classList.contains("is-in")) { place(el); } }); };
if (compact.addEventListener) { compact.addEventListener("change", onCompact); }
}
var dlg = document.querySelector(".lightbox");
var triggers = Array.prototype.slice.call(document.querySelectorAll("[data-lb]"));
if (dlg && triggers.length && typeof dlg.showModal === "function") {
var img = document.createElement("img");
img.alt = "";
dlg.querySelector(".lb-stage").insertBefore(img, dlg.querySelector(".lb-next"));
var cap = dlg.querySelector(".lb-cap");
var count = dlg.querySelector(".lb-count");
var group = [];
var index = 0;
var lastFocus = null;
var show = function (i) {
index = (i + group.length) % group.length;
var t = group[index];
img.removeAttribute("src");
img.srcset = t.dataset.srcset || "";
img.sizes = "100vw";
img.src = t.dataset.lb;
img.alt = t.dataset.alt || "";
cap.textContent = t.dataset.cap || "";
count.textContent = String(index + 1).padStart(2, "0") + " / " + String(group.length).padStart(2, "0");
[index + 1, index - 1].forEach(function (j) {
var n = group[(j + group.length) % group.length];
if (n) { var pre = new Image(); pre.srcset = n.dataset.srcset || ""; pre.sizes = "100vw"; pre.src = n.dataset.lb; }
});
};
triggers.forEach(function (t) {
t.addEventListener("click", function (e) {
e.preventDefault();
var key = t.dataset.group || "all";
group = triggers.filter(function (x) { return (x.dataset.group || "all") === key; });
lastFocus = t;
show(group.indexOf(t));
dlg.showModal();
document.body.style.overflow = "hidden";
});
});
var close = function () { dlg.close(); };
dlg.addEventListener("close", function () { document.body.style.overflow = ""; if (lastFocus) { lastFocus.focus(); } });
dlg.querySelector(".lb-close").addEventListener("click", close);
dlg.querySelector(".lb-prev").addEventListener("click", function () { show(index - 1); });
dlg.querySelector(".lb-next").addEventListener("click", function () { show(index + 1); });
dlg.addEventListener("keydown", function (e) {
if (e.key === "ArrowRight") { show(index + 1); }
else if (e.key === "ArrowLeft") { show(index - 1); }
else if (e.key === "Escape") { e.preventDefault(); close(); }
});
dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
dlg.addEventListener("click", function (e) { if (e.target === dlg || e.target.classList.contains("lb-stage")) { close(); } });
var x0 = null;
var stage = dlg.querySelector(".lb-stage");
stage.addEventListener("pointerdown", function (e) { x0 = e.clientX; });
stage.addEventListener("pointerup", function (e) {
if (x0 === null) { return; }
var dx = e.clientX - x0; x0 = null;
if (Math.abs(dx) > 50) { show(index + (dx < 0 ? 1 : -1)); }
});
}
var form = document.querySelector(".brief");
if (form) {
var d = form.dataset;
var status = form.querySelector(".brief-status");
var errName = form.querySelector("[data-err='ime']");
var errKind = form.querySelector("[data-err='vrsta']");
var val = function (name) { var el = form.elements[name]; return el ? String(el.value || "").trim() : ""; };
var compose = function () {
var lines = [d.intro, ""];
var push = function (label, v) { if (v) { lines.push(label + ": " + v); } };
push(d.lKind, val("vrsta"));
push(d.lPlace, val("lokacija"));
push(d.lArea, val("povrsina") ? val("povrsina") + " m²" : "");
push(d.lWhen, val("kada"));
var msg = val("poruka");
if (msg) { lines.push("", msg); }
lines.push("", "—", val("ime"));
if (val("telefon")) { lines.push(d.lPhone + ": " + val("telefon")); }
return lines.join("\n");
};
var valid = function () {
var ok = true;
errName.textContent = ""; errKind.textContent = "";
if (!val("vrsta")) { errKind.textContent = d.errKind; ok = false; }
if (!val("ime")) { errName.textContent = d.errName; ok = false; }
if (!ok) { var first = !val("vrsta") ? form.querySelector("input[name='vrsta']") : form.elements.ime; if (first) { first.focus(); } }
return ok;
};
form.addEventListener("submit", function (e) {
e.preventDefault();
if (!valid()) { return; }
var subject = d.subject + (val("vrsta") ? " — " + val("vrsta") : "");
window.location.href = "mailto:" + d.to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(compose());
});
var copyBtn = form.querySelector(".copy-btn");
if (copyBtn) {
copyBtn.addEventListener("click", function () {
if (!valid()) { return; }
var text = compose();
var done = function () { status.textContent = d.copied; };
if (navigator.clipboard && navigator.clipboard.writeText) {
navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text); done(); });
} else { fallbackCopy(text); done(); }
});
}
var fallbackCopy = function (text) {
var ta = document.createElement("textarea");
ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "absolute"; ta.style.left = "-9999px";
document.body.appendChild(ta); ta.select();
try { document.execCommand("copy"); } catch (e) { /* the visible e-mail address remains the fallback */ }
document.body.removeChild(ta);
};
}
})();
