export default class ModelEvent extends Backbone.Controller {

  /**
   * @param {string} type Event name / type
   * @param {Backbone.Model} target Origin model
   * @param {*} [value] Any value that should be carried through on the event
   */
  initialize(type, target, value) {
    this.type = type;
    this.target = target;
    this.value = value;
    this.canBubble = true;
    this.deepPath = [target];
    this.timeStamp = null;
  }

  stopPropagation() {
    this.canBubble = false;
  }

  addPath(target) {
    this.deepPath.unshift(target);
  }

}
