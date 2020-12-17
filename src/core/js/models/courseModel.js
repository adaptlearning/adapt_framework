import Adapt from 'core/js/adapt';
import MenuModel from 'core/js/models/menuModel';

class CourseModel extends MenuModel {

  get _parent() {
    Adapt.log.deprecated('courseModel._parent, use courseModel.getParent() instead, parent models are defined by the JSON');
    return null;
  }

  get _siblings() {
    Adapt.log.deprecated('courseModel._siblings, use courseModel.getSiblings() instead, sibling models are defined by the JSON');
    return null;
  }

}

Adapt.register('course', { model: CourseModel });

export default CourseModel;
