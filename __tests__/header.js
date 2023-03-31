import React from 'react';
import Header from '../src/core/templates/header';
import { act } from 'react-dom/test-utils';
import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
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

describe('Rendering a header', () => {
  it('should render the header body', () => {
    const body = 'test body text';
    const props = {
      body
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe(body);
  });

  it('should render the header instructions', () => {
    const instruction = 'test instructions';
    const props = {
      instruction
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe(instruction);
  });

  it('should render the header mobile instructions', () => {
    const mobileInstruction = 'mobileInstruction';
    const props = {
      mobileInstruction
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe(mobileInstruction);
  });

  it('should not render a header when there is no body text, display title or sized instruction set', () => {
    const _id = 'header';
    const props = {
      _id
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe('');
  });

  it('should output the component description when the title, display title or instruction is not specified ' +
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

  it('should output null the component description when the title, display title or instruction is not specified' +
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

  it('should output the component description when the title, display title or instruction is not specified' +
  'and the aria region is not set', () => {
    const props = {
      _isA11yComponentDescriptionEnabled: true
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    expect(container.textContent).toBe('');
  });

  it('should output the aria region the component description when the body along with aria region is specified' +
    'and the _isA11yComponentDescriptionEnabled is enabled', () => {
    const props = {
      body: 'Text title',
      _isA11yComponentDescriptionEnabled: true,
      _component: 'text'
    };
    act(() => {
      render(<Header {...props} />, container);
    });
    const ariaRegionAndBody = 'Text Component Aria TextText title';
    expect(container.textContent).toBe(ariaRegionAndBody);
  });
});
