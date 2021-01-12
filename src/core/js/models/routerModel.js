import LockingModel from 'core/js/models/lockingModel';

export default class RouterModel extends LockingModel {

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
