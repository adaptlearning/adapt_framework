import Adapt from 'core/js/adapt';
import React, { useRef } from 'react';
import { html, prefixClasses, compile, helper } from 'core/js/reactHelpers';

/**
 * Content header for displayTitle, body, instruction text, etc.
 * instruction and mobileInstruction will switch automatically
 * @param {Object} props
 * @param {string} [props.displayTitle]
 * @param {string} [props.body]
 * @param {string} [props.instruction]
 * @param {string} [props.mobileInstruction]
 * @param {string} [props._type]
 * @param {string} [props._component]
 * @param {string} [props._disableAccessibilityState]
 */
export default function Header(props) {
  // Create references to un-controlled view containers
  const jsxHeading = useRef(null);
  const jsxComponentDescription = useRef(null);
  const {
    _id,
    displayTitle,
    body,
    instruction,
    mobileInstruction,
    _type,
    _component,
    _disableAccessibilityState,
    classNamePrefixes = [
      _type && _type.toLowerCase(),
      _component && _component.toLowerCase()
    ].filter(Boolean)
  } = props;
  const sizedInstruction = (mobileInstruction && Adapt.device.screenSize !== 'large') ?
    mobileInstruction :
    instruction;
  const isSet = (displayTitle || body || sizedInstruction);
  if (!isSet) return null;
  return (
    <div id={`${_id}-header`} className={prefixClasses(classNamePrefixes, ['__header'])}>
      <div className={prefixClasses(classNamePrefixes, ['__header-inner'])}>
        {displayTitle &&
        <div className={prefixClasses(classNamePrefixes, ['__title'])}>

          {!_disableAccessibilityState &&
          <div className="js-heading" ref={jsxHeading}></div>
          }

          <div className={prefixClasses(classNamePrefixes, ['__title-inner'])} aria-hidden={!_disableAccessibilityState}>
            {html(compile(displayTitle, props))}
          </div>

        </div>
        }

        {html(helper('component_description', props), jsxComponentDescription)}

        {body &&
        <div className={prefixClasses(classNamePrefixes, ['__body'])}>
          <div className={prefixClasses(classNamePrefixes, ['__body-inner'])}>
            {html(compile(body, props))}
          </div>
        </div>
        }

        {sizedInstruction &&
        <div className={prefixClasses(classNamePrefixes, ['__instruction'])}>
          <div className={prefixClasses(classNamePrefixes, ['__instruction-inner'])}>
            {html(compile(sizedInstruction, props))}
          </div>
        </div>
        }

      </div>
    </div>
  );
}
