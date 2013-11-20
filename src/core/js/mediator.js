function Mediator(target){

    var channels = {}, 
        i, 
        list, 
        args, 
        A = Array, 
        evt, 
        prvntDef = false, 
        channel, 
        obj = (target || this);

    obj.on = function(type, func, ctx){
        (channels[type] = channels[type] || []).push({f:func, c:ctx});
    };

    obj.default = function(type, func, ctx){
        channel = channels[type] = channels[type] || [];
        channel.default = channel.default || {f:func, c:ctx};
    };

    obj.off = function(type, func){
        list = channels[type] || [];
        i = list.length = func ? list.length : 0;
        while(~--i<0) {
            if(func === list[i].f){
                list.splice(i,1);
            }
        }
    };

    obj.emit = function(){
        args = A.apply([], arguments);
        list = channels[args.shift()] || [];
        evt = {
            data: args[0],
            args: args,
            preventDefault: function(){ prvntDef = true; }
        };
        i = -1;
        while(list[++i]) { 
            list[i].f.call(list[i].c, evt);
        }
        if(!prvntDef && !!list.default) {
            list.default.f.call(list.default.c, evt);
        }
        prvntDef = false;
    };
}

/**
 * Export for AMD and CJS 
 */
if(typeof define === "function"){
    define([], function(){ return Mediator; });
} else if (typeof exports !== "undefined"){
    module.exports = Mediator;
}
