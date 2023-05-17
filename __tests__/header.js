import React from 'react';
import Header from '../src/core/adapt-contrib-core/templates/header';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import device from 'core/js/device';
import { unmountComponentAtNode, render } from 'react-dom';

let container = null;
beforeEach(() => {
  jest.clearAllMocks();
  // setup a DOM element as a render target
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('Header Component State', () => {
  beforeEach(() => {
    device.screenSize = 'small';
  });

  it('should display the header body', () => {
    const body = 'test body text';
    const props = {
      body
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe(body);
  });

  it('should display the header instructions', () => {
    const instruction = 'test instructions';
    const props = {
      instruction
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe(instruction);
  });

  it('should be able to set the displayTitle', () => {
    const displayTitle = 'test body text';
    const props = {
      displayTitle
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe('');
  });

  it('should not display a header when there is no body text, display title or sized instruction set', () => {
    const _id = 'header';
    const props = {
      _id
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe('');
  });

  it('should display the component description when the title, display title or instruction is not specified ' +
    'and the _isA11yComponentDescriptionEnabled is enabled and the aria region is set', () => {
    const props = {
      _isA11yComponentDescriptionEnabled: true,
      _component: 'text'
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    const ariaRegion = 'Text Component Aria Text';
    expect(container.textContent).toBe(ariaRegion);
  });

  it('should display the extension description when the title, display title or instruction is not specified ' +
    'and the _isA11yComponentDescriptionEnabled is enabled and the aria region is set', () => {
    const props = {
      _isA11yComponentDescriptionEnabled: true,
      _extension: 'glossary'
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    const ariaRegion = 'Glossary Extension Aria Text';
    expect(container.textContent).toBe(ariaRegion);
  });

  it('should not display anything when the title, display title or instruction is not specified' +
  'and the _isA11yComponentDescriptionEnabled is not enabled', () => {
    const props = {
      _isA11yComponentDescriptionEnabled: false,
      _component: 'text'
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe('');
  });

  it('should display the aria region the component description when the body along with aria region is specified' +
    'and the _isA11yComponentDescriptionEnabled is enabled', () => {
    const props = {
      body: 'Text title',
      _isA11yComponentDescriptionEnabled: true,
      _component: 'text'
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    const ariaRegion = 'Text Component Aria Text';
    const body = 'Text title';
    expect(container.textContent).toContain(ariaRegion);
    expect(container.textContent).toContain(body);
  });

  describe('Device screen size rendering', () => {
    it('should not display the header mobile instructions when the isScreenSizeMin is medium', () => {
      jest.spyOn(device, 'isScreenSizeMin').mockReturnValue(true);
      const mobileInstruction = 'mobileInstruction';
      const props = {
        mobileInstruction
      };
      act(() => {
        render(<Header {...props} />, container);
      });
      expect(container.textContent).toBe('');
    });

    it('should display the header instructions when the isScreenSizeMin is medium', () => {
      jest.spyOn(device, 'isScreenSizeMin').mockReturnValue(true);
      const mobileInstruction = 'mobileInstruction';
      const instruction = 'instruction';
      const props = {
        mobileInstruction,
        instruction
      };
      act(() => {
        render(<Header {...props} />, container);
      });
      expect(container.textContent).toBe(instruction);
    });

    it('should display the header mobile instructions on small screen devices', () => {
      jest.spyOn(device, 'isScreenSizeMin').mockReturnValue(false);
      const mobileInstruction = 'mobileInstruction';
      const props = {
        mobileInstruction
      };
      act(() => {
        render(<Header {...props} />, container);
      });
      expect(container.textContent).toBe(mobileInstruction);
    });
  });
});
