import { h } from './lib/react.js';
import Hello from './hello.js';

const App = () => h(Hello, { name: 'lib/react' });

export default App;
