import ptl from 'pptr-testing-library';

export const getScreen = async (page) => {
  const document = await ptl.getDocument(page);
  const screen = ptl.getQueriesForElement(document);
  return screen;
};

export const wait = ptl.wait;

export const userEvent = {
  type: async (elementPromise, text) => {
    const element = await elementPromise;
    await element.type(text);
  },
  click: async (elementPromise) => {
    const element = await elementPromise;
    await element.click();
  },
};
