import Adapt from 'core/js/adapt';

const defaultAriaLevels = {
  '_menu': 1,
  '_menuGroup': 2,
  '_menuItem': 2,
  '_page': 1,
  '_article': 2,
  '_block': 3,
  '_component': 4,
  '_componentItem': 5,
  '_notify': 1
};

const helpers = {

  lowercase(text) {
    return text.toLowerCase();
  },

  capitalise(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  },

  inc(index) {
    return index + 1;
  },

  dec(index) {
    return index - 1;
  },

  odd (index) {
    return (index + 1) % 2 === 0 ? 'even' : 'odd';
  },

  equals(value, text, block) {
    return helpers.compare.call(this, value, '==', text, block);
  },

  compare(value, operator, text, block) {
    // Comparison operators
    switch (operator) {
      case '===':
        if (value === text) return block.fn(this);
        break;
      case '=': case '==':
        // eslint-disable-next-line eqeqeq
        if (value == text) return block.fn(this);
        break;
      case '>=':
        if (value >= text) return block.fn(this);
        break;
      case '<=':
        if (value <= text) return block.fn(this);
        break;
      case '>':
        if (value > text) return block.fn(this);
        break;
      case '<':
        if (value < text) return block.fn(this);
        break;
    }
    return block.inverse(this);
  },

  math(lvalue, operator, rvalue, options) {
    // Mathematical operators
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    switch (operator) {
      case '+': return lvalue + rvalue;
      case '-': return lvalue - rvalue;
      case '*': return lvalue * rvalue;
      case '/': return lvalue / rvalue;
      case '%': return lvalue % rvalue;
    }
  },

  /**
   * Equivalent to:
   *  if (conditionA || conditionB)
   * @example
   * {{#any displayTitle body instruction}}
   * <div class='component__header {{_component}}__header'></div>
   * {{/any}}
   */
  any(...args) {
    const specified = args.slice(0, -1);
    const block = args.slice(-1)[0];
    return specified.some(Boolean) ? (block.fn ? block.fn(this) : true) : (block.inverse ? block.inverse(this) : false);
  },

  /**
   * Equivalent to:
   *  if (conditionA && conditionB)
   * @example
   * {{#all displayTitle body instruction}}
   * <div class='component__header {{_component}}__header'></div>
   * {{/all}}
   */
  all(...args) {
    const specified = args.slice(0, -1);
    const block = args.slice(-1)[0];
    return specified.every(Boolean) ? (block.fn ? block.fn(this) : true) : (block.inverse ? block.inverse(this) : false);
  },

  /**
   * Equivalent to:
   *  if (!conditionA && !conditionB)
   * @example
   * {{#none displayTitle body instruction}}
   * <div class='component__header {{_component}}__header'></div>
   * {{/none}}
   */
  none(...args) {
    const specified = args.slice(0, -1);
    const block = args.slice(-1)[0];
    return !specified.some(Boolean) ? (block.fn ? block.fn(this) : true) : (block.inverse ? block.inverse(this) : false);
  },

  /**
   * Allow JSON to be a template i.e. you can use handlebars {{expressions}} within your JSON
   */
  compile(template, context) {
    if (!template) {
      return '';
    }
    if (template instanceof Object) template = template.toString();
    let data = this;
    if (context) {
      // choose between a passed argument context or the default handlebars helper context
      data = (context.data?.root ?? context);
    }
    return Handlebars.compile(template)(data);
  },

  /**
   * Allow JSON to be a template and accessible text
   */
  compile_a11y_text(template, context) {
    Adapt.a11y.log.deprecated('a11y_text is no longer required. https://tink.uk/understanding-screen-reader-interaction-modes/');
    return helpers.compile.call(this, template, context);
  },

  /**
   * Allow JSON to be a template and normalized text
   */
  compile_a11y_normalize(template, context) {
    if (!template) {
      return '';
    }
    if (template instanceof Object) template = template.toString();
    return Handlebars.helpers.a11y_normalize.call(this, helpers.compile.call(this, template, context));
  },

  /**
   * Remove all html tags except styling tags
   */
  compile_a11y_remove_breaks(template, context) {
    if (!template) {
      return '';
    }
    return Handlebars.helpers.a11y_remove_breaks.call(this, helpers.compile.call(this, template, context));
  },

  /**
   * makes the _globals object in course.json available to a template
   */
  import_globals(context) {
    if (context.data.root._globals) {
      return '';
    }
    context.data.root._globals = Adapt.course.get('_globals');
    return '';
  },

  /**
   * makes the Adapt module data available to a template
   */
  import_adapt(context) {

    if (context.data.root.Adapt) {
      return;
    }
    const adapt = context.data.root.Adapt = {};

    let i, l, name;

    const directImport = ['config', 'course'];
    for (i = 0, l = directImport.length; i < l; i++) {
      name = directImport[i];
      // convert the model to a json object and add to the current context
      adapt[name] = Adapt[name].toJSON();
    }

    const indexedImport = ['contentObjects', 'articles', 'blocks', 'components'];
    for (i = 0, l = indexedImport.length; i < l; i++) {
      name = indexedImport[i];
      // convert the collection of models to an array of json objects
      const importArray = Adapt[name].toJSON();
      // convert the array of json models to an object indexed by id
      const importIndex = {};
      for (let i1 = 0, l1 = importArray.length; i1 < l1; i1++) {
        const item = importArray[i1];
        importIndex[item._id] = item;
      }
      // add the indexed object to the current context
      adapt[name] = importIndex;
    }

    return '';

  },

  /**
   * Allow components to fetch their component description.
   *
   * Creates an aria label using the `a11y_aria_label` helper containing
   * the component description specified in the
   * `_globals._component[componentName].ariaRegion`. This value is defined
   * in the `properties.schema:globals.ariaRegion`.
   *
   * @param {string} [override]
   * @returns {string}
   */
  component_description(override, context) {
    if (!this._isA11yComponentDescriptionEnabled) {
      return;
    }
    const isNotDefined = !this._globals._components?.['_' + this._component];
    if (isNotDefined) {
      return;
    }
    const hasOverride = (arguments.length > 1);
    let description;
    if (hasOverride) {
      description = override;
      description = helpers.compile(description, context);
    } else {
      description = this._globals._components['_' + this._component].ariaRegion;
      description = helpers.compile(description, override);
    }
    if (!description) {
      return;
    }
    return new Handlebars.SafeString('<div class="aria-label">' + description + '</div>');
  },

  a11y_text(text) {
    Adapt.a11y.log.deprecated('a11y_text is no longer required. https://tink.uk/understanding-screen-reader-interaction-modes/');
    return text;
  },

  /**
   * Handlebars helper for `Adapt.a11y.normalize(htmls)`.
   *
   * @param {string} htmls Any htmls.
   * @returns {string}
   */
  a11y_normalize(htmls) {
    return Adapt.a11y.normalize.apply(Adapt.a11y, arguments);
  },

  /**
   * Handlebars helper for `Adapt.a11y.removeBreaks(htmls)`.
   *
   * @param {string} htmls Any htmls.
   * @returns {string}
   */
  a11y_remove_breaks(htmls) {
    return Adapt.a11y.removeBreaks.apply(Adapt.a11y, arguments);
  },

  /**
   * Creates a div styled with tiny, transparent text.
   * It it absolutely positioned.
   * The text is not visibly readable but is read by screen readers.
   *
   * @param {string} htmls
   * @returns {string}
   */
  a11y_aria_label(htmls) {
    let values = Array.prototype.slice.call(arguments, 0, -1);
    values = values.filter(Boolean);
    return new Handlebars.SafeString('<div class="aria-label">' + values.join(' ') + '</div>');
  },

  /**
   * Creates a div styled with tiny, transparent text.
   * It it relatively positioned.
   * The text is not visibly readable but is read by screen readers.
   *
   * @param {string} htmls Aria label texts.
   * @returns {string}
   */
  a11y_aria_label_relative(htmls) {
    let values = Array.prototype.slice.call(arguments, 0, -1);
    values = values.filter(Boolean);
    return new Handlebars.SafeString('<div class="aria-label relative">' + values.join(' ') + '</div>');
  },

  /**
   * Creates a div styled with tiny, transparent text and `role"=img"`.
   * It is used for representing an image to a screen reader user in an
   * order which cannot be represented in the DOM in a way that achieves the
   * styling objectives.
   * It it absolutely positioned.
   * The text is not visibly readable but is read by screen readers.
   *
   * @param {string} texts Aria label texts.
   * @returns {string}
   */
  a11y_aria_image(texts) {
    let values = Array.prototype.slice.call(arguments, 0, -1);
    values = values.filter(Boolean);
    return new Handlebars.SafeString('<div class="aria-label" role="img" aria-label="' + values.join(' ') + '"></div>');
  },

  /**
   * Returns an `a` tag which when receiving focus causes the focus to wrap
   * to the top of the readable document.
   *
   * @returns {string}
   */
  a11y_wrap_focus() {
    const cfg = Adapt.config.get('_accessibility');
    if (cfg._isPopupWrapFocusEnabled === false) return '';
    return new Handlebars.SafeString('<a class="a11y-focusguard a11y-ignore a11y-ignore-focus" role="presentation">&nbsp;</a>');
  },

  /**
   * Creates the attributes for a subject heading text. `role="heading"` and
   * `aria-level="#"`. It will use the `_ariaLevel` attribute from the current
   * context if specified, a number if given as the `levelOrType` parameter,
   * or a name from the configured aria levels hash.
   *
   * @param {number|string} levelOrType
   * @returns {string}
   */
  a11y_attrs_heading(levelOrType) {
    // get the global configuration from config.json
    const cfg = Adapt.config.get('_accessibility');
    // default level to use if nothing overrides it
    let level = 1;

    // first check to see if the Handlebars context has an override
    if (this._ariaLevel) {
      levelOrType = this._ariaLevel;
    }

    if (isNaN(levelOrType) === false) {
      // if a number is passed just use this
      level = levelOrType;
    } else if (_.isString(levelOrType)) {
      // if a string is passed check if it is defined in global configuration
      cfg._ariaLevels = cfg._ariaLevels || defaultAriaLevels;
      if (cfg._ariaLevels?.['_' + levelOrType] !== undefined) {
        level = cfg._ariaLevels['_' + levelOrType];
      }
    }

    return new Handlebars.SafeString(' role="heading" aria-level="' + level + '" ');
  },

  a11y_attrs_tabbable() {
    Adapt.a11y.log.deprecated('a11y_attrs_tabbable should not be used. tabbable elements should be natively tabbable.');
    return new Handlebars.SafeString(' role="region" tabindex="0" ');
  },

  /**
   * Produce display text with alternative screen reader version.
   * @param {string} visible Text that will be displayed on screen
   * @param {string} alternatives Text that will be read by the screen reader (instead of what's displayed on screen)
   * @example {{a11y_alt_text '$5bn' 'five billion dollars'}} or {{a11y_alt_text 'Here are some bits to read' 'There are' _items.length 'items to read'}}
   */
  a11y_alt_text(visible, alternatives) {
    let values = Array.prototype.slice.call(arguments, 1, -1);
    values = values.filter(Boolean);
    return new Handlebars.SafeString('<span aria-hidden="true">' + visible + '</span><span class="aria-label">' + values.join(' ') + '</span>');
  }

};

// Compatibility references
Object.assign(helpers, {

  if_value_equals() {
    Adapt.a11y.log.deprecated('if_value_equals, use equals instead.');
    return helpers.equals.apply(this, arguments);
  },

  numbers() {
    Adapt.a11y.log.deprecated('numbers, use inc instead.');
    return helpers.inc.apply(this, arguments);
  },

  lowerCase() {
    Adapt.a11y.log.deprecated('lowerCase, use lowercase instead.');
    return helpers.lowercase.apply(this, arguments);
  }

});

for (let name in helpers) {
  if (!helpers.hasOwnProperty(name)) continue;
  Handlebars.registerHelper(name, helpers[name]);
}

export default helpers;
