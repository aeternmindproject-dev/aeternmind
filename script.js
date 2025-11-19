/* =========================================================
   Aeternmind Labs — Main Script (Versión Optimizada)
   Funcionalidades:
   - Carrusel automático y manual
   - Control de audio SVG animado
   - Silenciamiento al cambiar slide
   - Pausa de videos inactivos
   - Ajuste responsive del carrusel
   - Modo inteligente de visualización (cover / contain)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ============================================================
     VARIABLES PRINCIPALES
  ============================================================ */
  const items = document.querySelectorAll(".carousel-item");
  const total = items.length;

  let index = 0;
  let autoSlideInterval = null;

  const mainVideo = document.getElementById("mainVideo");
  const audioButton = document.getElementById("toggle-audio");
  const icon = document.getElementById("icon-sound");

  /* ============================================================
     MODO INTELIGENTE DE AJUSTE VISUAL (cover / contain)
  ============================================================ */

  function applySmartVideoFit() {
    const activeSlide = document.querySelector(".carousel-item.active");
    if (!activeSlide) return;

    const media = activeSlide.querySelector("video, img");
    if (!media) return;

    const mediaRatio =
      media.videoWidth && media.videoHeight
        ? media.videoWidth / media.videoHeight
        : media.naturalWidth && media.naturalHeight
        ? media.naturalWidth / media.naturalHeight
        : null;

    if (!mediaRatio) return;

    const screenRatio = window.innerWidth / window.innerHeight;

    // Reset
    media.classList.remove("smart-cover", "smart-contain");

    // Decide
    if (mediaRatio > screenRatio) {
      media.classList.add("smart-contain");
    } else {
      media.classList.add("smart-cover");
    }
  }

  function scheduleSmartFit() {
    clearTimeout(window.__smartFitTimeout);
    window.__smartFitTimeout = setTimeout(applySmartVideoFit, 150);
  }

  window.addEventListener("resize", scheduleSmartFit);

  document.querySelectorAll(".carousel-item video").forEach(video =>
    video.addEventListener("loadedmetadata", applySmartVideoFit)
  );

  /* ============================================================
     AJUSTE DE ALTURA DEL CARRUSEL
  ============================================================ */

  function adjustCarouselHeight() {
    const header = document.querySelector("header");
    const carousel = document.querySelector(".carousel");
    if (!carousel) return;

    const h = header ? header.offsetHeight : 0;
    carousel.style.height = `${window.innerHeight - h}px`;
    carousel.style.marginTop = `${h}px`;
  }

  window.addEventListener("load", adjustCarouselHeight);
  window.addEventListener("resize", () => {
    clearTimeout(window.__resizeTimeout);
    window.__resizeTimeout = setTimeout(adjustCarouselHeight, 150);
  });

  /* ============================================================
     CAMBIO DE SLIDE
  ============================================================ */

  function pauseInactiveVideos() {
    items.forEach((item, i) => {
      const vid = item.querySelector("video");
      if (vid) {
        if (i === index) vid.play().catch(() => {});
        else vid.pause();
      }
    });
  }

  function resetAudioState() {
    if (mainVideo && audioButton && icon) {
      mainVideo.muted = true;
      audioButton.setAttribute("aria-pressed", "false");
      icon.classList.add("muted");
    }
  }

  function showSlide(i) {
    index = i;

    items.forEach((item, idx) =>
      item.classList.toggle("active", idx === i)
    );

    resetAudioState();
    pauseInactiveVideos();
    scheduleSmartFit();
  }

  /* ============================================================
     CONTROLES MANUALES DEL CARRUSEL
  ============================================================ */

  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      showSlide((index + 1) % total);
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      showSlide((index - 1 + total) % total);
    });
  }

  /* ============================================================
     AUTO-CAMBIO DE SLIDE
  ============================================================ */

  function startAutoSlide() {
    autoSlideInterval = setInterval(() => {
      showSlide((index + 1) % total);
    }, 25000);
  }

  /* ============================================================
     CONTROL DE AUDIO (SVG)
  ============================================================ */

  if (audioButton && icon) {
    let audioEnabled = false;

    icon.classList.add("muted");
    audioButton.setAttribute("aria-pressed", "false");

    audioButton.addEventListener("click", (e) => {
      e.preventDefault();

      const activeSlide = document.querySelector(".carousel-item.active");
      const activeVideo = activeSlide?.querySelector("video") || mainVideo;

      audioEnabled = !audioEnabled;

      if (activeVideo) {
        activeVideo.muted = !audioEnabled;
        if (audioEnabled) activeVideo.play().catch(() => {});
      }

      icon.classList.toggle("muted", !audioEnabled);
      audioButton.setAttribute("aria-pressed", audioEnabled ? "true" : "false");
    });
  }

  /* ============================================================
     INICIALIZACIÓN
  ============================================================ */

  adjustCarouselHeight();
  showSlide(0);
  startAutoSlide();
});

/* ============================================================
   Cargar texto dinámico desde archivo JSON local
============================================================ */

function loadDynamicTextJSON() {
  const container = document.getElementById("dynamic-text");

  fetch("data/info.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("No se pudo cargar el JSON");
      }
      return response.json();
    })
    .then(data => {
      container.innerHTML = `
        <h2 style="margin-bottom: 15px; font-weight:600; color:#00B050; font-size:1.4rem;">
          ${data.titulo}
        </h2>
        <p style="font-size:1rem; line-height:1.7;">
          ${data.descripcion}
        </p>
      `;
    })
    .catch(error => {
      console.error("Error cargando JSON:", error);
      container.innerHTML = "No se pudo cargar el contenido.";
    });
}

document.addEventListener("DOMContentLoaded", loadDynamicTextJSON);
