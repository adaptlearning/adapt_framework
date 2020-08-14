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
  return <div className="article__inner">
    {(displayTitle || body || sizedInstruction) &&
    <div className="article__header">
      <div className="article__header-inner">

        {displayTitle &&
        <div className="article__title">

          {!_disableAccessibilityState &&
          <div className="js-heading" ref={view.jsxHeading}></div>
          }

          <div className="article__title-inner" aria-hidden={!_disableAccessibilityState}>
            {html(compile(displayTitle, data))}
          </div>

        </div>
        }

        {body &&
        <div className="article__body">
          <div className="article__body-inner">
            {html(compile(body, data))}
          </div>
        </div>
        }

        {sizedInstruction &&
        <div className="article__instruction">
          <div className="article__instruction-inner">
            {html(compile(sizedInstruction, data))}
          </div>
        </div>
        }

      </div>
    </div>
    }

    <div className="block__container" ref={view.jsxChildContainer}>
      {/* Blocks render here */}
    </div>

  </div>

}
