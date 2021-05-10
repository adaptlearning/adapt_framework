import Adapt from 'core/js/adapt';
import React from 'react';
import { html, classes, prefixClasses } from 'core/js/reactHelpers';

/**
 * Size switching content image
 * @param {Object} props
 * @param {Array} props.classNamePrefixes
 * @param {Array} [props.attributionClassNamePrefixes]
 */
export default function Image(props) {
  const screenSize = Adapt.device.screenSize;
  const attributionClassNamePrefixes = (props.attributionClassNamePrefixes || props.classNamePrefixes);
  const isSet = (props[`_${screenSize}`] || props[`${screenSize}`] || props._src || props.src);
  if (!isSet) return null;
  return (
    <div className={classes([
      prefixClasses(props.classNamePrefixes, ['-image-container']),
      props.attribution && 'has-attribution'
    ])}>

      <img
        className={prefixClasses(props.classNamePrefixes, ['-image'])}
        src={props[`_${screenSize}`] || props[`${screenSize}`] || props._src || props.src}
        aria-label={Adapt.a11y.normalize(props.alt)}
        aria-hidden={!props.alt}
        loading='eager'
      />

      {props.attribution &&
      <div className={prefixClasses(attributionClassNamePrefixes, ['__attribution'])}>
        <div className={prefixClasses(attributionClassNamePrefixes, ['__attribution-inner'])}>
          {html(props.attribution)}
        </div>
      </div>
      }

    </div>
  );
}
