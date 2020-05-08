import * as React from './lib/react.js';
import * as ReactDOM from './lib/react-dom.js';

const h = React.createElement;

const element = h(
  'div',
  { id: 'foo' },
  h('h1', null, 'Hello'),
  h('p', null, 'Hello from lib/react')
);

const container = document.getElementById('root');

ReactDOM.render(element, container);
