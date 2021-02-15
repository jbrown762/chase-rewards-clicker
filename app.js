const chromium = require('chrome-aws-lambda');

// public url; no need for env variable
const url = "https://chaseoffers.chase.com/v1/index.html?ostb=8hEVNHmGEAuvqTiC_9fVUKgiVRinq3pfBK0qNl9riIM&activate=false&mi_u=273185532&mi_ostb_2=&mi_ostb_3=&mi_id_1=b15bf866d1f2376c51de0af256682c30cd607447ad581bdac56299a6823b8549&mi_id_2=&mi_id_3=";

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
    await page.goto(url);
    await page.waitForSelector(".plus-icon");
    const offersClicked = await page.evaluate(() => {
      const offerImgElements = [...document.getElementsByClassName("plus-icon")]
        .filter(el => el.style.display !== "none")
        .filter(el => el.parentElement.previousElementSibling?.tagName === "IMG")
        .map(el => el.parentElement.previousElementSibling);

      offerImgElements.forEach(el => el.click());

      return offerImgElements.map(img => img.getAttribute("alt"));
    });
    const allOffersString = (offersClicked.length > 0) ? ` | ${offersClicked.join(" ,")}` : "";
    result = `Offers clicked: ${offersClicked.length}${allOffersString}`;
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
