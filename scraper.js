const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Akakçe ürün sayfasından ilk 5 satıcıyı ve fiyatlarını çeker.
 * @param {string} source - HTML dosya yolu veya Akakçe ürün sayfası URL'si
 * @param {boolean} isFile - true ise dosya, false ise URL
 * @returns {Promise<Array<{seller: string, price: string}>>}
 */
async function scrapeAkakce(source, isFile = false) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
  });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36');

  if (isFile) {
    const html = fs.readFileSync(source, 'utf8');
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
  } else {
    await page.goto(source, { waitUntil: 'domcontentloaded' });
    await new Promise(resolve => setTimeout(resolve, 10000)); // 10 saniye bekle
  }

  // Debug için screenshot al
  const screenshot = await page.screenshot({ encoding: 'base64', fullPage: true });
  console.log('---AKAKCE DEBUG SCREENSHOT BASE64---');
  console.log(screenshot);
  console.log('---END SCREENSHOT---');

  // Satıcılar ve fiyatlar (ürün detay sayfası için)
  const results = await page.evaluate(() => {
    const saticiList = Array.from(document.querySelectorAll('#PL > li'));
    if (saticiList.length === 0) {
      console.log('UYARI: #PL > li bulunamadı, sayfa yapısı değişmiş olabilir veya içerik yüklenmedi.');
    }
    const satıcılar = saticiList.map((li, idx) => {
      // Fiyat
      const fiyat = li.querySelector('.pt_v8')?.innerText.replace(/\s+/g, ' ').trim() || '';
      // Kargo
      const kargo = li.querySelector('.uk_v8, .n_uk_v8')?.innerText.replace(/\s+/g, ' ').trim() || '';
      // Satıcı adı
      let satıcı = '';
      const satıcıB = li.querySelector('.v_v8 > b');
      if (satıcıB) {
        satıcı = satıcıB.innerText.trim();
      } else {
        // Alternatif: img alt veya b.n_url
        const satıcıImg = li.querySelector('.v_v8 > img[alt]');
        if (satıcıImg) satıcı = satıcıImg.getAttribute('alt').trim();
        const satıcıBUrl = li.querySelector('.v_v8 > b.n_url');
        if (satıcıBUrl) satıcı = satıcıBUrl.innerText.trim();
        // Alternatif: sadece b.n_url (ör: Trendyol.com)
        const bUrl = li.querySelector('b.n_url');
        if (bUrl) satıcı = bUrl.innerText.trim();
      }
      // Ürün adı
      const urun = li.querySelector('.pn_v8')?.innerText.trim() || '';
      return { sira: idx + 1, satıcı, fiyat, kargo, urun };
    });
    // Mukaspazarlama.com'un sırası (ilk 10'da ise)
    const ilk10 = satıcılar.slice(0, 10);
    const mspIndex = ilk10.findIndex(s => s.satıcı.toLowerCase().includes('mukaspazarlama.com'));
    return {
      ilk10,
      mukaspazarlama_sira: mspIndex >= 0 ? mspIndex + 1 : null
    };
  });

  await browser.close();
  return results;
}

// Test fonksiyonu (örnek dosya ile)
if (require.main === module) {
  (async () => {
    const data = await scrapeAkakce('../enjoy.html', true);
    console.log(data);
  })();
}

module.exports = { scrapeAkakce }; 