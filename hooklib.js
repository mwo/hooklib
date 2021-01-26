class hookLibrary {
    constructor() {
        //hide getter and setter
        var _this = this,
            _Object = Object,
            original_descriptors = Object.getOwnPropertyDescriptors,
            original_descriptor = Object.getOwnPropertyDescriptor;

        Object.getOwnPropertyDescriptors = function (_object) {
            var result = original_descriptors.apply(this, arguments),
                scopeIndex = _this.scopes.indexOf(_object);

            if (scopeIndex > -1) {
                var values = _this.scopev[scopeIndex],
                    entries = _Object.entries(result);
                for (var i = 0; i < entries.length; i++) {
                    var key = 0, value = 1,
                        element = entries[i];
                    if (element[key] in values)
                        entries[i][value] = {
                            configurable: true,
                            enumerable: true,
                            value: values[element[key]],
                            writable: true
                        };
                }

                result = _Object.fromEntries(entries);
            }

            return result;
        }

        Object.getOwnPropertyDescriptor = function (_object, key) {
            var result = original_descriptor.apply(this, arguments),
                scopeIndex = _this.scopes.indexOf(_object);

            if (scopeIndex > -1) {
                var values = _this.scopev[scopeIndex];

                if (key in values) {
                    result = {
                        configurable: true,
                        enumerable: true,
                        value: values[key],
                        writable: true
                    };
                }
            }
            return result;
        }

        this.hides.conceal_string(original_descriptors, Object.getOwnPropertyDescriptors);
        this.hides.conceal_string(original_descriptor, Object.getOwnPropertyDescriptor);

        //keep original
        this.original_descriptor = original_descriptor;
    }

    def(type, obj, key, func, configurable = true) {
        //remove
        if (key in obj && obj[key]) {
            var val = obj[key];
            delete obj[key];
        }

        Object.defineProperty(obj, key,{
            [type]: func,
            configurable
        });


        //restore
        if (val && type == 'set')
            obj[key] = val;
    }

    hides = {
        orientedRecursion(value){
            var _static = new Proxy(value, {
                get() { return _static; }
            });
            return _static;
        },
        conceal_string(original, hooked) {
            var original_res = original.toString();
            hooked.toString = function () {
                return original_res;
            };

            hooked.toString.toString = this.orientedRecursion(function() {
                return "function toString() { [native code] }"
            });
        },
        conceal_lookup(_object) {
            //hide lookup getter / setter
            for (var tmp of "GS") {
                var method = `__lookup${tmp}etter__`,
                    orig = _object[method];
                    //_object[method] = function () {}; //return nothing
               // this.conceal_string(orig, _object[method]);
            }
        }
    }

    //for tracking objects and scopes
    scopes = [];
    scopev = [];

    catch(scope, key, callback) {
        var descriptor = this.original_descriptor(scope, key);

        //:)
        if (descriptor && descriptor.configurable == false)
            throw Error(`"${key}" is unconfigurable!`);

        var scopeIndex = this.scopes.indexOf(scope),
            notFound = scopeIndex < 0;

        if (notFound) {
            this.scopes.push(scope);
            this.scopev.push({});

            this.hides.conceal_lookup(scope);
        }

        var _this = this.scopev[notFound + scopeIndex];

        function scopeManager(av) {
            return ({
                //set
                true(value){
                    _this[key] = callback(value);
                },
                //get
                false(){
                    return _this[key];
                }
            })[0 in arguments](av);
        }

        for (var type of ['set','get'])
            this.def(type, scope, key, scopeManager);
    }

    // I actually iterate the argument object.
    // the last two paramerter names are for ease of use
    // scope, ...keys, callback
    catchLast(scope, u_iterated_keys, u_callback) {
        var args = [...arguments],
            callback = args.pop(),
            keys = args.slice(1);

        var index = 0,
            _this = this;
        void function recursive(value) {
            _this.catch(value, keys[index], index++ < keys.length - 1 ? recursive : callback);
            return value;
        }(scope);
    }
}
