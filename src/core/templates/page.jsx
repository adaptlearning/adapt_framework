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
    subtitle,
    body,
    pageBody,
    instruction,
    mobileInstruction,
    _disableAccessibilityState
  } = data;
  const sizedInstruction = (mobileInstruction && Adapt.device.screenSize !== 'large') ?
    mobileInstruction :
    instruction;
  return <div className="page__inner">
    {(displayTitle || subtitle || body || instruction) &&
    <div className="page__header">
      <div className="page__header-inner">

        {displayTitle &&
        <div className="page__title">

          {!_disableAccessibilityState &&
          <div className="js-heading" ref={view.jsxHeading}></div>
          }

          <div className="page__title-inner" aria-hidden={!_disableAccessibilityState}>
            {html(compile(displayTitle, data))}
          </div>

        </div>
        }

        {subtitle &&
        <div className="page__subtitle">
          <div className="page__subtitle-inner">
            {html(compile(subtitle))}
          </div>
        </div>
        }

        {(body || pageBody) &&
        <div className="page__body">
          <div className="page__body-inner">
            {html(compile(pageBody || body, data))}
          </div>
        </div>
        }

        {sizedInstruction &&
        <div className="page__instruction">
          <div className="page__instruction-inner">
            {html(compile(sizedInstruction, data))}
          </div>
        </div>
        }

      </div>
    </div>
    }

    <div className="article__container" ref={view.jsxChildContainer}>
      {/* Articles render here */}
    </div>

  </div>

}
