(() => {
  const canvas = document.getElementById('background');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  // device pixel ratio for crisp rendering
  let dpr = Math.max(1, window.devicePixelRatio || 1);

  let width = 0;
  let height = 0;

  // pega a cor do CSS para as linhas (espera "R,G,B")
  function getLineRGB() {
    const s = getComputedStyle(document.documentElement).getPropertyValue('--destaque') || '#fa20d6';
    // converte HEX para R,G,B
    function hexToRgb(hex) {
      hex = hex.replace('#','');
      if(hex.length === 3) hex = hex.split('').map(c => c + c).join('');
      const bigint = parseInt(hex, 16);
      const r = (bigint >> 16) & 255;
      const g = (bigint >> 8) & 255;
      const b = bigint & 255;
      return `${r},${g},${b}`;
    }
    // tenta extrair do var --destaque que é HEX
    return hexToRgb(s.trim());
  }

  // configuração
  const BASE_COUNT_DESKTOP = 110;
  const BASE_COUNT_MOBILE = 28;

  let mouse = { x: null, y: null };
  let lastScrollY = window.scrollY || 0;
  let smoothScrollDelta = 0;

  // resize canvas considerando DPR
  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    width = Math.max(300, window.innerWidth);
    height = Math.max(300, window.innerHeight);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  class Line {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : (-20 - Math.random() * 200);
      this.length = 80 + Math.random() * 160;
      this.speedX = (Math.random() - 0.5) * 0.35;
      this.speedY = 0.25 + Math.random() * 0.6;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() - 0.5) * 0.004;
      this.alphaBase = 0.08 + Math.random() * 0.18;
      this.brightnessPhase = Math.random() * Math.PI * 2;
    }

    update(scrollDelta) {
      this.x += this.speedX;
      this.y += this.speedY + scrollDelta * 0.45;

      this.angle += this.angularSpeed;
      this.brightnessPhase += 0.02;

      if (this.x < -this.length) this.x = width + this.length;
      if (this.x > width + this.length) this.x = -this.length;

      if (this.y > height + this.length) this.reset(false);
      if (this.y < -this.length) this.reset(false);
    }

    draw(ctx, rgb) {
      const x2 = this.x + Math.cos(this.angle) * this.length;
      const y2 = this.y + Math.sin(this.angle) * this.length;

      const pulse = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(this.brightnessPhase));
      const alpha = Math.min(1, this.alphaBase * pulse + 0.02);

      ctx.save();
      ctx.lineWidth = 1.4;
      ctx.strokeStyle = `rgba(255,255,255,${Math.max(0.06, alpha * 0.5)})`;
      ctx.shadowColor = `rgba(${rgb},${Math.min(0.85, alpha)})`;
      ctx.shadowBlur = 8 + 12 * (pulse - 0.5);
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.restore();

      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const t = (130 - dist) / 130;
          ctx.save();
          ctx.lineWidth = 0.7;
          ctx.strokeStyle = `rgba(${rgb},${0.5 * t})`;
          ctx.shadowColor = `rgba(${rgb},${0.9 * t})`;
          ctx.shadowBlur = 10 + 18 * t;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  let lines = [];
  function createLines() {
    const count = window.innerWidth < 768 ? BASE_COUNT_MOBILE : BASE_COUNT_DESKTOP;
    lines = [];
    for (let i = 0; i < count; i++) lines.push(new Line());
  }

  window.addEventListener('resize', () => {
    resize();
    createLines();
  });

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = mouse.y = null;
  });

  window.addEventListener('touchmove', (e) => {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => {
    mouse.x = mouse.y = null;
  });

  window.addEventListener('scroll', () => {
    const cur = window.scrollY || window.pageYOffset || 0;
    const delta = cur - lastScrollY;
    lastScrollY = cur;
    smoothScrollDelta += (delta - smoothScrollDelta) * 0.2;
    if (smoothScrollDelta > 40) smoothScrollDelta = 40;
    if (smoothScrollDelta < -40) smoothScrollDelta = -40;
  }, { passive: true });

  function animate() {
    ctx.clearRect(0, 0, width, height);
    smoothScrollDelta *= 0.94;
    const rgb = getLineRGB();
    for (const ln of lines) {
      ln.update(smoothScrollDelta);
      ln.draw(ctx, rgb);
    }
    requestAnimationFrame(animate);
  }

  function init() {
    resize();
    createLines();
    lastScrollY = window.scrollY || 0;
    requestAnimationFrame(animate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
