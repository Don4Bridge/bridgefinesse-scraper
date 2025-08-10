

const express = require('express');
const app = express();
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get('/table', async (req, res) => {
  try {
    // Get today's date in yymmdd format
    const today = new Date();
    const yy = String(today.getFullYear()).slice(2);
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const dateString = `${yy}${mm}${dd}`;

    const url = `https://cloud.bridgefinesse.com/c263830/lockdown/${dateString}aftopenfinaltable.html`;

    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36'
    );
    const response = await page.goto(url, { waitUntil: 'networkidle2' });

    if (response.status() === 404) {
      res.status(404).send(`Table not found for ${dateString}`);
    } else {
      const tableHTML = await page.content();
      res.setHeader('Content-Type', 'text/html');
      res.send(tableHTML);
    }

    await browser.close();
  } catch (error) {
    console.error('Scraping failed:', error);
    res.status(500).send('Failed to fetch table');
  }
});
