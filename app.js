    const slider = document.querySelector('.event-slider');
    const slides = document.querySelectorAll('.event-slide');
    let currentIndex = 0;
    const totalSlides = slides.length; // Menghitung total slide dinamis (misal: 5)

    function nextSlide() {
      // Menaikkan indeks, lalu di-reset ke 0 jika sudah mencapai totalSlides
      currentIndex = (currentIndex + 1) % totalSlides;

      // Menggeser slider
      slider.style.transform = `translateX(-${currentIndex * 20}%)`;
    }

    // Jalankan interval setiap 3 detik
    const slideInterval = setInterval(nextSlide, 3000);

    // Event listener untuk klik pada slide
    slides.forEach(slide => {
      slide.addEventListener('click', function () {
        const url = this.getAttribute('data-url');
        if (url) {
          window.location.href = url;
        }
      });
    });

    // OPSIONAL: Jika ingin halaman otomatis scroll ke paling bawah sendiri begitu selesai dimuat
    // window.addEventListener('DOMContentLoaded', () => {
    //   window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    // });
