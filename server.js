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