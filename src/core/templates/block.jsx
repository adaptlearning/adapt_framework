import Adapt from 'core/js/adapt';
import { compile, html } from 'core/js/reactHelpers';

export default function(model, view) {
  const data = model.toJSON();
  data._globals = Adapt.course.get('_globals');
  // Create references to un-controlled view containers
  view.jsxHeading = view.jsxHeading || React.createRef();
  view.jsxChildContainer = view.jsxChildContainer || React.createRef();
  const {
    displayTitle,
    body,
    instruction,
    mobileInstruction,
    _disableAccessibilityState
  } = data;
  const sizedInstruction = (mobileInstruction && Adapt.device.screenSize !== 'large') ?
    mobileInstruction :
    instruction;
  return <div className="block__inner">
    {(displayTitle || body || sizedInstruction) &&
    <div className="block__header">
      <div className="block__header-inner">

        {displayTitle &&
        <div className="block__title">

          {!_disableAccessibilityState &&
          <div className="js-heading" ref={view.jsxHeading}></div>
          }

          <div className="block__title-inner" aria-hidden={!_disableAccessibilityState}>
            {html(compile(displayTitle, data))}
          </div>

        </div>
        }

        {body &&
        <div className="block__body">
          <div className="block__body-inner">
            {html(compile(body, data))}
          </div>
        </div>
        }

        {sizedInstruction &&
        <div className="block__instruction">
          <div className="block__instruction-inner">
            {html(compile(sizedInstruction, data))}
          </div>
        </div>
        }

      </div>
    </div>
    }

    <div className="component__container" ref={view.jsxChildContainer}>
      {/* Components render here */}
    </div>

  </div>

}
