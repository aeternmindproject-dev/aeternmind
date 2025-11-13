/* =========================================================
   Aeternmind Labs — Main Script
   Funcionalidades:
   - Carrusel automático y manual
   - Control de audio SVG animado
   - Silenciamiento al cambiar slide
   - Pausa de videos inactivos
   - Ajuste responsive del carrusel
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =============== VARIABLES PRINCIPALES =============== */
  const items = document.querySelectorAll('.carousel-item');
  const total = items.length;
  let index = 0;

  const mainVideo = document.getElementById('mainVideo');
  const audioButton = document.getElementById('toggle-audio');
  const icon = document.getElementById('icon-sound');

  /* =============== FUNCIONES PRINCIPALES =============== */

  // Ajusta el alto del carrusel dinámicamente (según el header)
  function adjustCarouselHeight() {
    const header = document.querySelector('header');
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    const headerHeight = header ? header.offsetHeight : 0;
    carousel.style.height = `${window.innerHeight - headerHeight}px`;
    carousel.style.marginTop = `${headerHeight}px`;
  }

  // Muestra el slide indicado y pausa videos no visibles
  function showSlide(i) {
    items.forEach((item, idx) => {
      item.classList.toggle('active', idx === i);
    });

    // Silenciar y resetear ícono de audio
    if (mainVideo && audioButton && icon) {
      mainVideo.muted = true;
      audioButton.setAttribute('aria-pressed', 'false');
      icon.classList.add('muted');
    }

    // Pausar videos de slides no activos
    items.forEach((item, idx) => {
      const vid = item.querySelector('video');
      if (vid) {
        if (idx === i) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      }
    });
  }

  /* =============== CONTROLES DEL CARRUSEL =============== */

  // Botón siguiente
  document.querySelector('.next').addEventListener('click', () => {
    index = (index + 1) % total;
    showSlide(index);
  });

  // Botón anterior
  document.querySelector('.prev').addEventListener('click', () => {
    index = (index - 1 + total) % total;
    showSlide(index);
  });

  // Cambio automático cada 25 segundos
  setInterval(() => {
    index = (index + 1) % total;
    showSlide(index);
  }, 25000);

  /* =============== CONTROL DE AUDIO (SVG ANIMADO) =============== */
  if (audioButton && icon) {
    let audioEnabled = false;
    icon.classList.add('muted');
    audioButton.setAttribute('aria-pressed', 'false');

    audioButton.addEventListener('click', (e) => {
      e.preventDefault();

      // Busca el video activo (puede ser otro slide)
      let activeVideo = mainVideo;
      if (!activeVideo) {
        const activeSlide = document.querySelector('.carousel-item.active');
        activeVideo = activeSlide ? activeSlide.querySelector('video') : null;
      }

      // Cambia el estado del audio
      audioEnabled = !audioEnabled;

      if (activeVideo) {
        activeVideo.muted = !audioEnabled;
        if (audioEnabled) {
          const playPromise = activeVideo.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.catch(err => {
              console.warn('No se pudo reproducir con audio automáticamente:', err);
            });
          }
        }
      }

      // Actualiza el ícono SVG y accesibilidad
      icon.classList.toggle('muted', !audioEnabled);
      audioButton.setAttribute('aria-pressed', audioEnabled ? 'true' : 'false');
    });
  } else {
    console.error("No se encontró el botón o ícono de audio en el DOM.");
  }

  /* =============== EVENTOS DE AJUSTE RESPONSIVE =============== */
  window.addEventListener('load', adjustCarouselHeight);
  window.addEventListener('resize', () => {
    clearTimeout(window.__resizeTimeout);
    window.__resizeTimeout = setTimeout(adjustCarouselHeight, 150);
  });

  // Ajuste inicial
  adjustCarouselHeight();
  showSlide(0);
});
