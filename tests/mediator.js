var Mediator    = require("../src/core/js/mediator"),
    assert      = require("assert");

describe("Mediator", function() {

    describe("#on", function() {

        it("Should call event handlers in the order in which they are added", function() {
            var sbox = new Mediator();
            var x = 1;
            sbox.on("test", function() {
                x += "1"; 
            });
            sbox.on("test", function() {
                x += 1; 
            });
            sbox.emit("test");
            assert.equal(x, "111");
            assert.notEqual(x, "21");
        });


    });

    describe("#default", function() {
    
        it("Should call default event last", function() {
        
            var sbox = new Mediator();
            var x = 1;
            sbox.default("test", function() {
                x += "1"; 
            });
            sbox.on("test", function() {
                x += 1; 
            });
            sbox.emit("test");
            assert.equal(x, "21");
            assert.notEqual(x, "111");
        
        });

        it("Should not allow events to be overridden", function() {
        
            var sbox = new Mediator();
            var x = 1;
            sbox.default("test", function() {
                x += "1"; 
            });
            sbox.default("test", function() {
                x += 1; 
            });
            sbox.emit("test");
            assert.equal(x, "11");
            assert.notEqual(x, 2);

        });
    
    });

    describe("#off", function() {

        it("Should remove specific callbacks, when passed channel and callback", function() {
            
            var sbox = new Mediator();
            var x = 1;
            var addOne = function addOne () {
                x += 1;
            };
            var addTen = function addTen () {
                x += 10;
            };
            sbox.on("test", addOne);
            sbox.on("test", addTen);
            sbox.emit("test");
            assert.equal(x, 12);
            sbox.off("test", addTen);
            sbox.emit("test");
            assert.equal(x, 13);

        });

        it("Should remove all callbacks, when passed just channel", function() {
            
            var sbox = new Mediator();
            var x = 1;
            var addOne = function addOne () {
                x += 1;
            };
            var addTen = function addTen () {
                x += 10;
            };
            sbox.on("test", addOne);
            sbox.on("test", addTen);
            sbox.emit("test");
            assert.equal(x, 12);
            sbox.off("test");
            sbox.emit("test");
            assert.equal(x, 12);

        });

    });

    describe("#emit", function() {
    
        it("Should call all callbacks on channel", function() {
        
            var callbackOneCalled = false;
            var callbackTwoCalled = false;
            var callbackThreeCalled = false;
            var defaultCallbackCalled = false;
            
            function callbackOne () {
                callbackOneCalled= true;
            }
            function callbackTwo () {
                callbackTwoCalled = true;
            }            
            function callbackThree () {
                callbackThreeCalled = true;
            }
            function defaultCallback () {
                defaultCallbackCalled = true;
            }

            var sbox = new Mediator();
            sbox.on("test", callbackOne);
            sbox.on("test", callbackTwo);
            sbox.on("test", callbackThree);
            sbox.default("test", defaultCallback);

            sbox.emit("test");
            assert(callbackOneCalled && callbackTwoCalled && callbackThreeCalled && defaultCallbackCalled);
        
        });

        it("Should pass callbacks an event object", function() {
            
            var eventObj;
            var sbox = new Mediator();
            sbox.on("test", function(event) {
                eventObj = event;
            });
            sbox.emit("test");
            assert.equal(eventObj.constructor, Object);

        });
    
    });

    describe(":event", function() {

        it("Should have 3 properties", function() {
            var numOfProps = 0, prop;
            var sbox = new Mediator();
            sbox.on("test", function(event) {
                for(prop in event){
                    numOfProps++;
                }
            });
            sbox.emit("test");
            assert.equal(numOfProps, 3);
        });

        it("Should pass first argument as data property", function() {
            var sbox = new Mediator();
            var firstParam = {
                name : "object"
            };
            sbox.on("test", function(event) {
                assert.equal(event.data, firstParam);
            });
            sbox.emit("test", firstParam);
        });

        it("Should pass all arguments as args property", function() {
            var sbox = new Mediator();
            var argumentsToPass = [5, { name: "object" }, true];
            sbox.on("test", function(event){
                assert.equal(event.args[0], argumentsToPass[0]);
                assert.equal(event.args[1], argumentsToPass[1]);
                assert.equal(event.args[2], argumentsToPass[2]);
            });
        });

        it("Should pass a preventDefault method", function() {
            var sbox = new Mediator();
            sbox.on("test", function(event){
                assert(event.preventDefault);
            });
            sbox.emit("test");
        });

        describe(".preventDefault", function() {
            
            it("Should stop the default event getting called", function() {
                
                var sbox = new Mediator();
                var num = 0;
                sbox.default("test", function() {
                    num++; 
                });
                sbox.emit("test");
                assert.equal(num, 1);
                sbox.on("test", function(event) {
                    event.preventDefault(); 
                });
                sbox.emit("test");
                assert.equal(num, 1);

            });

        });

    });


});
