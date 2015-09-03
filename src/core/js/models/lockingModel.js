define([
	'backbone'
], function() {

	var set = Backbone.Model.prototype.set;

	_.extend(Backbone.Model.prototype, {

		set: function(attrName, attrVal, options) {
			var stopProcessing = !this.lockedAttributes || typeof attrName === "object" || typeof attrVal !== "boolean" || !this.isLocking(attrName);
			if (stopProcessing) return set.apply(this, arguments);
			
			options = options || {};

			var isSettingValueForSpecificPlugin = options && options.pluginName;
			if (!isSettingValueForSpecificPlugin) {
				console.error("Must supply a pluginName to change a locked attribute");
				options.pluginName = "compatibility";
			}

			var pluginName  = options.pluginName;
			if (this.defaults[attrName] !== undefined) {
				this.lockedAttributes[attrName] = !this.defaults[attrName];
			}
			var lockingValue = this.lockedAttributes[attrName];
			var isAttemptingToLock = (lockingValue === attrVal);

			if (isAttemptingToLock) {

				this.setLockState(attrName, true, {pluginName:pluginName, skipcheck: true});

				//console.log(options.pluginName, "locking", attrName, "on", this.get("_id"));
				return set.call(this, attrName, lockingValue);

			}

			this.setLockState(attrName, false, {pluginName:pluginName, skipcheck: true});

			var totalLockValue = this.getLockCount(attrName, {skipcheck: true})
			//console.log(options.pluginName, "attempting to unlock", attrName, "on", this.get("_id"), "lockValue", totalLockValue, this._lockedAttributesValues[attrName]);
			if (totalLockValue === 0) {
				//console.log(options.pluginName, "unlocking", attrName, "on", this.get("_id"));
				return set.call(this, attrName, !lockingValue);
			}

			return this;

		},

		setLocking: function(attrName, defaultLockValue) {
			if (this.isLocking(attrName)) return;
			if (!this.lockedAttributes) this.lockedAttributes = {};
			this.lockedAttributes[attrName] = defaultLockValue;
		},

		unsetLocking: function(attrName) {
			if (!this.isLocking(attrName)) return;
			if (!this.lockedAttributes) return;
			delete this.lockedAttributes[attrName];
			delete this._lockedAttributesValues[attrName];
			if (_.keys(this.lockedAttributes).length === 0) {
				delete this.lockedAttributes;
				delete this._lockedAttributesValues;
			}
		},

		isLocking: function(attrName) {
			var isCheckingGeneralLockingState = (attrName === undefined);
			var isUsingLockedAttributes = (this.lockedAttributes !== undefined);

			if (isCheckingGeneralLockingState) {
				return isUsingLockedAttributes;
			}

			if (!isUsingLockedAttributes) return false;

			var isAttributeALockingAttribute = this.lockedAttributes[attrName] !== undefined;
			if (!isAttributeALockingAttribute) return false;

			if (this._lockedAttributesValues === undefined) {
				this._lockedAttributesValues = {};
			}

			if (this._lockedAttributesValues[attrName] === undefined) {
				this._lockedAttributesValues[attrName] = {};	
			}

			return true;
		},

		isLocked: function(attrName, options) {
			var shouldSkipCheck = (options && options.skipcheck);
			if (!shouldSkipCheck) { 
				var stopProcessing =  !this.isLocking(attrName);
				if (stopProcessing) return;
			}

			return this.getLockCount(attrName) > 0;
		},

		getLockCount: function(attrName, options) {
			var shouldSkipCheck = (options && options.skipcheck);
			if (!shouldSkipCheck) { 
				var stopProcessing =  !this.isLocking(attrName);
				if (stopProcessing) return;
			}

			var isGettingValueForSpecificPlugin = options && options.pluginName;
			if (isGettingValueForSpecificPlugin) {

				return this._lockedAttributesValues[attrName][options.pluginName] ? 1 : 0;
			}

			var lockingAttributeValues = _.values(this._lockedAttributesValues[attrName]);
			var lockingAttributeValuesSum = _.reduce(lockingAttributeValues, function(sum, value){ return sum + (value ? 1 : 0); }, 0);
			
			return lockingAttributeValuesSum;
		},

		setLockState: function(attrName, value, options) {
			var shouldSkipCheck = (options && options.skipcheck);
			if (!shouldSkipCheck) { 
				var stopProcessing =  !this.isLocking(attrName);
				if (stopProcessing) return this;
			}

			var isSettingValueForSpecificPlugin = options && options.pluginName;
			if (!isSettingValueForSpecificPlugin) {
				console.error("Must supply a pluginName to set a locked attribute lock value");
				options.pluginName = "compatibility";
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
