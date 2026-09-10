const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('BROWSER ERROR:', msg.text());
    } else {
      console.log('BROWSER LOG:', msg.text());
    }
  });

  page.on('pageerror', error => {
    console.log('PAGE ERROR:', error.message);
  });

  page.on('requestfailed', request => {
    console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle2', timeout: 10000 });
  } catch (err) {
    try {
      console.log("Trying 5174 instead...");
      await page.goto('http://localhost:5174', { waitUntil: 'networkidle2', timeout: 10000 });
    } catch (err2) {
      console.error("Navigation failed:", err2.message);
    }
  }

  await browser.close();
})();
