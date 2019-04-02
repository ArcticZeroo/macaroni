import operators from '../symbols/operators';

const propertyAccessorTrap = {
    get<T>(target: T, prop: keyof T): T[keyof T] {
        const overloaded = target[operators.getProperty];

        if (overloaded) {
            return overloaded(prop);
        }

        return target[prop];
    },

    set<T>(target: T, prop: keyof T, value: T[keyof T]): boolean {
        const overloaded = target[operators.setProperty];

        if (overloaded) {
            return overloaded(prop, value);
        }

        target[prop] = value;
        return true;
    }
};

const objectCapturePropertyAccess = (obj: any) => new Proxy(obj, propertyAccessorTrap);

const constructorTrap = {
    construct(target, args) {
        return objectCapturePropertyAccess(new target(...args));
    }
};

type Constructor = Function | (new (...args: any[]) => any);

const classCapturePropertyAccess = (ctor: Constructor) => new Proxy(ctor, constructorTrap);

function capturePropertyAccess(item: Constructor | object) {
    if (typeof item === 'function') {
        // assume constructor...
        return classCapturePropertyAccess(item);
    }

    return objectCapturePropertyAccess(item);
}

export default capturePropertyAccess;