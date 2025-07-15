// Responsive Navbar Hamburger Logic
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.querySelector('.navbar__hamburger');
  const links = document.querySelector('.navbar__links');
  if (hamburger && links) {
    hamburger.addEventListener('click', function() {
      links.classList.toggle('open');
    });
    // Close menu on link click (mobile)
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        links.classList.remove('open');
      });
    });
    // Optional: close on outside click
    document.addEventListener('click', function(e) {
      if (!links.contains(e.target) && !hamburger.contains(e.target)) {
        links.classList.remove('open');
      }
    });
  }
});
