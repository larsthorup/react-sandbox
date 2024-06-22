import "./cycle.js";

const createDom = (fiber) => {
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);
  updateDom(dom, {}, fiber.props);
  return dom;
};

const isEvent = (key) => key.startsWith('on');
const isProperty = (key) => key !== 'children' && !isEvent(key);
const isNew = (prev, next) => (key) => prev[key] !== next[key];
const isGone = (prev, next) => (key) => !(key in next);
const updateDom = (dom, prevProps, nextProps) => {
  //Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter((key) => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = '';
    });

  // Set new or changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      dom[name] = nextProps[name];
    });

  // Add event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });
};

const commitRoot = () => {
  internal.deletions.forEach(commitWork);
  const fiber = internal.wipRoot.child;
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;
  commitWork(fiber, domParent, 0);
  internal.currentRoot = internal.wipRoot;
  internal.wipRoot = null;
};

const commitWork = (fiber, domParent, domChildIndex) => {
  if (!fiber) return;
  const isFunctionComponent = fiber.type instanceof Function;
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom === null && !isFunctionComponent) {
    // Note: hydration
    if (domParent.children.length === 0 && domParent.childNodes.length === 1) {
      // Note: this handles only text nodes not mixed with HTML elements
      fiber.dom = domParent.childNodes[0];
    } else {
      fiber.dom = domParent.children[domChildIndex];
    }
    if (fiber.dom) {
      updateDom(fiber.dom, {}, fiber.props);
    }
  } else if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  } else if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom != null) {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
  }
  commitWork(fiber.child, fiber.dom || domParent, 0);
  commitWork(fiber.sibling, domParent, domChildIndex + 1);
};

function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

export const render = (element, container) => {
  internal.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: internal.currentRoot,
  };
  internal.deletions = [];
  internal.nextUnitOfWork = internal.wipRoot;
  requestIdleCallback(workLoop);
};

export const hydrate = (element, container) => {
  internal.wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: internal.currentRoot,
  };
  internal.deletions = [];
  internal.nextUnitOfWork = internal.wipRoot;
  while (internal.nextUnitOfWork) {
    internal.nextUnitOfWork = performUnitOfWork(internal.nextUnitOfWork, true);
  }
  commitRoot();
  // console.log("Done hydrating!");
  // console.log(internal.currentRoot);
  // console.log(JSON.stringify(JSON.decycle(internal.currentRoot, domReplacer), null, 2));
  requestIdleCallback(workLoop);
};

const domReplacer = (value) => {
  if (value instanceof HTMLElement) {
    return value.outerHTML;
  } else if (value instanceof Text) {
    return value.textContent;
  }
  return value;
}

const workLoop = (deadline) => {
  let shouldYield = false;
  while (internal.nextUnitOfWork && !shouldYield) {
    internal.nextUnitOfWork = performUnitOfWork(internal.nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
    // console.log(deadline, internal.nextUnitOfWork);
  }
  if (!internal.nextUnitOfWork && internal.wipRoot) {
    commitRoot();
    // console.log(JSON.stringify(JSON.decycle(internal.currentRoot, domReplacer), null, 2));
  }
  requestIdleCallback(workLoop);
};

const performUnitOfWork = (fiber, hydrate) => {
  // console.log('performUnitOfWork', fiber);
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber, hydrate);
  }
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
};

// Note: to be used only by react.js
export const internal = {
  currentRoot: null,
  deletions: null,
  nextUnitOfWork: null,
  wipFiber: null,
  wipRoot: null,
  hookIndex: null,
};

const updateFunctionComponent = (fiber) => {
  internal.wipFiber = fiber;
  internal.hookIndex = 0;
  internal.wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
};

const updateHostComponent = (fiber, hydrate) => {
  if (!hydrate && !fiber.dom) {
    // Note: hydration will happen in commitWork()
    fiber.dom = createDom(fiber);
  }
  const elements = fiber.props.children;
  reconcileChildren(fiber, elements);
};

const reconcileChildren = (wipFiber, elements) => {
  let index = 0;
  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  let prevSibling = null;
  while (index < elements.length || oldFiber != null) {
    const element = elements[index];
    let newFiber = null;
    // TODO: add support for "key" to handle "moved" elements
    const sameType = oldFiber && element && element.type == oldFiber.type;
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: { ...element.props },
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
      };
    }
    if (element && !sameType) {
      newFiber = {
        type: element.type,
        props: { ...element.props },
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETION';
      internal.deletions.push(oldFiber);
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else if (element) {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
};
