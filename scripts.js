/* =============== CARRUSEL =============== */
let index = 0;
const items = document.querySelectorAll('.carousel-item');
const total = items.length;

function showSlide(i) {
  items.forEach((item, idx) => {
    item.classList.toggle('active', idx === i);
  });

  // Al cambiar de slide -> silenciar el video y resetear icono
  const video = document.getElementById('mainVideo');
  const audioButton = document.querySelector('#toggle-audio');
  const icon = document.querySelector('#icon-sound');

  if (video && audioButton && icon) {
    video.muted = true;
    // marcaremos aria y clase
    audioButton.setAttribute('aria-pressed', 'false');
    icon.classList.add('muted');
  }

  // Si el slide que aparece no contiene video, opcional: pause all videos to save CPU
  items.forEach((it, idx) => {
    const vid = it.querySelector('video');
    if (vid) {
      if (idx === i) {
        // el video del slide activo sigue reproduciéndose pero silenciado (si el usuario no activó)
        vid.currentTime = vid.currentTime; // no-op, solo claridad
      } else {
        // pausar videos de slides no visibles
        try { vid.pause(); } catch(e) {}
      }
    }
  });
}

document.querySelector('.next').addEventListener('click', () => {
  index = (index + 1) % total;
  showSlide(index);
});

document.querySelector('.prev').addEventListener('click', () => {
  index = (index - 1 + total) % total;
  showSlide(index);
});

// Cambio automático
setInterval(() => {
  index = (index + 1) % total;
  showSlide(index);
}, 25000);


/* =============== CONTROL DE AUDIO (SVG) =============== */
document.addEventListener('DOMContentLoaded', () => {
  const video = document.getElementById('mainVideo');      // tu video principal
  const audioButton = document.getElementById('toggle-audio');
  const icon = document.getElementById('icon-sound');

  if (!audioButton || !icon) {
    if (!audioButton) console.error("No se encontró #toggle-audio");
    if (!icon) console.error("No se encontró #icon-sound");
    return;
  }

  // Estado actual (inicia muteado por autoplay policy)
  let audioEnabled = false;
  // Aseguramos el estado inicial del icono
  icon.classList.add('muted');
  audioButton.setAttribute('aria-pressed', 'false');

  audioButton.addEventListener('click', (e) => {
    e.preventDefault();

    // Si no hay video (ej. slide actual es una imagen) intentamos buscar video en el slide activo
    let activeVideo = video;
    if (!activeVideo) {
      const activeSlide = document.querySelector('.carousel-item.active');
      activeVideo = activeSlide ? activeSlide.querySelector('video') : null;
    }

    // Toggle estado
    audioEnabled = !audioEnabled;

    if (activeVideo) {
      activeVideo.muted = !audioEnabled;

      // Si activamos audio, intentamos play() para cumplir con navegadores que requieren interacción
      if (audioEnabled) {
        const playPromise = activeVideo.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(err => {
            // Silencioso si no se permite reproducción por política del navegador
            console.warn('No se pudo reproducir con audio automáticamente:', err);
          });
        }
      }
    }

    // Actualizar icono SVG y atributos accesibles
    if (audioEnabled) {
      icon.classList.remove('muted');
      audioButton.setAttribute('aria-pressed', 'true');
    } else {
      icon.classList.add('muted');
      audioButton.setAttribute('aria-pressed', 'false');
    }
  });
});
