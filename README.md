# Macaroni

Operator overloading for javascript!

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

1. Install babel and macaroni
2. Add macaroni as a babel plugin, either by doing `macaroni` or `macaroni/babel-plugin` (babel normalizes plugin names)
3. By default, this plugin uses 'import' to import dependencies automatically. If you would like to use require, add an option `importType` with value `require` (the value `import` can also be explicitly set) like so:

```typescript
{
    plugins: [
        ['macaroni', { importType: 'require' }]
    ]
}
``` 

## Caveats

- Type hinting is currently unsolved
- Requires a 3rd-party transformer unless you use `Operator`
- Impossible to override behavior in engine classes such as `Set`, `Map` -- an "override" class is necessary for such behavior.
- `3 + instance` is not defined behavior at the current time
- Requires symbol polyfill if being used in a browser context (well, it also requires imports so I guess browser is slightly out of  the question)