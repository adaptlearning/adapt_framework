import LockingModel from 'core/js/models/lockingModel';

export default class NotifyModel extends LockingModel {

  defaults() {
    return {
      _isActive: false,
      _showIcon: false,
      _timeout: 3000
    };
  }

}
