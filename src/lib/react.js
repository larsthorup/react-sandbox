import { internal } from './react-dom.js';

export const createElement = (type, props, ...children) => {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
};
export const h = createElement;

export const useState = (initialValue) => {
  const oldHook =
    internal.wipFiber.alternate &&
    internal.wipFiber.alternate.hooks &&
    internal.wipFiber.alternate.hooks[internal.hookIndex];
  const hook = {
    state: oldHook ? oldHook.state : initialValue,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((action) => {
    hook.state = action(hook.state);
  });
  const setState = (newValue) => {
    const action = () => newValue;
    hook.queue.push(action);
    internal.wipRoot = {
      dom: internal.currentRoot.dom,
      props: internal.currentRoot.props,
      alternate: internal.currentRoot,
    };
    internal.nextUnitOfWork = internal.wipRoot;
    // console.log('setState', newValue, internal.wipRoot);
    internal.deletions = [];
  };
  internal.wipFiber.hooks.push(hook);
  internal.hookIndex++;
  return [hook.state, setState];
};

const createTextElement = (text) => {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
};
