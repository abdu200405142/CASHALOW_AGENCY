// Multi-language translation system
const translations = {
  ar: {
    title: "وكالتك الاستثمارية",
    pricing: "الأسعار",
    license: "تفعيل الترخيص",
    buyCoins: "شراء العملات",
    contact: "اتصل بنا",
    getStarted: "الباقات",
    home: "الرئيسية",
    // ... أضف بقية النصوص هنا
  },
  en: {
    title: "Your Investment Agency",
    pricing: "Pricing",
    license: "License Activation",
    buyCoins: "Buy Coins",
    contact: "Contact Us",
    getStarted: "Packages",
    home: "Home",
    // ... add more keys here
  },
  fr: {
    title: "Votre agence d'investissement",
    pricing: "Tarifs",
    license: "Activation de licence",
    buyCoins: "Acheter des pièces",
    contact: "Contactez-nous",
    getStarted: "Forfaits",
    home: "Accueil",
    // ... ajoutez d'autres clés ici
  }
};

function setLanguage(lang) {
  if (!translations[lang]) return;
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-translate]').forEach(el => {
    const key = el.getAttribute('data-translate');
    if (translations[lang][key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translations[lang][key];
      } else {
        el.textContent = translations[lang][key];
      }
    }
  });
}

// Auto-detect or default
const savedLang = localStorage.getItem('lang') || 'ar';
setLanguage(savedLang);

// تفعيل أزرار اللغة في القائمة المنسدلة أو الأزرار
// مثال: أزرار لها class="language-button" و data-lang="ar|en|fr"
document.addEventListener('DOMContentLoaded', function() {
  const langBtns = document.querySelectorAll('.language-button');
  langBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const lang = btn.getAttribute('data-lang');
      localStorage.setItem('lang', lang);
      setLanguage(lang);
      langBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  // تفعيل الزر الصحيح عند التحميل
  const savedLang = localStorage.getItem('lang') || 'ar';
  langBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === savedLang));
});

