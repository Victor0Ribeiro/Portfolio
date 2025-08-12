(() => {
  const canvas = document.getElementById('background');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', { alpha: true });

  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width = 0;
  let height = 0;

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
      this.alphaBase = 0.2 + Math.random() * 0.25; 
      this.brightnessPhase = Math.random() * Math.PI * 2;
    }

    update(scrollDelta) {
      this.x += this.speedX;
      this.y += this.speedY + scrollDelta * 0.45;
      this.angle += this.angularSpeed;
      this.brightnessPhase += 0.03;

      if (this.x < -this.length) this.x = width + this.length;
      if (this.x > width + this.length) this.x = -this.length;

      if (this.y > height + this.length) this.reset(false);
      if (this.y < -this.length) this.reset(false);
    }

    draw(ctx) {
      const x2 = this.x + Math.cos(this.angle) * this.length;
      const y2 = this.y + Math.sin(this.angle) * this.length;

      const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(this.brightnessPhase));
      const alpha = Math.min(1, this.alphaBase * pulse + 0.05);

      const r = 186, g = 55, b = 233; // Roxo

      ctx.save();

      // Glow forte
      ctx.shadowColor = `rgba(${r},${g},${b},${alpha})`;
      ctx.shadowBlur = 20;

      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      ctx.restore();

      // conexões com mouse, também com glow
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 130) {
          const t = (130 - dist) / 130;
          ctx.save();

          ctx.shadowColor = `rgba(${r},${g},${b},${t * 0.8})`;
          ctx.shadowBlur = 20 * t;

          ctx.lineWidth = 1;
          ctx.strokeStyle = `rgba(${r},${g},${b},${t * 0.8})`;
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
  let mouse = { x: null, y: null };
  let lastScrollY = window.scrollY || 0;
  let smoothScrollDelta = 0;

  function createLines() {
    const count = window.innerWidth < 768 ? 28 : 110;
    lines = [];
    for (let i = 0; i < count; i++) lines.push(new Line());
  }

  window.addEventListener('resize', () => {
    resize();
    createLines();
  });

  window.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });
  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('touchmove', e => {
    if (!e.touches || e.touches.length === 0) return;
    const t = e.touches[0];
    mouse.x = t.clientX;
    mouse.y = t.clientY;
  }, { passive: true });
  window.addEventListener('touchend', () => {
    mouse.x = null;
    mouse.y = null;
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
    for (const ln of lines) {
      ln.update(smoothScrollDelta);
      ln.draw(ctx);
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
