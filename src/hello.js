import * as React from './lib/react.js';

const h = React.createElement;

const Hello = () =>
  h(
    'div',
    { id: 'foo' },
    h('h1', null, 'Hello'),
    h('p', null, 'Hello from lib/react')
  );

export default Hello;
