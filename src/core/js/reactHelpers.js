import Adapt from 'core/js/adapt';
import TemplateRenderEvent from './templateRenderEvent';
import HTMLReactParser from 'html-react-parser';
import React from 'react';

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
 * Override React.createElement to allow trapping and modification of react
 * template elements.
 */
(function () {
  const original = React.createElement;
  React.createElement = (...args) => {
    const name = args[0];
    // Trap render calls to emit preRender and postRender events
    const mode = 'reactElement';
    // Send preRender event to allow modification of args
    const preRenderEvent = new TemplateRenderEvent(`${mode}:preRender`, name, mode, null, args);
    Adapt.trigger(preRenderEvent.type, preRenderEvent);
    // Execute element creation
    const value = original(...preRenderEvent.args);
    // Send postRender event to allow modification of rendered element
    const postRenderEvent = new TemplateRenderEvent(`${mode}:postRender`, name, mode, value, preRenderEvent.args);
    Adapt.trigger(postRenderEvent.type, postRenderEvent);
    // Return rendered, modified element
    return postRenderEvent.value;
  };
})();

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
    node = Array.isArray(node) ? node[0] : node;
    node = React.cloneElement(node, { ref });
  }
  return node;
}

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
 * Helper for a list of classes, filtering out falsies and duplicates, and joining with spaces
 * @param  {...any} args List or arrays of classes
 */
export function classes(...args) {
  return _.uniq(_.flatten(args).filter(Boolean).join(' ').split(' ')).join(' ');
};

/**
 * Helper for prefixing a list of classes, filtering out falsies and duplicates and joining with spaces
 * @param  {[...string]} prefixes Array of class prefixes
 * @param  {...any} args List or arrays of classes
 */
export function prefixClasses(prefixes, ...args) {
  const classes = _.flatten(args).filter(Boolean);
  const prefixed = _.flatten(prefixes.map(prefix => classes.map(className => `${prefix}${className}`)));
  return _.uniq(prefixed.join(' ').split(' ')).join(' ');
};
