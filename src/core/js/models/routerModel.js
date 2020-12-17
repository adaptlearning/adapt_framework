export default class RouterModel extends Backbone.Model {

  defaults() {
    return {
      _canNavigate: true,
      _shouldNavigateFocus: true
    };
  }

  lockedAttributes() {
    return {
      _canNavigate: false,
      _shouldNavigateFocus: false
    };
  }

}
