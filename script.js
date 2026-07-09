    // Ini Tag Buat Ambil Dari Html Untuk Ambil Elemen
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');

    // Ubah navbar jadi lebih solid saat discroll
   // window.addEventListener('scroll', () => {
       // navbar.classList.toggle('scrolled', window.scrollY > 40);
    //})//;//

    // Buka/tutup menu mobile Hamburger
    navToggle.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        navToggle.classList.toggle('active', isOpen);
        navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Tutup menu saat salah satu link diklik (mobile) Sama Untuk Hamburger Di SmartPhone
    navMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            navToggle.classList.remove('active');
            navToggle.setAttribute('aria-expanded', false);
        });
    });





// Untuk Fungsi Auto Whatsapp dan Automasi Messege
document.addEventListener("DOMContentLoaded", function () {
    // Ganti dengan nomor WhatsApp usahamu
    const noWhatsapp = "6282359352541"; 

    const serviceItems = document.querySelectorAll(".service-item");

    serviceItems.forEach(item => {
        item.addEventListener("click", function () {
            const namaJasa = item.querySelector(".service-name").innerText.trim();
            
            // Tanda kurung kurawal {} sudah dihapus di sini
            const pesan = `halo saya mau order ${namaJasa} masih bisa ya disini ??`;
            
            const pesanEncoded = encodeURIComponent(pesan);
            const urlWhatsapp = `https://api.whatsapp.com/send?phone=${noWhatsapp}&text=${pesanEncoded}`;
            
            window.open(urlWhatsapp, '_blank');
        });
    });
});