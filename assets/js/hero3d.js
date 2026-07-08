/* ConstruMaia — cena 3D do hero (Three.js + GSAP ScrollTrigger)
   Campo de "tijolos" flutuantes com parallax de mouse; a câmera avança
   pela cena conforme o scroll. Sem WebGL (ou com prefers-reduced-motion),
   o hero mantém o fundo em CSS normalmente. */
import * as THREE from "three";

(function () {
  "use strict";

  var canvas = document.getElementById("heroCanvas");
  var hero = document.getElementById("inicio");
  if (!canvas || !hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: "low-power" });
  } catch (e) {
    return; // sem WebGL: fica o fundo em CSS
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
  hero.classList.add("has-3d");

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
  var CAM_HOME = { x: 0, y: 0, z: 14 };
  camera.position.set(CAM_HOME.x, CAM_HOME.y, CAM_HOME.z);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  var sun = new THREE.DirectionalLight(0xffe6c4, 1.4);
  sun.position.set(6, 9, 7);
  scene.add(sun);
  var glow = new THREE.PointLight(0xf2a238, 30, 40);
  glow.position.set(-7, -4, 3);
  scene.add(glow);

  /* ----- campo de tijolos (cores do logotipo: âmbar + azul) ----- */
  var COLORS = [0xf2a238, 0xf2a238, 0x1b64b1, 0x2a75c4, 0xeef2f7];
  var group = new THREE.Group();
  var bricks = [];
  var geo = new THREE.BoxGeometry(1.6, 0.75, 0.9);
  var edgeGeo = new THREE.EdgesGeometry(geo);

  for (var i = 0; i < 38; i++) {
    var color = COLORS[i % COLORS.length];
    var mesh;
    if (i % 6 === 5) {
      mesh = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0xf2a238, transparent: true, opacity: 0.55 }));
    } else {
      mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: color, roughness: 0.55, metalness: 0.15 }));
    }
    var r = Math.pow(Math.random(), 0.6);
    mesh.position.set(
      (Math.random() - 0.5) * 24 * r,
      (Math.random() - 0.5) * 13 * r,
      (Math.random() - 0.5) * 12 - 2
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    var s = 0.5 + Math.random() * 0.9;
    mesh.scale.setScalar(s);
    mesh.userData = {
      baseY: mesh.position.y,
      phase: Math.random() * Math.PI * 2,
      bobSpeed: 0.3 + Math.random() * 0.5,
      spinX: (Math.random() - 0.5) * 0.25,
      spinY: (Math.random() - 0.5) * 0.35
    };
    bricks.push(mesh);
    group.add(mesh);
  }
  scene.add(group);

  /* ----- piso "planta baixa" em wireframe ----- */
  var gridHelper = new THREE.GridHelper(80, 40, 0xf2a238, 0x2a75c4);
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.16;
  gridHelper.position.y = -8;
  scene.add(gridHelper);

  /* ----- parallax do mouse ----- */
  var mouse = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  /* ----- caminho da câmera no scroll (GSAP ScrollTrigger) ----- */
  var scroll = { p: 0 };
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.to(scroll, {
      p: 1,
      ease: "none",
      scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 }
    });
  } else {
    window.addEventListener("scroll", function () {
      scroll.p = Math.min(window.scrollY / Math.max(hero.offsetHeight, 1), 1);
    }, { passive: true });
  }

  /* ----- tamanho ----- */
  function resize() {
    var w = hero.clientWidth, h = hero.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", resize);
  resize();

  /* ----- render só quando o hero está visível ----- */
  var running = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting && !document.hidden;
    }, { threshold: 0 }).observe(hero);
  }
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) running = false;
    else running = true;
  });

  var clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    if (!running) return;
    var t = clock.getElapsedTime();

    for (var i = 0; i < bricks.length; i++) {
      var b = bricks[i], u = b.userData;
      b.position.y = u.baseY + Math.sin(t * u.bobSpeed + u.phase) * 0.45;
      b.rotation.x += u.spinX * 0.016;
      b.rotation.y += u.spinY * 0.016;
    }

    group.rotation.y = t * 0.04 + mouse.x * 0.12;
    group.rotation.x = mouse.y * 0.08;

    // câmera mergulha na cena conforme o scroll
    var p = scroll.p;
    camera.position.z = CAM_HOME.z - p * 7;
    camera.position.y = CAM_HOME.y - p * 4.5;
    camera.rotation.z = p * 0.12;
    camera.lookAt(0, -p * 3, 0);

    renderer.render(scene, camera);
  }
  tick();
})();
