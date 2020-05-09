import * as staticServer from './lib/static-server.js';
import puppeteer from 'puppeteer';
import { getScreen, userEvent, wait } from './lib/puppeteer-testing-library.js';

(async () => {
  let server;
  let browser;
  let page;
  let screen;

  const beforeAll = async () => {
    const port = 8090;
    const root = process.argv[2];
    server = await staticServer.launch(port, root);
    browser = await puppeteer.launch();
    page = await browser.newPage();
    await page.goto(`http://localhost:${port}`, {
      waitUntil: 'networkidle2',
    });
    await page.screenshot({ path: 'output/index.test.png' });
    screen = await getScreen(page);
  };

  const afterAll = async () => {
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
    await test();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await afterAll();
  }
})();
