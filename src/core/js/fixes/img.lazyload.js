define([
  'core/js/adapt',
  '../templates'
], function(Adapt) {

  /**
   * 27 April 2020 https://github.com/adaptlearning/adapt_framework/issues/2734
   * Chrome on Android 10 defers load events on images when lite mode is enabled
   * and as part of a data saving technique.
   *
   * Add a loading="eager" attribute to all template and partial img tags where
   * the loading attribute is missing.
   */
  const findImgTag = /<img([^>]*)>/gi;
  const hasLoadingAttr = / loading=/gi;
  Adapt.on('template:postRender partial:postRender', function(event) {
    const imgs = event.value.match(findImgTag);
    if (!imgs) {
      // No img tags found
      return;
    }
    event.value = imgs.reduce((value, img) => {
      // Check if the img tag has a loading attribute
      if (hasLoadingAttr.test(img)) {
        return value;
      }
      // Add loading="eager" by default
      return value.replace(img, img.replace(findImgTag, '<img loading="eager"$1>'));
    }, event.value);
  });

});
