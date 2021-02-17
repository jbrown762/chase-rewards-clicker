require("dotenv").config();
const chromium = require('chrome-aws-lambda');

async function handler(event, context, callback) {
  let result = 'No result';
  let browser;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();
    await page.goto(process.env.CHASE_URL);
    await page.waitForSelector(".plus-icon");
    const offersClicked = await page.evaluate(() => {
      const offerImgElements = [...document.getElementsByClassName("plus-icon")]
        .filter(el => el.style.display !== "none")
        .filter(el => el.parentElement.previousElementSibling?.tagName === "IMG")
        .map(el => el.parentElement.previousElementSibling);

      offerImgElements.forEach(el => el.click());

      return offerImgElements.map(img => img.getAttribute("alt"));
    });
    const allOffersString = (offersClicked.length > 0) ? ` | ${offersClicked.join(", ")}` : "";
    result = `Offers clicked: ${offersClicked.length}${allOffersString}`;
    console.info(result);
  } catch (error) {
    return callback(error);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
  return callback(null, result);
}

module.exports.handler = handler;