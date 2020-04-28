define([
  'core/js/adapt',
  'handlebars',
  './templateRenderEvent'
], function(Adapt, Handlebars, TemplateRenderEvent) {

  /**
   * Adds template and partial, preRender and postRender events to Adapt
   */

  function handlebarsInject(cb) {
    const duckPunch = function(object, name, mode, cb) {
      return object[name] = cb.bind(object, object[name], name, mode);
    };
    Object.keys(Handlebars.templates).forEach(name => {
      duckPunch(Handlebars.templates, name, 'template', cb);
    });
    Object.keys(Handlebars.partials).forEach(name => {
      duckPunch(Handlebars.partials, name, 'partial', cb);
    });
  }

  handlebarsInject(function(template, name, mode, ...args) {
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

});
