define(function() {

  const set = Backbone.Model.prototype.set;

  Object.assign(Backbone.Model.prototype, {

    set: function(attrName, attrVal, options = {}) {
      const stopProcessing = (typeof attrName === 'object' || typeof attrVal !== 'boolean' || !this.isLocking(attrName));
      if (stopProcessing) return set.apply(this, arguments);

      const isSettingValueForSpecificPlugin = options && options.pluginName;
      if (!isSettingValueForSpecificPlugin) {
        console.error('Must supply a pluginName to change a locked attribute');
        options.pluginName = 'compatibility';
      }

      const pluginName = options.pluginName;
      if (this.defaults[attrName] !== undefined) {
        this._lockedAttributes[attrName] = !this.defaults[attrName];
      }
      const lockingValue = this._lockedAttributes[attrName];
      const isAttemptingToLock = (lockingValue === attrVal);

      if (isAttemptingToLock) {
        this.setLockState(attrName, true, { pluginName: pluginName, skipcheck: true });
        return set.call(this, attrName, lockingValue);
      }

      this.setLockState(attrName, false, { pluginName: pluginName, skipcheck: true });

      const totalLockValue = this.getLockCount(attrName, { skipcheck: true });
      if (totalLockValue === 0) {
        return set.call(this, attrName, !lockingValue);
      }

      return this;

    },

    setLocking: function(attrName, defaultLockValue) {
      if (this.isLocking(attrName)) return;
      if (!this._lockedAttributes) this._lockedAttributes = {};
      this._lockedAttributes[attrName] = defaultLockValue;
    },

    unsetLocking: function(attrName) {
      if (!this.isLocking(attrName)) return;
      if (!this._lockedAttributes) return;
      delete this._lockedAttributes[attrName];
      delete this._lockedAttributesValues[attrName];
      if (Object.keys(this._lockedAttributes).length === 0) {
        delete this._lockedAttributes;
        delete this._lockedAttributesValues;
      }
    },

    isLocking: function(attrName) {
      const isCheckingGeneralLockingState = (attrName === undefined);
      const isUsingLockedAttributes = Boolean(this.lockedAttributes || this._lockedAttributes);

      if (isCheckingGeneralLockingState) {
        return isUsingLockedAttributes;
      }

      if (!isUsingLockedAttributes) return false;

      if (!this._lockedAttributes) {
        this._lockedAttributes = _.result(this, 'lockedAttributes');
      }

      const isAttributeALockingAttribute = this._lockedAttributes.hasOwnProperty(attrName);
      if (!isAttributeALockingAttribute) return false;

      if (!this._lockedAttributesValues) {
        this._lockedAttributesValues = {};
      }

      if (!this._lockedAttributesValues[attrName]) {
        this._lockedAttributesValues[attrName] = {};
      }

      return true;
    },

    isLocked: function(attrName, options) {
      const shouldSkipCheck = (options && options.skipcheck);
      if (!shouldSkipCheck) {
        const stopProcessing = !this.isLocking(attrName);
        if (stopProcessing) return;
      }

      return this.getLockCount(attrName) > 0;
    },

    getLockCount: function(attrName, options) {
      const shouldSkipCheck = (options && options.skipcheck);
      if (!shouldSkipCheck) {
        const stopProcessing = !this.isLocking(attrName);
        if (stopProcessing) return;
      }

      const isGettingValueForSpecificPlugin = options && options.pluginName;
      if (isGettingValueForSpecificPlugin) {
        return this._lockedAttributesValues[attrName][options.pluginName] ? 1 : 0;
      }

      const lockingAttributeValues = Object.values(this._lockedAttributesValues[attrName]);
      const lockingAttributeValuesSum = lockingAttributeValues.reduce((sum, value) => sum + (value ? 1 : 0), 0);

      return lockingAttributeValuesSum;
    },

    setLockState: function(attrName, value, options) {
      const shouldSkipCheck = (options && options.skipcheck);
      if (!shouldSkipCheck) {
        const stopProcessing = !this.isLocking(attrName);
        if (stopProcessing) return this;
      }

      const isSettingValueForSpecificPlugin = options && options.pluginName;
      if (!isSettingValueForSpecificPlugin) {
        console.error('Must supply a pluginName to set a locked attribute lock value');
        options.pluginName = 'compatibility';
      }

      if (value) {
        this._lockedAttributesValues[attrName][options.pluginName] = value;
      } else {
        delete this._lockedAttributesValues[attrName][options.pluginName];
      }

      return this;

    }

  });

});
