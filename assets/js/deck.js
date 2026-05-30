/* ConstruAI — Investor Deck | navegação por teclado, dots e progresso */
(function () {
  const deck = document.querySelector('.deck');
  const slides = Array.from(document.querySelectorAll('.slide'));
  const fill = document.querySelector('.topbar__fill');
  const count = document.querySelector('.nav__count');
  const dotsWrap = document.querySelector('.dots');
  let current = 0;

  // cria os dots
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', 'Ir para o slide ' + (i + 1));
    b.addEventListener('click', () => go(i));
    dotsWrap.appendChild(b);
  });
  const dots = Array.from(dotsWrap.children);

  function go(i) {
    current = Math.max(0, Math.min(slides.length - 1, i));
    slides[current].scrollIntoView({ behavior: 'smooth' });
    update();
  }
  function next() { go(current + 1); }
  function prev() { go(current - 1); }

  function update() {
    const pct = ((current + 1) / slides.length) * 100;
    if (fill) fill.style.width = pct + '%';
    if (count) count.textContent = String(current + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
    dots.forEach((d, i) => d.classList.toggle('on', i === current));
  }

  // detecta slide ativo no scroll (inclui swipe/touchpad)
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        const i = slides.indexOf(e.target);
        if (i !== -1) { current = i; update(); }
      }
    });
  }, { threshold: 0.55 });
  slides.forEach((s) => io.observe(s));

  // teclado
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(slides.length - 1); }
  });

  // botões
  const nb = document.querySelector('[data-next]');
  const pb = document.querySelector('[data-prev]');
  if (nb) nb.addEventListener('click', next);
  if (pb) pb.addEventListener('click', prev);

  update();
})();
