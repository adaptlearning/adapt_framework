define([
	'backbone'
], function() {

	var set = Backbone.Model.prototype.set;

	_.extend(Backbone.Model.prototype, {

		set: function(attrName, attrVal, options) {
			var stopProcessing = !this.lockedAttributes || typeof attrName === "object" || typeof attrVal !== "boolean" || !this.isLocking(attrName);
			if (stopProcessing) return set.apply(this, arguments);

			var isSettingValueForSpecificPlugin = options && options.pluginName;
			if (!isSettingValueForSpecificPlugin) {
				console.error("Must supply a pluginName to change a locked attribute");
				options.pluginName = "compatibility";
			}

			var pluginName  = options.pluginName;
			var lockingValue = this.lockedAttributes[attrName] = !this.defaults[attrName];
			var isAttemptingToLock = lockingValue === attrVal;

			if (isAttemptingToLock) {

				this.setLockValue(attrName, true, {pluginName:pluginName, skipcheck: true});

				//console.log(options.pluginName, "locking", attrName, "on", this.get("_id"));
				return set.call(this, attrName, lockingValue);

			}

			this.setLockValue(attrName, false, {pluginName:pluginName, skipcheck: true});

			var totalLockValue = this.getLockValue(attrName, {skipcheck: true})
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
			var isCheckingGeneralLockingState = attrName === undefined;
			var isUsinglockedAttributes = this.lockedAttributes !== undefined;

			if (isCheckingGeneralLockingState) {
				return isUsinglockedAttributes;
			}

			if (!isUsinglockedAttributes) return false;

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
			if (!(options && options.skipcheck)) { 
				var stopProcessing =  !this.isLocking(attrName);
				if (stopProcessing) return;
			}

			return this.getLockValue(attrName) > 0;
		},

		getLockValue: function(attrName, options) {
			if (!(options && options.skipcheck)) { 
				var stopProcessing =  !this.isLocking(attrName);
				if (stopProcessing) return;
			}

			var isGettingValueForSpecificPlugin = options && options.pluginName;
			if (isGettingValueForSpecificPlugin) {

				return this._lockedAttributesValues[attrName][options.pluginName] ? 1 : 0;
			}

			var lockingAttributeValues = _.values(this._lockedAttributesValues[attrName]);
			var lockingAttributeValuesSum = _.reduce(lockingAttributeValues, function(memo, value){ return memo + (value ? 1 : 0); }, 0);
			
			return lockingAttributeValuesSum;
		},

		setLockValue: function(attrName, value, options) {
			if (!(options && options.skipcheck)) { 
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