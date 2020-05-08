import * as ReactDOM from './lib/react-dom.js';
import Hello from './hello.js';

const element = Hello();

const container = document.getElementById('root');

ReactDOM.render(element, container);
