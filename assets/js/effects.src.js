/* ============================================================
   ConstruMaia — motor de efeitos (fonte)
   - Three.js: uma cena WebGL individual por "alcova" (hero,
     diferenciais e contato), cada uma com câmera guiada pelo
     scroll via GSAP ScrollTrigger.
   - Howler.js: soundscape por transição de cena (whoosh) e
     micro-sons de interação (tick/pop), desligado por padrão
     com botão no header.
   - GSAP: entrada do hero palavra a palavra, parallax, header
     que se esconde ao rolar, revelações em cascata.
   - Extras: botões magnéticos e tilt 3D nos cards.

   Build (gera assets/js/effects.bundle.js):
     npx esbuild assets/js/effects.src.js --bundle --minify \
       --format=iife --outfile=assets/js/effects.bundle.js
   ============================================================ */
import * as THREE from "three";
import { Howl } from "howler";

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches;
  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var AMBER = 0xf2a238, BLUE = 0x1b64b1, BLUE_LIGHT = 0x2a75c4, CREAM = 0xeef2f7;

  /* ==================== SOUNDSCAPE (Howler) ==================== */
  var soundOn = false;
  var sounds = {};
  var lib = window.CM_SOUNDS || {};
  var soundBtn = document.getElementById("soundToggle");

  function ensureSounds() {
    if (sounds.whoosh || !lib.whoosh) return;
    sounds.whoosh = new Howl({ src: [lib.whoosh], volume: 0.16 });
    sounds.tick = new Howl({ src: [lib.tick], volume: 0.22 });
    sounds.pop = new Howl({ src: [lib.pop], volume: 0.2 });
  }
  function play(name) {
    if (soundOn && sounds[name]) sounds[name].play();
  }
  function setSound(on) {
    soundOn = on;
    if (on) ensureSounds();
    if (soundBtn) {
      soundBtn.classList.toggle("is-on", on);
      soundBtn.setAttribute("aria-pressed", on ? "true" : "false");
      soundBtn.setAttribute("aria-label", on ? "Desativar sons do site" : "Ativar sons do site");
    }
    try { localStorage.setItem("cm-sound", on ? "1" : "0"); } catch (e) {}
    if (on) play("pop");
  }
  if (soundBtn) soundBtn.addEventListener("click", function () { setSound(!soundOn); });
  // preferência salva: religa no primeiro gesto (política de autoplay)
  try {
    if (localStorage.getItem("cm-sound") === "1") {
      var arm = function () { setSound(true); document.removeEventListener("pointerdown", arm); };
      document.addEventListener("pointerdown", arm);
    }
  } catch (e) {}

  // whoosh nas transições de cena/seção
  var lastWhoosh = 0;
  function whoosh() {
    var now = Date.now();
    if (now - lastWhoosh > 800) { lastWhoosh = now; play("whoosh"); }
  }
  if (ScrollTrigger) {
    document.querySelectorAll("main > section[id]").forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: "top 55%",
        onEnter: whoosh, onEnterBack: whoosh
      });
    });
  }
  // micro-sons de interação
  document.addEventListener("click", function (e) {
    if (e.target.closest(".chip") || e.target.closest(".dep-card")) play("tick");
    else if (e.target.closest(".faq-item summary")) play("pop");
    else if (e.target.closest(".btn")) play("tick");
  });

  /* ==================== CENAS WEBGL ==================== */
  var scenes = [];

  function createStage(canvas, section) {
    if (!canvas || !section || reduced) return null;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch (e) { return null; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    var stage = {
      renderer: renderer,
      scene: new THREE.Scene(),
      camera: new THREE.PerspectiveCamera(55, 1, 0.1, 200),
      section: section,
      visible: true,
      scroll: { p: 0 },
      update: null
    };
    function resize() {
      var w = section.clientWidth, h = section.clientHeight;
      renderer.setSize(w, h, false);
      stage.camera.aspect = w / h;
      stage.camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { stage.visible = en[0].isIntersecting; }, { threshold: 0 }).observe(section);
    }
    if (gsap && ScrollTrigger) {
      gsap.to(stage.scroll, {
        p: 1, ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 0.6 }
      });
    }
    scenes.push(stage);
    return stage;
  }

  /* ----- Alcova 1: HERO — campo de tijolos + intro coreografada ----- */
  (function heroScene() {
    var hero = document.getElementById("inicio");
    var stage = createStage(document.getElementById("heroCanvas"), hero);
    if (!stage) return;
    hero.classList.add("has-3d");

    var scene = stage.scene, camera = stage.camera;
    camera.position.set(0, 0, 14);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    var sun = new THREE.DirectionalLight(0xffe6c4, 1.4);
    sun.position.set(6, 9, 7);
    scene.add(sun);
    var glow = new THREE.PointLight(AMBER, 30, 40);
    glow.position.set(-7, -4, 3);
    scene.add(glow);

    var COLORS = [AMBER, AMBER, BLUE, BLUE_LIGHT, CREAM];
    var group = new THREE.Group();
    var bricks = [];
    var geo = new THREE.BoxGeometry(1.6, 0.75, 0.9);
    var edgeGeo = new THREE.EdgesGeometry(geo);

    for (var i = 0; i < 38; i++) {
      var mesh;
      if (i % 6 === 5) {
        mesh = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: AMBER, transparent: true, opacity: 0.55 }));
      } else {
        mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: COLORS[i % COLORS.length], roughness: 0.55, metalness: 0.15 }));
      }
      var r = Math.pow(Math.random(), 0.6);
      var base = new THREE.Vector3(
        (Math.random() - 0.5) * 24 * r,
        (Math.random() - 0.5) * 13 * r,
        (Math.random() - 0.5) * 12 - 2
      );
      mesh.position.copy(base);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      mesh.scale.setScalar(0.5 + Math.random() * 0.9);
      mesh.userData = {
        base: base,
        start: base.clone().add(new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30, -30 - Math.random() * 20)),
        phase: Math.random() * Math.PI * 2,
        bobSpeed: 0.3 + Math.random() * 0.5,
        spinX: (Math.random() - 0.5) * 0.25,
        spinY: (Math.random() - 0.5) * 0.35
      };
      bricks.push(mesh);
      group.add(mesh);
    }
    scene.add(group);

    var grid = new THREE.GridHelper(80, 40, AMBER, BLUE_LIGHT);
    grid.material.transparent = true;
    grid.material.opacity = 0.16;
    grid.position.y = -8;
    scene.add(grid);

    var mouse = { x: 0, y: 0 };
    window.addEventListener("pointermove", function (e) {
      mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
    }, { passive: true });

    var born = performance.now();
    stage.update = function (t) {
      // intro: tijolos voam do fundo e se montam no campo (2s)
      var introP = Math.min((performance.now() - born) / 2000, 1);
      var ease = 1 - Math.pow(1 - introP, 3);
      for (var i = 0; i < bricks.length; i++) {
        var b = bricks[i], u = b.userData;
        var bobY = Math.sin(t * u.bobSpeed + u.phase) * 0.45;
        b.position.lerpVectors(u.start, u.base, ease);
        b.position.y += bobY * ease;
        b.rotation.x += u.spinX * 0.016;
        b.rotation.y += u.spinY * 0.016;
      }
      group.rotation.y = t * 0.04 + mouse.x * 0.12;
      group.rotation.x = mouse.y * 0.08;

      // caminho da câmera no scroll: mergulha e inclina
      var p = Math.max(0, stage.scroll.p * 2 - 1); // só na metade de saída do hero
      camera.position.z = 14 - p * 7;
      camera.position.y = -p * 4.5;
      camera.rotation.z = p * 0.12;
      camera.lookAt(0, -p * 3, 0);
    };
  })();

  /* ----- Alcova 2: DIFERENCIAIS — constelação de partículas ----- */
  (function particlesScene() {
    var section = document.getElementById("diferenciais");
    var stage = createStage(document.getElementById("fxDiferenciais"), section);
    if (!stage) return;

    var scene = stage.scene, camera = stage.camera;
    camera.position.set(0, 0, 16);

    var N = 900;
    var pos = new Float32Array(N * 3);
    var col = new Float32Array(N * 3);
    var amber = new THREE.Color(AMBER), blue = new THREE.Color(BLUE_LIGHT), white = new THREE.Color(0xdfe9f5);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 46;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 22;
      var c = Math.random() < 0.28 ? amber : (Math.random() < 0.7 ? blue : white);
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    var geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
    var pts = new THREE.Points(geo, new THREE.PointsMaterial({
      size: 0.14, vertexColors: true, transparent: true, opacity: 0.85,
      blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
    }));
    scene.add(pts);

    // linhas finas de "planta baixa" cruzando o fundo
    var lineMat = new THREE.LineBasicMaterial({ color: BLUE, transparent: true, opacity: 0.25 });
    for (var l = 0; l < 5; l++) {
      var lg = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-30, -8 + l * 4, -8),
        new THREE.Vector3(30, -8 + l * 4, -8)
      ]);
      scene.add(new THREE.Line(lg, lineMat));
    }

    stage.update = function (t) {
      pts.rotation.y = t * 0.03;
      pts.rotation.x = Math.sin(t * 0.11) * 0.06;
      // câmera atravessa a constelação conforme a seção rola
      camera.position.z = 20 - stage.scroll.p * 9;
      camera.position.y = (stage.scroll.p - 0.5) * 3;
      camera.lookAt(0, 0, 0);
    };
  })();

  /* ----- Alcova 3: CONTATO — horizonte wireframe em movimento ----- */
  (function terrainScene() {
    var section = document.getElementById("contato");
    var stage = createStage(document.getElementById("fxContato"), section);
    if (!stage) return;

    var scene = stage.scene, camera = stage.camera;
    camera.position.set(0, 3.2, 16);
    scene.fog = new THREE.Fog(0x0b2340, 12, 46);

    var W = 70, D = 44, SW = 46, SD = 30;
    var geo = new THREE.PlaneGeometry(W, D, SW, SD);
    geo.rotateX(-Math.PI / 2);
    var terrain = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
      color: BLUE_LIGHT, wireframe: true, transparent: true, opacity: 0.33
    }));
    terrain.position.y = -2.5;
    scene.add(terrain);
    var posAttr = geo.attributes.position;

    // "estrelas" âmbar sobre o horizonte
    var N = 140;
    var spos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      spos[i * 3] = (Math.random() - 0.5) * 60;
      spos[i * 3 + 1] = 2 + Math.random() * 12;
      spos[i * 3 + 2] = -Math.random() * 40;
    }
    var sgeo = new THREE.BufferGeometry();
    sgeo.setAttribute("position", new THREE.BufferAttribute(spos, 3));
    scene.add(new THREE.Points(sgeo, new THREE.PointsMaterial({
      color: AMBER, size: 0.16, transparent: true, opacity: 0.8,
      blending: THREE.AdditiveBlending, depthWrite: false
    })));

    stage.update = function (t) {
      // ondas do terreno correndo em direção ao observador
      for (var i = 0; i < posAttr.count; i++) {
        var x = posAttr.getX(i), z = posAttr.getZ(i);
        posAttr.setY(i, Math.sin(x * 0.32 + t * 0.7) * Math.cos(z * 0.22 + t * 0.55) * 1.15);
      }
      posAttr.needsUpdate = true;
      camera.position.y = 3.2 - stage.scroll.p * 1.2;
      camera.position.x = Math.sin(t * 0.08) * 1.4;
      camera.lookAt(0, 0.6, -12);
    };
  })();

  /* ----- loop único de render ----- */
  if (scenes.length) {
    var clock = new THREE.Clock();
    (function tick() {
      requestAnimationFrame(tick);
      if (document.hidden) return;
      var t = clock.getElapsedTime();
      for (var i = 0; i < scenes.length; i++) {
        var s = scenes[i];
        if (!s.visible) continue;
        if (s.update) s.update(t);
        s.renderer.render(s.scene, s.camera);
      }
    })();
  }

  /* ==================== COREOGRAFIA GSAP ==================== */
  if (gsap && !reduced) {
    // hero: título palavra a palavra + cascata dos demais elementos
    var title = document.querySelector(".hero-title");
    if (title) {
      // envolve cada palavra em spans, preservando o <span class="grad">
      var walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
      var textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach(function (node) {
        var frag = document.createDocumentFragment();
        node.textContent.split(/(\s+)/).forEach(function (piece) {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(piece)); return; }
          var outer = document.createElement("span"); outer.className = "w";
          var inner = document.createElement("span"); inner.className = "wi";
          inner.textContent = piece;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        node.parentNode.replaceChild(frag, node);
      });
      gsap.set(".hero-title .wi", { yPercent: 120, rotate: 6 });
      var tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.to(".hero-title .wi", { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.07 }, 0.15)
        .from(".hero-badge", { y: -18, autoAlpha: 0, duration: 0.7 }, 0.1)
        .from(".hero-sub", { y: 24, autoAlpha: 0, duration: 0.8 }, 0.7)
        .from(".hero-ctas .btn", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 0.9)
        .from(".hero-stats .stat", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 1.05);
      // o sistema .reveal do site.js não deve reanimar o hero
      // (e a transição CSS não pode brigar com o GSAP)
      document.querySelectorAll(".hero .reveal").forEach(function (el) {
        el.classList.add("is-in");
        el.style.transition = "none";
      });
    }

    if (ScrollTrigger) {
      // parallax: conteúdo do hero sobe mais devagar que o scroll
      gsap.to(".hero-inner", {
        yPercent: -14, autoAlpha: 0.25, ease: "none",
        scrollTrigger: { trigger: "#inicio", start: "top top", end: "bottom top", scrub: true }
      });
      // header esconde ao rolar para baixo, volta ao subir
      var header = document.getElementById("header");
      ScrollTrigger.create({
        start: "top -120",
        onUpdate: function (self) {
          if (self.direction === 1 && self.scroll() > 300) header.classList.add("is-hidden");
          else header.classList.remove("is-hidden");
        }
      });
      // cards do "sobre" entram alternados
      gsap.utils.toArray(".about-card").forEach(function (card, i) {
        card.style.transition = "box-shadow .3s ease"; // GSAP assume o transform
        gsap.from(card, {
          x: i % 2 ? 60 : -60, autoAlpha: 0, duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: card, start: "top 85%" }
        });
      });
      // faixa do orçamento ganha um leve zoom de chegada
      gsap.from(".quote-box", {
        scale: 0.94, autoAlpha: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".quote-box", start: "top 80%" }
      });
      // showcase: "entrando na loja" — a seção trava e o scroll vira um
      // zoom em direção à porta de entrada, terminando no bem-vindo
      var showcase = document.querySelector(".showcase");
      var showcaseImg = document.getElementById("showcaseImg");
      if (showcase && showcaseImg) {
        showcase.classList.add("fx-zoom");
        gsap.set(showcaseImg, { transformOrigin: "50% 58%" }); // origem = porta da loja
        gsap.from(".showcase-content > *", {
          y: 40, autoAlpha: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
          scrollTrigger: { trigger: showcase, start: "top 65%" }
        });
        var enterTl = gsap.timeline({
          scrollTrigger: {
            trigger: showcase, start: "top top", end: "+=140%",
            scrub: 0.5, pin: true, anticipatePin: 1
          }
        });
        enterTl
          .fromTo(showcaseImg, { scale: 1 }, { scale: 2.2, ease: "power1.in", duration: 1 }, 0)
          .to(".showcase-content", { autoAlpha: 0, y: -70, ease: "power1.in", duration: 0.35 }, 0.1)
          .to(".showcase-vignette", { opacity: 1, duration: 0.6 }, 0.25)
          .fromTo(".showcase-enter",
            { autoAlpha: 0, scale: 0.92 },
            { autoAlpha: 1, scale: 1, ease: "power2.out", duration: 0.35 }, 0.6);
      }
      // fotos das lojas revelam com leve zoom-out
      gsap.utils.toArray(".store-photo img").forEach(function (img) {
        gsap.from(img, {
          scale: 1.18, duration: 1.2, ease: "power2.out", clearProps: "transform",
          scrollTrigger: { trigger: img, start: "top 90%" }
        });
      });
    }
  }

  /* ==================== MICRO-INTERAÇÕES ==================== */
  if (!reduced && !isTouch) {
    // botões magnéticos
    document.querySelectorAll(".btn-primary, .btn-whats, .btn-outline").forEach(function (btn) {
      btn.addEventListener("pointermove", function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) / r.width;
        var dy = (e.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = "translate(" + dx * 7 + "px," + (dy * 7 - 2) + "px)";
      });
      btn.addEventListener("pointerleave", function () { btn.style.transform = ""; });
    });
    // tilt 3D nos cards
    document.querySelectorAll(".dep-card, .store-card, .feat").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
        var ry = ((e.clientX - r.left) / r.width - 0.5) * 7;
        card.style.transform = "perspective(800px) translateY(-6px) rotateX(" + rx + "deg) rotateY(" + ry + "deg)";
      });
      card.addEventListener("pointerleave", function () { card.style.transform = ""; });
    });
  }
})();
