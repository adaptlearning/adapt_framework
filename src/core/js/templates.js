import Adapt from 'core/js/adapt';
import TemplateRenderEvent from 'core/js/templateRenderEvent';

/**
 * Adds template and partial, preRender and postRender events to Adapt
 */

function onRender(cb) {
  const intercept = (object, name, mode, cb) => {
    return (object[name] = cb.bind(object, object[name], name, mode));
  };
  Object.keys(Handlebars.templates).forEach(name => {
    intercept(Handlebars.templates, name, 'template', cb);
  });
  Object.keys(Handlebars.partials).forEach(name => {
    intercept(Handlebars.partials, name, 'partial', cb);
  });
}

onRender((template, name, mode, ...args) => {
  // Send preRender event to allow modification of args
  const preRenderEvent = new TemplateRenderEvent(`${mode}:preRender`, name, mode, null, args);
  Adapt.trigger(preRenderEvent.type, preRenderEvent);

  // Execute template
  const value = template(...preRenderEvent.args);

  // Send postRender event to allow modification of rendered template
  const postRenderEvent = new TemplateRenderEvent(`${mode}:postRender`, name, mode, value, preRenderEvent.args);
  Adapt.trigger(postRenderEvent.type, postRenderEvent);

  // Return rendered, modified template
  return postRenderEvent.value;
});
