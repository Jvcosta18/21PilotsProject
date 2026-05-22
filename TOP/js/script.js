/**
 * =====================================================
 * TWENTY ONE PILOTS — Stay Alive |-/
 * js/script.js
 *
 * ÍNDICE
 * ─────────────────────────────────────────────────
 * 01. Cursor customizado (dot + ring com trail)
 * 02. Partículas flutuantes do Hero
 * 03. Navbar: adiciona fundo sólido ao scrollar
 * 04. Scroll Reveal (IntersectionObserver)
 * 05. Side-dots (navegação lateral)
 * 06. Parallax 3D nas capas dos álbuns
 * 07. Linhas de glitch — era Blurryface
 * 08. Glitch ocasional no título do Hero
 * =====================================================
 */

'use strict';


/* ─────────────────────────────────────────────
   01. CURSOR CUSTOMIZADO
   #cursor-dot  → segue o mouse imediatamente
   #cursor-ring → segue com delay (efeito trail)
   O ring usa interpolação linear (lerp) para
   criar a suavidade de "arrasto".
───────────────────────────────────────────────── */
(function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;  // posição atual do mouse
  let ringX  = 0, ringY  = 0;  // posição atual do ring (atrasa)

  // Atualiza o ponto sólido instantaneamente
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  // Esconde cursor ao sair da janela
  document.addEventListener('mouseleave', () => { dot.style.opacity = '0'; ring.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = '1'; ring.style.opacity = '1'; });

  // Loop de animação — ring segue o mouse a 12% por frame (cria o delay visual)
  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();
})();


/* ─────────────────────────────────────────────
   02. PARTÍCULAS FLUTUANTES DO HERO
   Cria 22 divs com tamanho, posição e cor
   aleatórios. A animação (starFloat) é feita
   puramente via CSS.
───────────────────────────────────────────────── */
(function initStars() {
  const container = document.getElementById('hero-stars');
  if (!container) return;

  for (let i = 0; i < 22; i++) {
    const star     = document.createElement('div');
    const size     = Math.random() * 3 + 1;          // 1–4px
    const left     = Math.random() * 100;             // posição horizontal
    const duration = 9 + Math.random() * 14;          // 9–23s por ciclo
    const delay    = Math.random() * 10;              // delay inicial
    const color    = Math.random() > 0.6
      ? 'rgba(244,208,63,.38)'    // amarelo TØP
      : 'rgba(255,255,255,.45)';  // branco

    star.className    = 'star-particle';
    star.style.cssText = `
      width:${size}px; height:${size}px; left:${left}%;
      background:${color};
      animation-duration:${duration}s; animation-delay:${delay}s;
    `;
    container.appendChild(star);
  }
})();


/* ─────────────────────────────────────────────
   03. NAVBAR — FUNDO SÓLIDO AO SCROLLAR
   Adiciona .scrolled após 30px de scroll.
   O CSS cuida do estilo visual.
───────────────────────────────────────────────── */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // checa na inicialização
})();


/* ─────────────────────────────────────────────
   04. SCROLL REVEAL
   IntersectionObserver: quando um elemento .reveal
   entra na viewport, recebe .visible (definido no CSS),
   disparando a animação de fade + subida.
   Após animar, para de observar (economiza performance).
───────────────────────────────────────────────── */
(function initReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // para de observar após animar
        }
      });
    },
    {
      threshold:   0.1,               // 10% visível já dispara
      rootMargin: '0px 0px -40px 0px' // aciona 40px antes do fim da viewport
    }
  );

  elements.forEach((el) => observer.observe(el));
})();


/* ─────────────────────────────────────────────
   05. SIDE-DOTS — NAVEGAÇÃO LATERAL
   a) Clique → scroll suave até a era
   b) Scroll → destaca o dot da era visível
      (última era cujo topo está acima do meio da tela)
───────────────────────────────────────────────── */
(function initSideDots() {
  const dots = document.querySelectorAll('.sdot');
  const ids  = [
    'era-selftitled','era-regional','era-vessel','era-blurryface',
    'era-trench','era-scaled','era-clancy','era-breach'
  ];
  if (!dots.length) return;

  // a) Clique → scroll suave
  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const target = document.getElementById(dot.dataset.target);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  // b) Destaca o dot ativo ao scrollar
  function updateActive() {
    const mid = window.scrollY + window.innerHeight * 0.45;
    let active = -1;

    ids.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= mid) active = i;
    });

    dots.forEach((d, i) => d.classList.toggle('active', i === active));
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();


/* ─────────────────────────────────────────────
   06. PARALLAX 3D NAS CAPAS DOS ÁLBUNS
   Ao mover o mouse, as capas giram levemente
   em perspectiva 3D — efeito de profundidade.
   Só processa as eras visíveis (rect check) para
   não desperdiçar GPU em seções fora da tela.
───────────────────────────────────────────────── */
(function initParallax() {
  const frames = document.querySelectorAll('.album-frame');
  if (!frames.length) return;

  document.addEventListener('mousemove', (e) => {
    // Normaliza: -0.5 a +0.5
    const xR = e.clientX / window.innerWidth  - 0.5;
    const yR = e.clientY / window.innerHeight - 0.5;

    frames.forEach((frame) => {
      const era  = frame.closest('.era');
      if (!era) return;

      const rect    = era.getBoundingClientRect();
      const visible = rect.top < window.innerHeight && rect.bottom > 0;

      if (visible) {
        // Máximo ±3.5° de rotação
        frame.style.transform = `
          perspective(900px)
          rotateY(${xR * 7}deg)
          rotateX(${-yR * 7}deg)
          scale(1.015)
        `;
      } else {
        frame.style.transform = '';
      }
    });
  });
})();


/* ─────────────────────────────────────────────
   07. LINHAS DE GLITCH — ERA BLURRYFACE
   Cria 8 linhas horizontais que atravessam a
   tela de cima para baixo com timing aleatório.
   CSS (glitchScroll) faz a animação.
───────────────────────────────────────────────── */
(function initGlitch() {
  const container = document.getElementById('glitch-bg');
  if (!container) return;

  for (let i = 0; i < 8; i++) {
    const line = document.createElement('div');
    line.className    = 'glitch-line';
    line.style.cssText = `
      animation-duration: ${3 + Math.random() * 9}s;
      animation-delay:    ${Math.random() * 7}s;
      height:             ${1 + Math.random() * 2.5}px;
    `;
    container.appendChild(line);
  }
})();


/* ─────────────────────────────────────────────
   08. GLITCH OCASIONAL NO TÍTULO DO HERO
   A cada 250ms, há 4% de chance de o título
   tremer levemente no eixo X por 70ms —
   simula artefato de sinal corrompido.
───────────────────────────────────────────────── */
(function initTitleGlitch() {
  const title = document.getElementById('hero-title');
  if (!title) return;

  setInterval(() => {
    if (Math.random() < 0.04) {
      const shift = (Math.random() - 0.5) * 10; // ±5px
      title.style.transform = `translateX(${shift}px)`;
      setTimeout(() => { title.style.transform = ''; }, 70);
    }
  }, 250);
})();
