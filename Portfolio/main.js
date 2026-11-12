// Interações da página: header ao rolar, animação de entrada e link ativo no menu.
(() => {
  const header = document.querySelector('.site-header');
  const SCROLL_THRESHOLD = 8;

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  }
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  // Ano atual no rodapé
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = String(new Date().getFullYear());

  // Sem IntersectionObserver: mostra tudo de uma vez
  const revealItems = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    revealItems.forEach(el => el.classList.add('visible'));
    return;
  }

  // Elementos aparecem conforme entram na tela
  const revealObserver = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
  revealItems.forEach(el => revealObserver.observe(el));

  // Destaca no menu a seção visível
  const navLinks = new Map(
    [...document.querySelectorAll('.nav-list a')].map(a => [a.getAttribute('href').slice(1), a])
  );
  const sectionObserver = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const link = navLinks.get(entry.target.id);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    }
  }, { rootMargin: '-45% 0px -50% 0px' });
  navLinks.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) sectionObserver.observe(section);
  });
})();
