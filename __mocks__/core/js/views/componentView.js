import AdaptView from './adaptView';
import logging from '../logging';
import { jest } from '@jest/globals';

class ComponentView extends AdaptView {
  constructor() {
    super();
    this.model = {
      get: jest.fn(() => {
        return {
          _isA11yRegionEnabled: true,
          _id: 'mock-id',
          _component: 'mock-component',
          _classes: 'mock-classes',
          _layout: 'mock-layout',
          _isComplete: true,
          _isOptional: true
        };
      })
    };
    this.$ = jest.fn(() => {
      return {
        on: jest.fn(),
        off: jest.fn()
      };
    });
  }

  attributes() {
    return AdaptView.resultExtend('attributes', {
      'aria-labelledby': this.model.get('_id') + '-heading',
      role: 'region'
    }, this);
  }

  className() {
    return [
      'component',
      this.model.get('_component').toLowerCase(),
      this.model.get('_id'),
      this.model.get('_classes'),
      this.setVisibility(),
      this.setHidden(),
      'is-' + this.model.get('_layout'),
      (this.model.get('_isComplete') ? 'is-complete' : ''),
      (this.model.get('_isOptional') ? 'is-optional' : '')
    ].join(' ');
  }

  renderState() {
    logging.removed('renderState is removed and moved to item title');
  }

  setupInviewCompletion(inviewElementSelector = '.component__inner', callback = this.setCompletionStatus) {
    this.$inviewElement = this.$(inviewElementSelector);
    this.inviewCallback = callback;
  }

  removeInviewListener() {}

  onInview() {}

  postRender() {}

  remove() {}
}

ComponentView.type = 'component';

export default ComponentView;
