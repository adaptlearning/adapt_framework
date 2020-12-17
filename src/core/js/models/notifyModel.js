export default class NotifyModel extends Backbone.Model {

  defaults() {
    return {
      _isActive: false,
      _showIcon: false,
      _timeout: 3000
    };
  }

}
