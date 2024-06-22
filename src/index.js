import { h } from './lib/react.js';
import * as ReactDOM from './lib/react-dom.js';
import App from './app.js';

switch (window.location.search) {
  case '?render':
    ReactDOM.render(h(App), document.getElementById('root'));
    break;
  case '?hydrate':
    // Simulate server-side rendering + hydration
    const html = [
      '<div id="hello">',
      '<h1>Greeting</h1>',
      '<p>Hello from lib/react</p>',
      '<label for="name">Enter name:</label>',
      '<input id="name">',
      '<button>Submit</button>',
      '</div>',
    ].join('');
    document.getElementById('root').innerHTML = html;
    ReactDOM.hydrate(h(App), document.getElementById('root'));
    break;
}
