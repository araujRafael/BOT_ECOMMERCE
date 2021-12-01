const puppeteer = require("puppeteer");
const dotenv = require("dotenv");
dotenv.config();

//***************************** QUERYS n PATHS ****************************
const MOZILA_USER_AGENT = process.env.USER_AGENT
const USERNAME = process.env.AMAZON_USERNAME
const PASSWORD = process.env.AMAZON_PASSWORD
const TARGET_SEARCH = process.env.AMAZON_TARGET_SEARCH
const ALL_PRODUCTS_ARRAY = '[data-component-type="s-search-result"]'
// **************************** START APP *********************************
const app = async () => {
  const browser = await puppeteer.launch({
    headless: true,
  });
  const page = await browser.newPage();
  await page.setUserAgent(MOZILA_USER_AGENT)
  await page.goto("https://www.amazon.com.br/");

  console.log('⌨️ Enter login page...');
  let goToLink;
  await page
    .evaluate(() => {
      const link = document.querySelector("#nav-flyout-ya-signin > a");
      return link.href;
    })
    .then((link) => {
      goToLink = link;
      console.log('🟢 Login page => OK');
    });
  await page.goto(goToLink);
  

  console.log('⌨️ Enter username...');
  await page.waitForSelector("#ap_email");
  await page.type("#ap_email", USERNAME, {
    delay: 60,
  }).then(async()=>{
    await page.keyboard.press("Enter");
    console.log('🟢 Username => OK');
  })

  console.log('⌨️ Enter password...');
  await page.waitForSelector("#ap_password");
  await page.type("#ap_password", PASSWORD, {
    delay: 60,
  }).then(async()=>{
    await page.keyboard.press("Enter");
    console.log('🟢 Password => OK');
  })
  
  console.log('⌨️ Search target products...');
  await page.waitForSelector("#twotabsearchtextbox");
  await page.type("#twotabsearchtextbox", TARGET_SEARCH, {
    delay: 60,
  }).then(async()=>{
    await page.keyboard.press("Enter");
    console.log('🟢 Target products => OK');
  })
  console.log('⌨️ Performing scraping of products...');
  await page.waitForNavigation()
  await page.waitForSelector(ALL_PRODUCTS_ARRAY)
  let OBJ_PRODUCTS;
  await page.evaluate(()=> {
    // Querys 
    const _ARRAY = '[data-component-type="s-search-result"]'
    // Selector =>
    const componentsArr = document.querySelectorAll(_ARRAY)
    const objArr_products=Array.from(componentsArr).map( components => {
      // Querys 
      const QUERY_STARS = 'span[aria-label]'
      const QUERY_PRICE = '.a-price-whole'
      const QUERY_PRICE_DECIMAL = '.a-price-fraction'
      // Keys =>
        // title
        const title = components.querySelector('h2').textContent
        // stars
        const CAT_STARS = components.querySelector(QUERY_STARS)
        .textContent
        .replace(/de 5 estrelas/gi,'').replace(',','.').trim()
        const stars = !Number(CAT_STARS) ? 0 : Number(CAT_STARS)
        // price
        const CAT_PRICE = components.querySelector(QUERY_PRICE)
        .textContent
        .replace(',','.')
        const CAT_PRICE_DECIMAL = components.querySelector(QUERY_PRICE_DECIMAL)
        .textContent
        const price = Number(CAT_PRICE.concat(CAT_PRICE_DECIMAL))
      return {
        title,
        stars,
        price
      }
    })
    return objArr_products
  }).then(data => OBJ_PRODUCTS=data,)
  const objLeng= Object.keys(OBJ_PRODUCTS).length
  console.log(OBJ_PRODUCTS,`✔️ Finish => ${objLeng} Products scraped`);
  // a pagina tem um total de 60 itens mas a raspagem está vindo menos
  // await browser.close()
};
app();
