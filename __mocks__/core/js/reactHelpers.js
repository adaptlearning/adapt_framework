import { jest } from '@jest/globals';

export const prefixClasses = jest.fn((classNamePrefixes, classNames) => {
  return classNames.map(className => `${classNamePrefixes}-${className}`).join(' ');
});

export const compile = jest.fn((template, props) => {
  return template;
});
