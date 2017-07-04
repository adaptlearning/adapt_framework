//2017-03-06 BASIC ENUMERATION SUPPORT https://github.com/cgkineo/enum
(function() {

    function ENUM(namesArray, lookupModifierFunction) {

        if (!(namesArray instanceof Array)) throw "First argument of ENUM must be an array";

        var lookupHash = {};

        // Create lookup & storage function
        var ENUMERATION = function(lookupValue){

            if (lookupModifierFunction) {
                lookupValue = lookupModifierFunction(lookupValue);
            }

            lookupValue = lookupHash[lookupValue];
           
            return ENUMERATION[lookupValue];

        };

        for (var i = 0, l = namesArray.length; i < l; i++) {

            var names = namesArray[i];
            if (!(names instanceof Array)) names = [names];

            // Make each value a power of 2 to allow for bitwise switches
            var value = Math.pow(2, i);
            var baseName = names[0];
            lookupHash[baseName] = baseName;

            for (var n = 0, m = names.length; n < m; n++) {

                var name = names[n];

                // Create Number object to allow for primitive comparisons and JSON stringify
                var entry = new Number(value);

                // Assign conversion values to entry
                entry.asString = name;
                entry.asLowerCase = name.toLowerCase();
                entry.asUpperCase = name.toUpperCase();
                entry.asInteger = value;

                // Reference lookup & storage function from each entry
                entry.ENUM = ENUMERATION;

                // Add entry to lookup & storage function
                if (n == 0) {

                    // Add primary name as enumerable property
                    ENUMERATION[name] = entry;

                    // Add value to lookup hash
                    lookupHash[value] = baseName;

                } else {

                    // Add alias to lookup hash
                    lookupHash[name] = baseName;

                }

            }

        }

        // Freeze ENUM object
        if (Object.freeze) Object.freeze(ENUMERATION);

        return ENUMERATION;

    };
    
    window.ENUM = ENUM;
    
})();