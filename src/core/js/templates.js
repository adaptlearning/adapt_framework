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

  handlebarsInject(function(originalFunction, name, mode, ...args) {
    let event = new TemplateRenderEvent(`${mode}:preRender`, name, mode, null, args);
    Adapt.trigger(event.type, event);
    let value = originalFunction.apply(this, event.args);
    event = new TemplateRenderEvent(`${mode}:postRender`, name, mode, value, args);
    Adapt.trigger(event.type, event);
    return event.value;
  });

});
