# hooklib
a wip hooking library for javascript.

# usage
```js
var hooklib = new hookLibrary();

// scope, property, callback
hooklib.var(window, 'foo', function (value) {
  return value * 2; 
});

//declaring foo in window
var foo = 10;

console.log(foo) // -> 20
```
Not to mention, hooklib automatically hides the getter and setter changes.
