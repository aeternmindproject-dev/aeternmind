/* =========================================================
   script.js — Aeternmind (Optimized, Hybrid Smart-Fit, Robust)
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  /* ------------------------
     Elementos principales
  -------------------------*/
  const items = Array.from(document.querySelectorAll(".carousel-item"));
  const total = items.length;
  let index = 0;
  let autoSlideInterval = null;
  const AUTO_DELAY = 25000;

  const mainVideo = document.getElementById("mainVideo");
  const audioButton = document.getElementById("toggle-audio");
  const icon = document.getElementById("icon-sound");
  const nextBtn = document.querySelector(".next");
  const prevBtn = document.querySelector(".prev");

  /* ------------------------
     UTIL: safe query
  -------------------------*/
  function $qs(sel) { return document.querySelector(sel); }

  /* ======================================================
     MODO INTELIGENTE HÍBRIDO (COVER / CONTAIN) - Aeternmind
     ======================================================*/
  function applySmartVideoFit() {
    const active = document.querySelector(".carousel-item.active");
    if (!active) return;

    const media = active.querySelector("video, img");
    if (!media) return;

    const screenRatio = window.innerWidth / window.innerHeight;
    let mediaRatio = null;

    if (media instanceof HTMLVideoElement && media.videoWidth && media.videoHeight) {
      mediaRatio = media.videoWidth / media.videoHeight;
    } else if (media.naturalWidth && media.naturalHeight) {
      mediaRatio = media.naturalWidth / media.naturalHeight;
    }

    if (!mediaRatio) return;

    media.classList.remove("smart-cover", "smart-contain");

    const difference = Math.abs(mediaRatio - screenRatio);

    if (difference <= 0.25) {
      media.classList.add("smart-cover");
    } else if (mediaRatio > screenRatio) {
      media.classList.add("smart-contain");
    } else {
      media.classList.add("smart-cover");
    }
  }

  function scheduleSmartFit(delay = 160) {
    clearTimeout(window.__smartFitTimer);
    window.__smartFitTimer = setTimeout(applySmartVideoFit, delay);
  }

  window.addEventListener("resize", () => scheduleSmartFit(160));
  window.addEventListener("orientationchange", () => scheduleSmartFit(160));

  document.querySelectorAll(".carousel-item video").forEach(v => {
    v.addEventListener("loadedmetadata", applySmartVideoFit);
  });

  /* ======================================================
     AJUSTE ALTO DEL CARRUSEL
     ======================================================*/
  function adjustCarouselHeight() {
    const header = document.querySelector("header");
    const carousel = document.querySelector(".carousel");
    if (!carousel) return;
    const headerH = header ? header.offsetHeight : 0;
    carousel.style.height = `${window.innerHeight - headerH}px`;
    carousel.style.marginTop = `${headerH}px`;
  }

  window.addEventListener("load", adjustCarouselHeight);
  window.addEventListener("resize", () => {
    clearTimeout(window.__resizeTimer);
    window.__resizeTimer = setTimeout(adjustCarouselHeight, 120);
  });

  /* ======================================================
     CONTROL DE SLIDES
     ======================================================*/
  function pauseInactiveVideos(curIndex) {
    items.forEach((it, i) => {
      const vid = it.querySelector("video");
      if (vid) {
        if (i === curIndex) vid.play().catch(()=>{});
        else vid.pause();
      }
    });
  }

  function resetAudioState() {
    if (!mainVideo || !audioButton || !icon) return;
    mainVideo.muted = true;
    audioButton.setAttribute("aria-pressed", "false");
    icon.classList.add("muted");
  }

  function showSlide(i) {
    index = (i + total) % total;
    items.forEach((it, idx) => it.classList.toggle("active", idx === index));
    resetAudioState();
    pauseInactiveVideos(index);
    scheduleSmartFit(180);
  }

  /* CONTROLES */
  if (nextBtn) nextBtn.addEventListener("click", () => { showSlide(index + 1); resetAutoSlide(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { showSlide(index - 1); resetAutoSlide(); });

  /* AUTO SLIDE */
  let userInteracting = false;

  function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
      if (!userInteracting) showSlide(index + 1);
    }, AUTO_DELAY);
  }

  function resetAutoSlide() {
    userInteracting = true;
    clearInterval(autoSlideInterval);
    clearTimeout(window.__userInteractTimer);
    window.__userInteractTimer = setTimeout(() => {
      userInteracting = false;
      startAutoSlide();
    }, 5000);
  }

  ["mousemove","touchstart","touchmove","keydown"].forEach(ev => {
    window.addEventListener(ev, () => {
      userInteracting = true;
      clearTimeout(window.__userInteractTimer);
      window.__userInteractTimer = setTimeout(()=>{ userInteracting=false; }, 4000);
    });
  });

  /* AUDIO CONTROL */
  if (audioButton && icon) {
    let audioEnabled = false;
    icon.classList.add("muted");
    audioButton.setAttribute("aria-pressed", "false");

    audioButton.addEventListener("click", (e) => {
      e.preventDefault();
      const activeSlide = document.querySelector(".carousel-item.active");
      const activeVideo = activeSlide ? activeSlide.querySelector("video") : mainVideo;

      audioEnabled = !audioEnabled;

      if (activeVideo) {
        activeVideo.muted = !audioEnabled;
        if (audioEnabled) activeVideo.play().catch(()=>{});
      }

      icon.classList.toggle("muted", !audioEnabled);
      audioButton.setAttribute("aria-pressed", audioEnabled ? "true" : "false");
    });
  }

  /* DYNAMIC TEXT */
  function loadDynamicTextJSON() {
    const container = document.getElementById("dynamic-text");
    if (!container) return;

    fetch("info.json", {cache: "no-cache"})
      .then(r => {
        if (!r.ok) throw new Error(`Status ${r.status}`);
        return r.json();
      })
      .then(data => {
container.innerHTML = `
  <h2 class="dynamic-title">
    ${data.titulo || "Aeternmind Labs"}
  </h2>
  <p class="dynamic-description">
    ${data.descripcion || "Aeternmind Labs integra tecnología, educación y bienestar."}
  </p>
`;
      })
      .catch(err => {
        console.error("Error cargando JSON:", err);
        container.innerHTML = "No se pudo cargar el contenido.";
      });
  }

  adjustCarouselHeight();
  showSlide(0);
  startAutoSlide();
  loadDynamicTextJSON();
  scheduleSmartFit(240);
});



