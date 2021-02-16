# hooklib
a wip hooking library for javascript.
Not to mention, hooklib automatically provides hook concealment.

# usage
```js
var hooklib = new hookLibrary();

//async
// scope, property, callback
hooklib.catch(window, 'foo', function (value) {
  return value * 2; 
});
```
Because var method is async and it needs a configurable property to run,
it must finish before `foo` is declared.

```js
//declaring foo in window
var foo = 10;

console.log(foo) // -> 20
```
Here's the same example but with a already defined configurable property.
```js
var hooklib = new hookLibrary();

var obj = { foo: 10 };

//async
// scope, property, callback
hooklib.catch(obj, 'foo', function (value) {
  return value * 2; 
});

console.log(obj.foo) // -> 20
```
