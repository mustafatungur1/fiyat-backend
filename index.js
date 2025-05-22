const express = require('express');
const { scrapeAkakce } = require('./scraper');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));

// Ana sayfa: Form ve sonuçlar
app.get('/', (req, res) => {
  res.send(`
    <h2>Akakçe Scraper</h2>
    <form method="POST" action="/">
      <input type="text" name="url" placeholder="Akakçe ürün linki" style="width:400px" required />
      <button type="submit">Sorgula</button>
    </form>
  `);
});

app.post('/', async (req, res) => {
  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.send('<p style="color:red">Lütfen bir Akakçe ürün detay sayfası linki girin.</p>');
  }
  try {
    const data = await scrapeAkakce(url, false);
    res.send(`
      <h2>Akakçe Scraper</h2>
      <form method="POST" action="/">
        <input type="text" name="url" value="${url}" style="width:400px" required />
        <button type="submit">Sorgula</button>
      </form>
      <pre style="background:#eee;padding:1em">${JSON.stringify(data, null, 2)}</pre>
      <a href="/">Yeni sorgu</a>
    `);
  } catch (err) {
    res.send(`<p style="color:red">Scraping sırasında hata oluştu: ${err.message}</p><a href="/">Geri dön</a>`);
  }
});

app.listen(PORT, () => {
  console.log(`Server çalışıyor: http://localhost:${PORT}`);
}); 