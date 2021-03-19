import Adapt from 'core/js/adapt';
import TemplateRenderEvent from './templateRenderEvent';
import HTMLReactParser from 'html-react-parser';

/**
 * Finds a node in a react node hierarchy
 * Return true from the iterator to stop traversal
 * @param {object} hierarchy
 * @param {function} iterator
 */
export function find(hierarchy, iterator) {
  if (iterator(hierarchy)) {
    return true;
  }
  if (!hierarchy.props || !hierarchy.props.children) return;
  if (Array.isArray(hierarchy.props.children)) {
    return hierarchy.props.children.find(child => {
      if (!child) return;
      return find(child, iterator);
    });
  }
  return find(hierarchy.props.children, iterator);
};

/**
 * Allows clone and modification of a react node hierarchy
 * @param {*} value
 * @param {boolean} isDeep=false
 * @param {function} modifier
 * @returns {*}
 */
export function clone(value, isDeep = false, modifier = null) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  const cloned = Array.isArray(value) ? [] : {};
  const descriptors = Object.getOwnPropertyDescriptors(value);
  for (let name in descriptors) {
    const descriptor = descriptors[name];
    if (!descriptor.hasOwnProperty('value')) {
      Object.defineProperty(cloned, name, descriptor);
      continue;
    }
    let value = descriptor.value;
    if (typeof value === 'object' && value !== null) {
      if (isDeep) {
        value = descriptor.value = clone(value, isDeep, modifier);
      }
      if (modifier && typeof value.$$typeof === 'symbol') {
        modifier(value);
      }
    }
    descriptor.writable = true;
    Object.defineProperty(cloned, name, descriptor);
  }
  if (modifier && typeof cloned.$$typeof === 'symbol') {
    modifier(cloned);
  }
  return cloned;
};

/**
 * Used by babel plugin babel-plugin-transform-react-templates to inject react templates
 */
export default function register(name, component) {
  templates[name] = (...args) => {
    // Trap render calls to emit preRender and postRender events
    const mode = 'reactTemplate';
    // Send preRender event to allow modification of args
    const preRenderEvent = new TemplateRenderEvent(`${mode}:preRender`, name, mode, null, args);
    Adapt.trigger(preRenderEvent.type, preRenderEvent);
    // Execute template
    const value = component(...preRenderEvent.args);
    // Send postRender event to allow modification of rendered template
    const postRenderEvent = new TemplateRenderEvent(`${mode}:postRender`, name, mode, value, preRenderEvent.args);
    Adapt.trigger(postRenderEvent.type, postRenderEvent);
    // Return rendered, modified template
    return postRenderEvent.value;
  };
};

/**
 * Storage for react templates
 */
export const templates = {};

/**
 * Convert html strings to react dom, equivalent to handlebars {{{html}}}
 * @param {string} html
 */
export function html(html, ref = null) {
  if (!html) return;
  let node = html ? HTMLReactParser(html) : '';
  if (typeof node === 'object' && ref) {
    // Strip object freeze and write locks by cloning
    node = clone(node);
    node.ref = ref;
  }
  return node;
}

/**
 * Render the named react component
 * @param {string} name React template name
 * @param {...any} args React template arguments
 */
export function render(name, ...args) {
  const template = templates[name];
  const component = template(...args);
  return component;
};

/**
 * Handlebars compile integration
 * @param {string} name Handlebars template
 * @param {...any} args Template arguments
 */
export function compile(template, ...args) {
  const output = Handlebars.compile(template)(...args);
  return output;
};

/**
 * Handlebars partials integration
 * @param {string} name Partial name
 * @param {...any} args Partial arguments
 */
export function partial(name, ...args) {
  const output = Handlebars.partials[name](...args);
  return output;
};

/**
 * Handlebars helpers integration
 * @param {string} name Helper name
 * @param {...any} args Helper arguments
 */
export function helper(name, ...args) {
  const output = Handlebars.helpers[name].call(args[0]);
  return (output && output.string) || output;
};

/**
 * Helper for a list of classes, filtering out falsies and joining with spaces
 * @param  {...any} args List or arrays of classes
 */
export function classes(...args) {
  return _.flatten(args).filter(Boolean).join(' ');
};
