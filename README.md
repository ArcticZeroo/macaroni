# Macaroni

Operator overloading for javascript!

![he is angry that you aren't using operator overloading in JS yet!](macaroni.png)

## Example

```typescript
import { operators, Operator } from 'macaroni';

class MyClass {
    constructor(readonly prop: number) {}
    
    [operators.add](other: any) {
        if (!(other instanceof MyClass)) {
            throw new TypeError('Cannot compare other type');
        }
        
        return new MyClass(this.prop + other.prop);
    }
}

const classA = new MyClass(3);
const classB = new MyClass(2);

const classC = classA + classB;
console.log(classC instanceof MyClass); // expected output: true
console.log(classC.prop); // expected output: 5

const manualAddition = Operator.add(classA, classB);
console.log(manualAddition instanceof MyClass); // again, true
console.log(manualAddition.prop); // I think you can figure this one out
```

## Usage

1. Install macaroni
2. Install your plugin of choice to transform the code into macaroni-able code (e.g. [babel-plugin-macaroni](https://github.com/arcticzeroo/babel-plugin-macaroni))
3. Run it!

## Caveats

- Type hinting is currently unsolved
- Requires a 3rd-party transformer unless you use `Operator` directly, which would be pretty weird
- Impossible to override behavior in engine classes such as `Set`, `Map` -- an "override" class is necessary for such behavior.
- `3 + instance` is not defined behavior at the current time, it currently relies on you to implement `[Symbol.toPrimitive]` 
- Requires symbol polyfill if being used in a browser context

## Supported Operators

To use these operators, import `operators` from this package (e.g. `import { operators } from 'macaroni'`) and use a computed property for `operators.$OPERATOR_NAME`. 

Notes:
- Where the primitive equivalent contains an "a" and a "b", the operator will be called with an additional "b" argument ("a" should be accessible from "this"). When there is no "b", no parameters will be passed.
- There is no "notEqual" of unsafe/strict, because it is inferred that notEqual is the opposite of equal.

Operator|Primitive Equivalent|Notes
---|---|---
add|a + b|
subtract|a - b|
multiply|a * b|
divide|a / b|
pow|a ** b|Equivalent to Math.pow(a, b) as well
mod|a % b|
lessThan|a < b|
lessEqual|a <= b|
greaterThan|a > b|
greaterEqual|a >= b||=
unsafeEqual|a == b|Advised against, hence the unsafe prefix
strictEqual|a === b|Use this one instead!
logicalAnd|a & b|
logicalOr|a &#124; b|
logicalXor|a ^ b|
logicalNot|~a|
leftShift|a << b|
rightShift|a >> b|
increment|++a or a++|Prefix and postfix are preserved, so behavior should be as expected for these cases.
decrement|--a or a++|See above note
negate|-a|
positive|+a|
not|!a|
getProperty|a[prop]|Requires capturePropertyAccess. Function signature is `[operator.getProperty](prop): void`
setProperty|a[prop] = val|Requires capturePropertyAccess. Function signature is `[operator.setProperty](prop, val): boolean`. You MUST return true in strict mode if you don't want to throw an error. If you're in sloppy mode, follow your dreams.

### Get/Set Traps

As you can see above, getProperty and setProperty are "supported". The only way for them to work is through ES6 Proxies, so you must wrap your class in a call to a helper method to use an ES6 Proxy for such a case.

Some notes:
- As mentioned above, you should probably return a bool in your setProperty trap if you don't want errors in strict mode (must return true for no error)
- This will probably significantly decrease performance for classes expecting a lot of property accesses/sets, please check benchmarks for ES6 proxies.
- set and get traps are both registered and will be called if they ever exist, so you may dynamically add/remove the overloads if you so wish (similarly to regular classes and such).
- If you only use get/set behavior, babel is not needed (it uses an ES6 Proxy only, which does not require )

### Usage

Note that this method can take a constructor (class declaration), an existing class instance, or a plain JS object.

```javascript
import { operators } from 'macaroni';

// method 1
class TrapClassExport {
   [operators.getProperty](prop) {
      // ...  
   }
}

export default capturePropertyAccess(TrapClassExport);

// method 2 (no change in functionality of course)
export default capturePropertyAccess(class TrapClassWrap {
   [operators.getProperty](prop) {
      // ...  
   }
});

// Can be used on objects...
const trapObject = capturePropertyAccess({
                      [operators.getProperty](prop) {
                         // ...
                      }
                   });

// ...or instantiated classes
const trapInstance = capturePropertyAccess(new TrapClass());
```

## Future Roadmap

- Manual hash table implementation
    - Necessary for OperatorMap, OperatorSet, OperatorArray
    - Should come with `operators.hash`
- Better TypeScript support
- Decorators for get/set traps (instead of the kind of messy capturePropertyAccess method)

