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
  return <div className="article__inner">
    {(displayTitle || body || instruction) &&
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

        {instruction &&
        <div className="article__instruction">
          <div className="article__instruction-inner">
            {html(compile(instruction, data))}
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
