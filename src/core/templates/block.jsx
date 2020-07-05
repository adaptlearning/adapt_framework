import { compile, html } from 'core/js/reactHelpers';

export default function(view, data) {
  // Create a reference to an un-controller view container
  view.jsxHeading = view.jsxHeading || React.createRef();
  view.jsxChildContainer = view.jsxChildContainer || React.createRef();
  const {
    displayTitle,
    body,
    instruction,
    _disableAccessibilityState
  } = data;
  return <div className="block__inner">
    {(displayTitle || body || instruction) &&
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

        {instruction &&
        <div className="block__instruction">
          <div className="block__instruction-inner">
            {html(compile(instruction, data))}
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
