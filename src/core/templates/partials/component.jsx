import { compile, classes, helper, html } from 'core/js/reactHelpers';

export default function(view, data) {
  // Create a reference to an un-controller view container
  view.jsxHeading = view.jsxHeading || React.createRef();
  view.jsxComponentDescription = view.jsxComponentDescription || React.createRef();
  const {
    displayTitle,
    body,
    instruction,
    _component,
    _disableAccessibilityState
  } = data;
  const type = _component.toLowerCase();
  return (displayTitle || body || instruction) &&
    <div className={classes('component__header', `${type}__header`)}>
      <div className={classes('component__header-inner', `${type}__header-inner`)}>
        {displayTitle &&
        <div className={classes('component__title', `${type}__title`)}>

          {!_disableAccessibilityState &&
          <div className="js-heading" ref={view.jsxHeading}></div>
          }

          <div className={classes('component__title-inner', `${type}__title-inner`)} aria-hidden={!_disableAccessibilityState}>
            {`\n${html(compile(displayTitle, data))}\n`}
          </div>

        </div>
        }

        {html(helper('component_description', data), view.jsxComponentDescription)}

        {body &&
        <div className={classes('component__body', `${type}__body`)}>
          <div className={classes('component__body-inner', `${type}__body-inner`)}>
            {html(compile(body, data))}
          </div>
        </div>
        }

        {(instruction || mobileInstruction) &&
        <div className={classes('component__instruction', `${type}__instruction`)}>
          <div className={classes('component__instruction-inner', `${type}__instruction-inner`)}>
            {html(compile(instruction, data))}
          </div>
        </div>
        }

      </div>
    </div>
}
