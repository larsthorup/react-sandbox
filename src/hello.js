import { h, useState } from './lib/react.js';

const Hello = ({ name }) => {
  const [value, setValue] = useState('');
  const onChange = (ev) => {
    setValue(ev.target.value);
  };
  const h1 = h('h1', null, 'Greeting');
  const p = h('p', null, `Hello ${value ? `${value} ` : ''}from ${name}`);
  const label = h('label', { htmlFor: 'name'}, 'Enter name:');
  const input = h('input', { id: 'name', onChange, value });
  const button = h('button', {}, 'Submit');
  return h('div', { id: 'hello' }, h1, p, label, input, button);
};

export default Hello;
