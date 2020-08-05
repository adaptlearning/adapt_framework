define([
  'core/js/adapt',
  './navigationItemView',
  'core/js/models/navigationItemModel'
], function(Adapt, NavigationItemView, NavigationItemModel) {

  class NavigationView extends Backbone.View {

    className() {
      return 'nav';
    }

    attributes() {
      return {
        'role': 'navigation'
      };
    }

    initialize() {
      this.items = [];
      this.listenToOnce(Adapt, {
        'courseModel:dataLoading': this.remove
      });
      this.listenTo(Adapt, 'router:menu router:page', this.hideNavigationButton);
      this.preRender();
    }

    preRender() {
      Adapt.trigger('navigationView:preRender', this);
      this.render();
    }

    render() {
      const template = Handlebars.templates[this.constructor.template];
      this.$el.html(template({})).insertBefore('#app');

      this.addDefaultButtons();

      _.defer(() => {
        Adapt.trigger('navigationView:postRender', this);
      });

      return this;
    }

    addDefaultButtons() {
      const accessibility = Adapt.config.get('_accessibility');
      if (accessibility && accessibility._isSkipNavigationEnabled) {
        this.add(new NavigationItemView({
          model: new NavigationItemModel({
            _name: 'skip',
            _order: -2000,
            _layout: 'left',
            _event: 'skipNavigation',
            _template: 'navSkip'
          })
        }));
      }
      this.add(new NavigationItemView({
        model: new NavigationItemModel({
          _name: 'back',
          _order: -1000,
          _layout: 'left',
          _event: 'backButton',
          _template: 'navBack'
        })
      }));
      this.add(new NavigationItemView({
        model: new NavigationItemModel({
          _name: 'drawer',
          _order: 1000,
          _layout: 'right',
          _eventName: 'toggleDrawer',
          _template: 'navDrawer'
        })
      }));
    }

    add(navigationItemView) {
      const name = navigationItemView.model.get('_name');
      const index = this.items.findIndex(view => view.model.get('_name') === name);
      const replaceExisting = (index !== -1);
      if (replaceExisting) {
        this.items.splice(index, 1);
      }
      this.items.push(navigationItemView);
      this.listenTo(navigationItemView.model, 'change:_order change:_layout', this.sort);
      this.sort();
    }

    sort() {
      const layoutGroups = this.items.reduce((layoutGroups, view) => {
        const viewLayoutType = view.model.get('_layout') || '';
        layoutGroups[viewLayoutType] = layoutGroups[viewLayoutType] || [];
        layoutGroups[viewLayoutType].push(view);
        return layoutGroups;
      }, {});
      for (let layoutGroupName in layoutGroups) {
        const layoutGroup = layoutGroups[layoutGroupName];
        layoutGroup.sort((groupA, groupB) => groupA.model.get('_order') - groupB.model.get('_order'));
        const $target = this.$(`.js-nav-item-container${layoutGroupName ? `-${layoutGroupName}` : ''}`);
        layoutGroup.forEach(view => $target.append(view.$el));
      }
    }

    hideNavigationButton(model) {
      const shouldHide = (model.get('_type') === 'course');
      this.$('.nav__back-btn, .nav__home-btn').toggleClass('u-display-none', shouldHide);
    }

    showNavigationButton() {
      this.$('.nav__back-btn, .nav__home-btn').removeClass('u-display-none');
    }

  }

  NavigationView.template = 'nav';

  return NavigationView;

});
