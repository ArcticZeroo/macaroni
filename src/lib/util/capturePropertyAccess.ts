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

const constructorTrap = {
    construct(target, args) {
        return new Proxy(new target(...args), propertyAccessorTrap);
    }
};

const capturePropertyAccess = (ctor: new (...args: any[]) => any) => new Proxy(ctor, constructorTrap);

export default capturePropertyAccess;