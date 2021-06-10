import Adapt from 'core/js/adapt';
import 'core/js/templates';

/**
 * 27 April 2020 https://github.com/adaptlearning/adapt_framework/issues/2734
 * Chrome on Android defers load events on images when lite mode is enabled
 * and as part of a data saving technique.
 *
 * Add a loading="eager" attribute to all template and partial img tags where
 * the loading attribute is missing.
 */
Adapt.on('app:dataReady', () => {
  const config = Adapt.config.get('_fixes');
  if (config?._imgLazyLoad === false) return;
  applyImgLoadingFix();
});

function applyImgLoadingFix() {
  const findImgTag = /<img([^>]*)>/gi;
  const hasLoadingAttr = / loading=/gi;
  Adapt.on('template:postRender partial:postRender', event => {
    const imgTagsFound = event.value.match(findImgTag);
    if (!imgTagsFound) {
      return;
    }
    event.value = imgTagsFound.reduce((value, img) => {
      if (hasLoadingAttr.test(img)) {
        return value;
      }
      // Add loading="eager" by default
      return value.replace(img, img.replace(findImgTag, '<img loading="eager"$1>'));
    }, event.value);
  });
  Adapt.on('reactElement:preRender', event => {
    if (event.name !== 'img') return;
    const options = event.args[1] = event.args[1] || {};
    if (options && options.hasOwnProperty('loading')) return;
    options.loading = 'eager';
  });
}
