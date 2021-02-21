require("dotenv").config();
const chromium = require("chrome-aws-lambda");

async function handler(event, context, callback) {
  let result = "No result";
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
    await page.goto(process.env.CHASE_URL, { waitUntil: 'networkidle2' });
    await page.waitForSelector(".plus-icon");
    const offers = await page.evaluate(() => {

      const plusIcons = [...document.querySelector(".cdlx-offerCards").getElementsByClassName("plus-icon")]
        .filter(el => (el.style.display !== "none" && el.parentElement.style.display !== "none"));

      const offerCards = plusIcons
        .map(el => el.closest(".cdlx-rs-offerCard"))
        .filter(el => el);

      const offerNamesList = offerCards
        .map(el => el.querySelector("img").getAttribute("alt"));

      offerCards.forEach(el => el.click());

      return offerNamesList;
    });
    const allOffersString = (offers.length > 0) ? ` | ${offers.join(", ")}` : "";
    result = `Offers clicked: ${offers.length}${allOffersString}`;
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