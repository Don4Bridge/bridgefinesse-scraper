const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/table', async (req, res) => {
  try {
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateString = `${yy}${mm}${dd}`;

    const urls = [
      `https://cloud.bridgefinesse.com/C263830/LockDown/${dateString}AFTOpenFinalTable.html`,
      `https://cloud.bridgefinesse.com/C263830/LockDown/${dateString}AFTLimitedFinalTable.html`
    ];

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );

    let combinedHTML = '';

    for (const url of urls) {
      const response = await page.goto(url, { waitUntil: 'networkidle2' });
      if (response.status() === 404) {
        combinedHTML += `<p>Table not found for ${url}</p>`;
      } else {
        const html = await page.content();
        combinedHTML += `<hr><hr><hr>${html}`;
      }
    }

    await browser.close();
    res.send(combinedHTML); // ✅ This was missing in your original code

  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).send('Failed to fetch table');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
