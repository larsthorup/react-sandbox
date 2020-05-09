import * as assert from 'assert';
import * as staticServer from './lib/static-server.js';
import puppeteer from 'puppeteer';

(async () => {
  let server;
  let browser;
  let page;

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
  };

  const afterAll = async () => {
    if (browser) await browser.close();
    if (server) await staticServer.close(server);
  };

  const test = async () => {
    assert.equal(
      await page.evaluate(
        () => document.querySelector('div#hello p').textContent
      ),
      'Hello from lib/react'
    );
    await page.type('div#hello input', 'Lars');
    await page.click('div#hello button');
    await page.waitFor(
      () =>
        document.querySelector('div#hello p').textContent ===
        'Hello Lars from lib/react'
    );
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
