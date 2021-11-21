const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
dotenv.config({
  path: "../.env",
});

// ******************************** QUERYS ********************************
const HOVER_LOGIN = '//*[@id="nav-link-accountList"]/span';

// **************************** START APP *********************************
const app = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://www.amazon.com.br/");

  let goToLink;
  await page
    .evaluate(() => {
      const link = document.querySelector("#nav-flyout-ya-signin > a");
      return link.href;
    })
    .then((link) => {
      goToLink = link;
    });
  await page.goto(goToLink);

  await page.waitForSelector("#ap_email");
  await page.type("#ap_email", process.env.USERNAME, {
    delay: 60,
  });
  await page.keyboard.press("Enter");

  await page.waitForSelector("#ap_password");
  await page.type("#ap_password", process.env.PASSWORD, {
    delay: 60,
  });
  await page.keyboard.press("Enter");

};
app();
