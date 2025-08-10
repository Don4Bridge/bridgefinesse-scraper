const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/fetch-table', async (req, res) => {
  try {
    const date = new Date(Date.now() - 86400000);
    const formatted = date.toISOString().slice(2,10).replace(/-/g, '');
    const url = `https://cloud.bridgefinesse.com/C263830/LockDown/${formatted}AFTOpenFinalTable.html`;

    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const tableHTML = await page.$eval('table', el => el.outerHTML);
    await browser.close();

    res.setHeader('Content-Type', 'text/html');
    res.send(tableHTML);
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to fetch table');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});