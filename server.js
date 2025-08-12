const express = require('express');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 3000;

function getFormattedDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() - offsetDays);
  const year = String(date.getFullYear()).slice(2);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

app.get('/debug', async (req, res) => {
  const puppeteer = require('puppeteer-extra');
  const StealthPlugin = require('puppeteer-extra-plugin-stealth');
  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://your-target-url.com', { waitUntil: 'networkidle2' });

  const html = await page.content();
  await browser.close();

  res.send(html); // View this in your browser
});

async function fetchTableHTML(url) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-blink-features=AutomationControlled'
    ]
  });

  const page = await browser.newPage();

  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115 Safari/537.36'
  );

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9'
  });

  await page.setViewport({ width: 1280, height: 800 });

  const response = await page.goto(url, {
    waitUntil: 'domcontentloaded',
    timeout: 15000
  });

  const status = response.status();
  console.log(`📄 Fetched ${url} with status: ${status}`);

  if (status !== 200) {
    await browser.close();
    throw new Error(`Page returned status ${status}`);
  }

  await page.waitForSelector('table', { timeout: 5000 }).catch(() => {
    console.log('⚠️ Table not found after wait');
  });

  const table = await page.$('table');
  if (!table) {
    const content = await page.content();
    console.log('⚠️ No <table> found. Dumping partial page content:');
    console.log(content.slice(0, 1000));
    await browser.close();
    throw new Error('No <table> element found on page');
  }

  const tableHTML = await page.evaluate(el => el.outerHTML, table);
  await browser.close();
  return tableHTML;
}

function stripFirstHeaderRow(tableHTML) {
  const $ = cheerio.load(tableHTML);
  $('table tr').first().remove();
  return $.html('table');
}

app.get('/table', async (req, res) => {
  console.log('🔍 /table route hit');

  const formattedDate = getFormattedDate();
  const url1 = `https://cloud.bridgefinesse.com/C263830/LockDown/${formattedDate}AFTOpenFinalTable.html`;
  const url2 = `https://cloud.bridgefinesse.com/C263830/LockDown/${formattedDate}AFTLimitedFinalTable.html`;

  try {
    const table1 = await fetchTableHTML(url1);
    const spacer = '<br><br><br>';
    const table2Raw = await fetchTableHTML(url2);
    const table2Cleaned = stripFirstHeaderRow(table2Raw);

    const combinedHTML = `${table1}${spacer}${table2Cleaned}`;
    res.setHeader('Content-Type', 'text/html');
    res.send(combinedHTML);
  } catch (error) {
    console.error('❌ Error fetching tables:', error.message);
    res.status(500).send('Failed to fetch tables');
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
