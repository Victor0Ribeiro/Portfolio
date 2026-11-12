// Fundo animado: linhas roxas que flutuam e se conectam ao cursor.
(() => {
  const canvas = document.getElementById('background');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const COLOR = '186, 85, 247';
  const MOUSE_RADIUS = 140;
  const LINES_DESKTOP = 70;
  const LINES_MOBILE = 24;
  const MOBILE_BREAKPOINT = 768;
  const MAX_SCROLL_PUSH = 40;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let width = 0;
  let height = 0;
  let lines = [];
  let rafId = null;
  let lastScrollY = window.scrollY;
  let scrollPush = 0;
  const mouse = { x: null, y: null };

  const rand = (min, max) => min + Math.random() * (max - min);

  function createLine(initial) {
    return {
      x: rand(0, width),
      y: initial ? rand(0, height) : rand(-220, -20),
      length: rand(60, 200),
      speedX: rand(-0.17, 0.17),
      speedY: rand(0.2, 0.7),
      angle: rand(0, Math.PI * 2),
      spin: rand(-0.002, 0.002),
      alphaBase: rand(0.12, 0.32),
      phase: rand(0, Math.PI * 2),
    };
  }

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function createLines() {
    const count = width < MOBILE_BREAKPOINT ? LINES_MOBILE : LINES_DESKTOP;
    lines = Array.from({ length: count }, () => createLine(true));
  }

  function step(line) {
    line.x += line.speedX;
    line.y += line.speedY + scrollPush * 0.45;
    line.angle += line.spin;
    line.phase += 0.025;

    if (line.x < -line.length) line.x = width + line.length;
    if (line.x > width + line.length) line.x = -line.length;
    if (line.y > height + line.length || line.y < -line.length - 240) {
      Object.assign(line, createLine(false));
    }
  }

  function draw(line) {
    const pulse = 0.55 + 0.45 * Math.sin(line.phase);
    const alpha = line.alphaBase * pulse + 0.04;

    ctx.strokeStyle = `rgba(${COLOR}, ${alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(line.x + Math.cos(line.angle) * line.length, line.y + Math.sin(line.angle) * line.length);
    ctx.stroke();

    if (mouse.x === null) return;
    const dist = Math.hypot(line.x - mouse.x, line.y - mouse.y);
    if (dist >= MOUSE_RADIUS) return;

    const t = 1 - dist / MOUSE_RADIUS;
    ctx.strokeStyle = `rgba(${COLOR}, ${t * 0.6})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(line.x, line.y);
    ctx.lineTo(mouse.x, mouse.y);
    ctx.stroke();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    // "lighter" soma as cores e cria um brilho leve sem o custo do shadowBlur
    ctx.globalCompositeOperation = 'lighter';
    for (const line of lines) draw(line);
    ctx.globalCompositeOperation = 'source-over';
  }

  function frame() {
    scrollPush *= 0.94;
    for (const line of lines) step(line);
    render();
    rafId = requestAnimationFrame(frame);
  }

  function start() {
    if (rafId !== null || reducedMotion.matches) return;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    if (rafId === null) return;
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Recria as linhas só quando a largura muda (no celular a barra de endereço muda a altura ao rolar)
  let resizeTimer = null;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const widthChanged = window.innerWidth !== width;
      resize();
      if (widthChanged) createLines();
      if (reducedMotion.matches) render();
    }, 150);
  });

  window.addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return;
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('scroll', () => {
    const delta = window.scrollY - lastScrollY;
    lastScrollY = window.scrollY;
    scrollPush += (delta - scrollPush) * 0.2;
    scrollPush = Math.max(-MAX_SCROLL_PUSH, Math.min(MAX_SCROLL_PUSH, scrollPush));
  }, { passive: true });

  // Pausa quando a aba não está visível
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else start();
  });

  reducedMotion.addEventListener?.('change', () => {
    if (reducedMotion.matches) {
      stop();
      render();
    } else {
      start();
    }
  });

  resize();
  createLines();
  render();
  start();
})();
