import * as staticServer from './lib/static-server.js';
import puppeteer from 'puppeteer';
import { getScreen, userEvent, wait } from './lib/puppeteer-testing-library.js';
import pti from 'puppeteer-to-istanbul';

(async () => {
  const port = 8090;
  let server;
  let browser;
  let page;
  let screen;

  const beforeAll = async () => {
    const root = process.argv[2];
    server = await staticServer.launch(port, root);

    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.coverage.startJSCoverage();
  };

  const beforeEach = async (mode) => {
    console.log(`Running ${mode} test...`);
    await page.goto(`http://localhost:${port}?${mode}`, {
      waitUntil: 'networkidle2',
    });
    await page.screenshot({ path: `output/index-${mode}.test.png` });
    screen = await getScreen(page);
  };

  const afterAll = async () => {
    pti.write(await page.coverage.stopJSCoverage());
    if (browser) await browser.close();

    if (server) await staticServer.close(server);
  };

  const test = async () => {
    await wait(() => screen.getByText('Hello from lib/react'));
    await userEvent.type(screen.getByLabelText('Enter name:'), 'Lars');
    await userEvent.click(screen.getByText('Submit'));
    await wait(() => screen.getByText('Hello Lars from lib/react'));
  };

  try {
    await beforeAll();
    await beforeEach('render');
    await test();
    await beforeEach('hydrate');
    await test();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await afterAll();
  }
})();
