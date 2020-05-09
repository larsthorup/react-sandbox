import * as React from './lib/react.js';
import * as ReactDOM from './lib/react-dom.js';
import App from './app.js';

const h = React.createElement;

ReactDOM.render(h(App), document.getElementById('root'));
