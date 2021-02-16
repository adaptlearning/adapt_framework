export default class LockingModel extends Backbone.Model {

  set(attrName, attrVal, options = {}) {
    const stopProcessing = (typeof attrName === 'object' || typeof attrVal !== 'boolean' || !this.isLocking(attrName));
    if (stopProcessing) return super.set(...arguments);

    const isSettingValueForSpecificPlugin = options?.pluginName;
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
      return super.set(attrName, lockingValue);
    }

    this.setLockState(attrName, false, { pluginName: pluginName, skipcheck: true });

    const totalLockValue = this.getLockCount(attrName, { skipcheck: true });
    if (totalLockValue === 0) {
      return super.set(attrName, !lockingValue);
    }

    return this;

  }

  setLocking(attrName, defaultLockValue) {
    if (this.isLocking(attrName)) return;
    if (!this._lockedAttributes) this._lockedAttributes = {};
    this._lockedAttributes[attrName] = defaultLockValue;
  }

  unsetLocking(attrName) {
    if (!this.isLocking(attrName)) return;
    if (!this._lockedAttributes) return;
    delete this._lockedAttributes[attrName];
    delete this._lockedAttributesValues[attrName];
    if (Object.keys(this._lockedAttributes).length === 0) {
      delete this._lockedAttributes;
      delete this._lockedAttributesValues;
    }
  }

  isLocking(attrName) {
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
  }

  isLocked(attrName, options) {
    const shouldSkipCheck = options?.skipcheck;
    if (!shouldSkipCheck) {
      const stopProcessing = !this.isLocking(attrName);
      if (stopProcessing) return;
    }

    return this.getLockCount(attrName) > 0;
  }

  getLockCount(attrName, options) {
    const shouldSkipCheck = options?.skipcheck;
    if (!shouldSkipCheck) {
      const stopProcessing = !this.isLocking(attrName);
      if (stopProcessing) return;
    }

    const isGettingValueForSpecificPlugin = options?.pluginName;
    if (isGettingValueForSpecificPlugin) {
      return this._lockedAttributesValues[attrName][options.pluginName] ? 1 : 0;
    }

    const lockingAttributeValues = Object.values(this._lockedAttributesValues[attrName]);
    const lockingAttributeValuesSum = lockingAttributeValues.reduce((sum, value) => sum + (value ? 1 : 0), 0);

    return lockingAttributeValuesSum;
  }

  setLockState(attrName, value, options) {
    const shouldSkipCheck = options?.skipcheck;
    if (!shouldSkipCheck) {
      const stopProcessing = !this.isLocking(attrName);
      if (stopProcessing) return this;
    }

    const isSettingValueForSpecificPlugin = options?.pluginName;
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

}
