import puppeteer from "puppeteer";
import moment from "moment";

const currentMoment = moment().add(1, "days");
const endMoment = moment().add(2, "days");

const searchForFlights = async (startDate: any, endDate: any) => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const clearField = async (inputSelector: string) => {
    await page.$eval(inputSelector, (el) => (el.value = ""));
  };

  const enterText = async (selector: string, input: string) => {
    const element = await page.$(selector);
    await element!.press("Backspace");
    await element!.type(input);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);
  };

  const clickElementWithText = async (selector: string, text: string) => {
    let getElements;
    await page.waitForSelector(selector);
    getElements = await page.$$(selector);
    getElements.forEach(async (element) => {
      getElements = await element!.getProperty("innerText");
      if (getElements._remoteObject.value === text) {
        element.click();
      }
    });
  };

  const getFlightDetails = async () => {
    let details = await page.$$eval(
      'div[role=list] [data-collapsedlabel="Open more details."] [aria-label*="round trip total."]',
      (el) => el.map((x) => x.getAttribute("aria-label"))
    );
    return details;
  };

  await page.goto("https://www.google.com/travel/flights/search");
  await page.waitForSelector('[aria-placeholder="Where from?"] input');
  await clearField('[aria-placeholder="Where from?"] input');
  await enterText('[aria-placeholder="Where from?"] input', "LHR");
  await page.waitForSelector('[aria-placeholder="Where to?"]');
  await page.click('[aria-placeholder="Where to?"]');
  await clearField('[aria-placeholder="Where to?"]');
  await enterText('[aria-placeholder="Where to?"]', "MCO");
  await clearField('input[aria-label="Departure"]');
  await enterText('input[aria-label="Departure"]', startDate);
  await clearField('input[aria-label="Return"]');
  await enterText('input[aria-label="Return"]', endDate);
  await clickElementWithText("span", "Search");
  await page.waitForTimeout(5000);
  await clickElementWithText("button span", "Stops");
  await page.waitForTimeout(2000);
  await clickElementWithText("label", "Nonstop only");
  await page.waitForTimeout(5000);
  await getFlightDetails();
  await browser.close();
};

while (currentMoment.isBefore(endMoment, "day")) {
  const startDate = await currentMoment.format("ddd, MMM D");
  const endDate = await currentMoment.add(7, "days").format("ddd, MMM D");

  await searchForFlights(startDate, endDate);
  await currentMoment.add(1, "days");
}
