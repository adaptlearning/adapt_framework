import Adapt from 'core/js/adapt';
import {
  compile,
  classes,
  helper,
  html
} from 'core/js/reactHelpers';
import React from 'react';

export default function(model, view) {
  const data = model.toJSON();
  data._globals = Adapt.course.get('_globals');
  // Create references to un-controlled view containers
  view.jsxHeading = view.jsxHeading || React.createRef();
  view.jsxComponentDescription = view.jsxComponentDescription || React.createRef();
  const {
    displayTitle,
    body,
    instruction,
    mobileInstruction,
    _component,
    _disableAccessibilityState
  } = data;
  const type = _component.toLowerCase();
  const sizedInstruction = (mobileInstruction && Adapt.device.screenSize !== 'large') ?
    mobileInstruction :
    instruction;
  return (displayTitle || body || sizedInstruction) && (
    <div className={classes(['component__header', `${type}__header`])}>
      <div className={classes(['component__header-inner', `${type}__header-inner`])}>
        {displayTitle &&
        <div className={classes(['component__title', `${type}__title`])}>

          {!_disableAccessibilityState &&
          <div className="js-heading" ref={view.jsxHeading}></div>
          }

          <div className={classes(['component__title-inner', `${type}__title-inner`])} aria-hidden={!_disableAccessibilityState}>
            {html(compile(displayTitle, data))}
          </div>

        </div>
        }

        {html(helper('component_description', data), view.jsxComponentDescription)}

        {body &&
        <div className={classes(['component__body', `${type}__body`])}>
          <div className={classes(['component__body-inner', `${type}__body-inner`])}>
            {html(compile(body, data))}
          </div>
        </div>
        }

        {sizedInstruction &&
        <div className={classes(['component__instruction', `${type}__instruction`])}>
          <div className={classes(['component__instruction-inner', `${type}__instruction-inner`])}>
            {html(compile(sizedInstruction, data))}
          </div>
        </div>
        }

      </div>
    </div>
  );
}
