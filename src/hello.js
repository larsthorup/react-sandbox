import * as React from './lib/react.js';

const h = React.createElement;

const Hello = ({ name }) =>
  h(
    'div',
    { id: 'foo' },
    h('h1', null, 'Hello'),
    h('p', null, `Hello from ${name}`)
  );

export default Hello;
