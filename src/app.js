import * as React from './lib/react.js';
import Hello from './hello.js';

const h = React.createElement;

const App = () => h(Hello, { name: 'lib/react' });

export default App;
