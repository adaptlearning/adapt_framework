import { jest } from '@jest/globals';

class AdaptView {
  constructor() {
    this.model = {
      get: jest.fn(() => {
        return {
          _id: 'mock-id',
          _isVisible: true,
          _isHidden: false,
          _isComplete: true
        };
      }),
      set: jest.fn(),
      toJSON: jest.fn(() => ({})),
      getChildren: jest.fn(() => {
        return {
          listenTo: jest.fn()
        };
      })
    };
    this.listenTo = jest.fn();
  }

  attributes() {
    return {
      'data-adapt-id': this.model.get('_id'),
      role: 'presentation'
    };
  }

  initialize() {}

  preRender() {}

  async postRender() {}

  render() {
    return this;
  }

  changed() {}

  updateViewProperties() {}

  toggleVisibility() {}

  toggleHidden() {}

  onIsCompleteChange() {}

  setupOnScreenHandler() {}

  setReadyStatus() {
    this.model.set('_isReady', true);
  }

  setCompletionStatus() {
    if (!this.model.get('_isVisible')) return;
    this.model.set({
      _isComplete: true,
      _isInteractionComplete: true
    });
  }

}
AdaptView.type = 'adaptView';
export default AdaptView;
