/* =========================================================
   Aeternmind Labs — Main Script
   Funcionalidades:
   - Carrusel automático y manual
   - Control de audio SVG animado
   - Silenciamiento al cambiar slide
   - Pausa de videos inactivos
   - Ajuste responsive del carrusel
   - Modo inteligente de visualización (cover / contain)
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =============== VARIABLES PRINCIPALES =============== */
  const items = document.querySelectorAll('.carousel-item');
  const total = items.length;
  let index = 0;

  const mainVideo = document.getElementById('mainVideo');
  const audioButton = document.getElementById('toggle-audio');
  const icon = document.getElementById('icon-sound');

  /* ============================================================
     MODO INTELIGENTE DE VISUALIZACIÓN (cover / contain)
     Detecta proporciones del video y la pantalla
     ============================================================ */

  function applySmartVideoFit() {
    const activeSlide = document.querySelector('.carousel-item.active');
    if (!activeSlide) return;

    const media = activeSlide.querySelector('video, img');
    if (!media) return;

    // Obtener proporción real del media
    const mediaRatio = media.videoWidth && media.videoHeight
      ? media.videoWidth / media.videoHeight
      : media.naturalWidth && media.naturalHeight
        ? media.naturalWidth / media.naturalHeight
        : null;

    if (!mediaRatio) return;

    const screenRatio = window.innerWidth / window.innerHeight;

    // Reset de clases previas
    media.classList.remove('smart-cover', 'smart-contain');

    /*
       Lógica:
       Si el video es mucho más ancho → contain
       Si es más alto o similar → cover
    */
    if (mediaRatio > screenRatio) {
      media.classList.add('smart-contain');   // Mostrar video completo
    } else {
      media.classList.add('smart-cover');     // Llenar pantalla
    }
  }

  // Recalcular visualización al cambiar orientación o tamaño de pantalla
  window.addEventListener('resize', () => {
    clearTimeout(window.__ratioTimeout);
    window.__ratioTimeout = setTimeout(applySmartVideoFit, 150);
  });

  // Recalcular cuando cada video esté listo
  document.querySelectorAll('.carousel-item video').forEach(video => {
    video.addEventListener('loadedmetadata', applySmartVideoFit);
  });

  function smartFitOnSlideChange() {
    setTimeout(applySmartVideoFit, 150);
  }

  /* ============================================================
     AJUSTE DE ALTURA DEL CARRUSEL SEGÚN EL HEADER
     ============================================================ */

  function adjustCarouselHeight() {
    const header = document.querySelector('header');
    const carousel = document.querySelector('.carousel');

    if (!carousel) return;

    const headerHeight = header ? header.offsetHeight : 0;

    carousel.style.height = `${window.innerHeight - headerHeight}px`;
    carousel.style.marginTop = `${headerHeight}px`;
  }

  window.addEventListener('load', adjustCarouselHeight);
  window.addEventListener('resize', () => {
    clearTimeout(window.__resizeTimeout);
    window.__resizeTimeout = setTimeout(adjustCarouselHeight, 150);
  });


  /* ============================================================
     FUNCIÓN PRINCIPAL DEL CARRUSEL
     ============================================================ */
  function showSlide(i) {
    items.forEach((item, idx) => {
      item.classList.toggle('active', idx === i);
    });

    // Silenciar video y resetear icono
    if (mainVideo && audioButton && icon) {
      mainVideo.muted = true;
      audioButton.setAttribute('aria-pressed', 'false');
      icon.classList.add('muted');
    }

    // Pausar videos fuera del slide activo
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

    // Aplicar modo inteligente
    smartFitOnSlideChange();
  }

  /* ============================================================
     CONTROLES DEL CARRUSEL
     ============================================================ */

  document.querySelector('.next').addEventListener('click', () => {
    index = (index + 1) % total;
    showSlide(index);
  });

  document.querySelector('.prev').addEventListener('click', () => {
    index = (index - 1 + total) % total;
    showSlide(index);
  });

  // Cambio automático cada 25 segundos
  setInterval(() => {
    index = (index + 1) % total;
    showSlide(index);
  }, 25000);

  /* ============================================================
     CONTROL DE AUDIO (SVG ANIMADO)
     ============================================================ */

  if (audioButton && icon) {
    let audioEnabled = false;

    icon.classList.add('muted');
    audioButton.setAttribute('aria-pressed', 'false');

    audioButton.addEventListener('click', (e) => {
      e.preventDefault();

      // Busca el video del slide activo
      const activeSlide = document.querySelector('.carousel-item.active');
      let activeVideo = activeSlide ? activeSlide.querySelector('video') : mainVideo;

      audioEnabled = !audioEnabled;

      if (activeVideo) {
        activeVideo.muted = !audioEnabled;

        if (audioEnabled) {
          activeVideo.play().catch(() => {});
        }
      }

      // Actualizar icono SVG
      icon.classList.toggle('muted', !audioEnabled);
      audioButton.setAttribute('aria-pressed', audioEnabled ? 'true' : 'false');
    });
  }

  /* ============================================================
     INICIALIZACIÓN
     ============================================================ */
  adjustCarouselHeight();
  showSlide(0);
});
