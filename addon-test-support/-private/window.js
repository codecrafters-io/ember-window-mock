import locationFactory from './mock/location';

const originalWindow = window;

let location = locationFactory(originalWindow.location.href);
let holder = {};

function noop() {}

export default new Proxy(window, {
  get (target, name) {
    switch (name) {
      case 'location':
        return location;
      case 'alert':
      case 'confirm':
      case 'prompt':
        return name in holder ? holder[name] : noop;
      default:
        if (name in holder) {
          return holder[name];
        }
        if (typeof window[name] === 'function') {
          return window[name].bind(window);
        }
        return target[name];
    }
  },
  set (target, name, value, receiver) {
    switch (name) {
      case 'location':
        // setting window.location is equivalent to setting window.location.href
        receiver.location.href = value;
        return true;
      default:
        holder[name] = value;
        return true;
    }
  },
  has(target, prop) {
    return prop in holder || prop in target;
  },
  deleteProperty(target, prop) {
    delete holder[prop];
    delete target[prop];
    return true;
  }
});

export function reset() {
  location = locationFactory(originalWindow.location.href);
  holder = {};
}
