define([
  'core/js/adapt',
  '../templates'
], function(Adapt) {

  /**
   * 27 April 2020 https://github.com/adaptlearning/adapt_framework/issues/2734
   * Chrome on Android defers load events on images when lite mode is enabled
   * and as part of a data saving technique.
   *
   * Add a loading="eager" attribute to all template and partial img tags where
   * the loading attribute is missing.
   */
  Adapt.on('app:dataReady', function() {
    const config = Adapt.config.get('_fixes');
    if (config && config._imgLazyLoad === false) return;
    applyImgLoadingFix();
  });

  function applyImgLoadingFix() {
    const findImgTag = /<img([^>]*)>/gi;
    const hasLoadingAttr = / loading=/gi;
    Adapt.on('template:postRender partial:postRender', function(event) {
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
  }

});
