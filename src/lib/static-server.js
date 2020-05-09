import httpServer from 'http-server';

export const launch = async (port, root) => {
  const server = httpServer.createServer({ root });
  await new Promise((resolve) => server.listen(port, 'localhost', resolve));
  return server;
};

export const close = async (server) => {
  await new Promise((resolve) => server.close(resolve));
};
