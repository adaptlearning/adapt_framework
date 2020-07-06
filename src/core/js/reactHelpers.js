/**
 * Used by babel plugin babel-plugin-transform-react-templates to inject react templates
 */
export default function register(name, component) {
  templates[name] = component;
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
  const node = html ? HTMLReactParser(html) : '';
  if (ref) {
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
  return templates[name](...args);
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
 * @param  {...any} args List of classes
 */
export function classes(...args) {
  return args.filter(Boolean).join(' ');
};
