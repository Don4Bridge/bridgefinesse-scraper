const express = require("express");
const scrapeBridgeTable = require("./scraper"); // assuming your scraping logic is in scraper.js

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/table", async (req, res) => {
  try {
    const html = await scrapeBridgeTable();
    res.send(html); // sends the scraped HTML table
  } catch (error) {
    console.error("Scraping failed:", error);
    res.status(500).send("Error scraping data");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});	

app.get('/fetch-table', async (req, res) => {
  try {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log('Navigating to BridgeFinesse...');
    await page.goto('https://bridgefinesse.com/some-tournament-url', {
      waitUntil: 'networkidle2',
    });

    console.log('Waiting for table...');
    await page.waitForSelector('table'); // Adjust selector if needed

    const tableHTML = await page.$eval('table', el => el.outerHTML);
    await browser.close();

    console.log('Table fetched successfully');
    res.send(tableHTML);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).send('Failed to fetch table');
  }
});