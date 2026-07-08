/* ConstruMaia — interações do site */
(function () {
  "use strict";

  var WHATS_NUMBER = "553832151566"; // confirme se este número atende WhatsApp

  /* ---------- header: fundo ao rolar + barra de progresso ---------- */
  var header = document.getElementById("header");
  var scrollBar = document.getElementById("scrollBar");
  var backTop = document.getElementById("backTop");

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 40);
    backTop.classList.toggle("is-visible", y > 700);
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    scrollBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    highlightNav();
  }
  window.addEventListener("scroll", onScroll, { passive: true });

  backTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- menu mobile ---------- */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("menuToggle");

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.classList.contains("nav-link")) {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- link ativo conforme a seção visível ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  function highlightNav() {
    var pos = window.scrollY + window.innerHeight * 0.35;
    var current = sections[0];
    sections.forEach(function (s) { if (s.offsetTop <= pos) current = s; });
    navLinks.forEach(function (l) {
      l.classList.toggle("is-active", l.getAttribute("href") === "#" + current.id);
    });
  }

  /* ---------- animações de entrada ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- contadores do hero ---------- */
  var counters = document.querySelectorAll(".counter");
  var counted = false;
  function runCounters() {
    if (counted) return;
    counted = true;
    counters.forEach(function (el) {
      var target = parseInt(el.dataset.target, 10);
      var duration = 1600;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target).toLocaleString("pt-BR");
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { runCounters(); cio.disconnect(); }
    }, { threshold: 0.4 });
    cio.observe(counters[0]);
  } else {
    runCounters();
  }

  /* ---------- orçamento: chips + mensagem para o WhatsApp ---------- */
  var chips = Array.prototype.slice.call(document.querySelectorAll("#quoteChips .chip"));
  var nameInput = document.getElementById("quoteName");
  var msgInput = document.getElementById("quoteMsg");
  var preview = document.getElementById("quotePreview");
  var sendBtn = document.getElementById("quoteSend");

  function selectedDeps() {
    return chips
      .filter(function (c) { return c.classList.contains("is-on"); })
      .map(function (c) { return c.dataset.value; });
  }

  function buildMessage() {
    var parts = ["Olá! Vim pelo site da ConstruMaia e gostaria de um orçamento."];
    var name = nameInput.value.trim();
    var deps = selectedDeps();
    var msg = msgInput.value.trim();
    if (name) parts.push("Meu nome é " + name + ".");
    if (deps.length) parts.push("Preciso de itens de: " + deps.join(", ") + ".");
    if (msg) parts.push("Lista/detalhes: " + msg);
    return parts.join("\n");
  }

  function updateQuote() {
    var text = buildMessage();
    preview.textContent = text;
    sendBtn.href = "https://wa.me/" + WHATS_NUMBER + "?text=" + encodeURIComponent(text);
  }

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chip.classList.toggle("is-on");
      updateQuote();
    });
  });
  nameInput.addEventListener("input", updateQuote);
  msgInput.addEventListener("input", updateQuote);
  updateQuote();

  /* ---------- cards de departamento alimentam o orçamento ---------- */
  document.querySelectorAll(".dep-card").forEach(function (card) {
    function pick() {
      var dep = card.dataset.dep;
      var chip = chips.filter(function (c) { return c.dataset.value === dep; })[0];
      if (chip) chip.classList.toggle("is-on", card.classList.toggle("is-picked"));
      updateQuote();
    }
    card.addEventListener("click", pick);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); }
    });
  });

  /* ---------- FAQ: fecha os demais ao abrir um ---------- */
  var faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        faqItems.forEach(function (other) { if (other !== item) other.open = false; });
      }
    });
  });

  /* ---------- modal do vídeo institucional ---------- */
  var videoModal = document.getElementById("videoModal");
  var videoIframe = document.getElementById("videoIframe");
  var openVideoBtn = document.getElementById("openVideo");

  function openVideo() {
    if (!videoModal) return;
    if (!videoIframe.src) videoIframe.src = videoIframe.dataset.src; // carrega só ao abrir
    videoModal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closeVideo() {
    if (!videoModal) return;
    videoModal.hidden = true;
    videoIframe.src = ""; // para o vídeo ao fechar
    document.body.style.overflow = "";
  }
  if (openVideoBtn) openVideoBtn.addEventListener("click", openVideo);
  if (videoModal) {
    videoModal.addEventListener("click", function (e) {
      if (e.target.closest("[data-close-video]")) closeVideo();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !videoModal.hidden) closeVideo();
    });
  }

  /* ---------- ano no rodapé ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  onScroll();
})();
