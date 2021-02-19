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
    await page.goto(process.env.CHASE_URL);
    await page.waitForSelector(".plus-icon");
    const offers = await page.evaluate(() => {
      const plusIcons = [...document.getElementsByClassName("plus-icon")]
        .filter(el => (el.style.display !== "none" && el.parentElement.style.display !== "none"));
      const imgElements = plusIcons.map(el => el.parentElement.parentElement.querySelector("img"))
        .filter(img => img);

        plusIcons.forEach(el => el.click());

      return imgElements.map(img => img.getAttribute("alt"));
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