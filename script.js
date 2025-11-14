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

/* CARGAR TEXTO DINÁMICO CON DEBUG y FALLBACKS */
function loadDynamicText() {
  const targetEl = document.getElementById("dynamic-text");
  if (!targetEl) {
    console.error("[DynamicText] Elemento #dynamic-text no encontrado en DOM.");
    return;
  }

  // --- CONFIG: cambia aquí por tu ID de Drive o el enlace que prefieras ---
  const DRIVE_FILE_ID = "1OVh3Xvzl7SGYfJEUcX7I7UFgkzlBatiO"; // <-- reemplaza por tu ID real
  const driveUrl = `https://drive.google.com/uc?export=download&id=${DRIVE_FILE_ID}`;

  // opcional: si tu contenido está en Google Docs (document), usar:
  // const DOC_ID = "1OVh3Xvzl7SGYfJEUcX7I7UFgkzlBatiO";
  // const googleDocsTxtUrl = `https://docs.google.com/document/d/${DOC_ID}/export?format=txt`;

  // Puedes añadir un fallback público (github raw) si lo deseas:
  const githubRaw = ""; // deja vacío o pon https://raw.githubusercontent.com/usuario/repo/main/file.txt

  // Mensaje de carga
  targetEl.innerText = "Cargando contenido desde Google Drive...";

  // Helper para fetch con logging
  function tryFetch(url) {
    console.log(`[DynamicText] intentando fetch -> ${url}`);
    return fetch(url, { method: "GET", cache: "no-cache" })
      .then(async (res) => {
        console.log(`[DynamicText] respuesta: ${res.status} ${res.statusText} (${url})`);
        const contentType = res.headers.get("content-type") || "";
        console.log(`[DynamicText] content-type: ${contentType}`);

        // Si devuelve HTML es probable que sea la página de login/errors
        if (!res.ok) {
          throw new Error(`Status ${res.status}`);
        }

        // Si content-type indica html, probablemente Drive devolvió una página => error
        if (contentType.includes("text/html") && !contentType.includes("text/plain")) {
          const text = await res.text();
          console.warn("[DynamicText] Se obtuvo HTML en lugar de texto. Primeros 300 chars:\n", text.slice(0,300));
          throw new Error("La respuesta es HTML — probable problema de permisos o Drive intermedio.");
        }

        return res.text();
      });
  }

  // Try 1: Google Drive direct download
  tryFetch(driveUrl)
    .then(text => {
      targetEl.innerText = text;
      console.log("[DynamicText] Contenido cargado desde Google Drive OK.");
    })
    .catch(errDrive => {
      console.warn("[DynamicText] Error al cargar desde Drive:", errDrive);

      // Try 2: Google Docs export (descomenta y configura si usas Docs)
      // tryFetch(googleDocsTxtUrl)...
      // For now try GitHub raw if provided
      if (githubRaw) {
        tryFetch(githubRaw)
          .then(text => {
            targetEl.innerText = text;
            console.log("[DynamicText] Contenido cargado desde GitHub raw OK.");
          })
          .catch(errGH => {
            console.error("[DynamicText] Falló GitHub raw también:", errGH);
            targetEl.innerText = "No se pudo cargar el contenido (Drive/GH). Revisa permisos o consola.";
          });
      } else {
        targetEl.innerText = "No se pudo cargar el contenido desde Drive. Verifica: permisos del archivo (Anyone with link), ID correcto, y que la página se sirva por http(s). Revisa consola para más detalles.";
      }
    });
}

// Ejecutar cuando DOM listo
document.addEventListener("DOMContentLoaded", loadDynamicText);
