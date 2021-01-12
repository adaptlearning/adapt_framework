export default class TemplateRenderEvent extends Backbone.Controller {

  /**
   * Template render event
   * @param {string} type Event type
   * @param {string} name Template name
   * @param {string} mode "template" / "partial"
   * @param {string} value Rendered template string
   * @param {[*]} args Arguments passed to template for render
   */
  initialize(type, name, mode, value, args) {
    /** @type {string} Event type */
    this.type = type;
    /** @type {string} Template name */
    this.name = name;
    /** @type {string} "template" / "partial" */
    this.mode = mode;
    /** @type {string} Rendered template string */
    this.value = value;
    /** @type {[*]} Arguments passed to template for render */
    this.args = args;
  }

}
