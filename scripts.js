let index = 0;
const items = document.querySelectorAll('.carousel-item');
const total = items.length;

function showSlide(i) {
  items.forEach((item, idx) => {
    item.classList.toggle('active', idx === i);
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

// Cambio automático cada 6 segundos
setInterval(() => {
  index = (index + 1) % total;
  showSlide(index);
}, 6000);
