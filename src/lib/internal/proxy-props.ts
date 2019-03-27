import operators from '../symbols/operators';

const getTrap = (target, prop) => {
    if (target[operators.getItem]) {
        return target[operators.getItem](prop);
    }

    return target[prop];
};

const setTrap = (target, prop, value) => {
    if (target[operators.setItem]) {
        return target[operators.setItem](prop, value);
    }

    return target[prop] = value;
};

type Newable = new (...args: any[]) => any;

const constructTrap = (target: Newable, args: any[]) => new Proxy(new target(...args), {
    get: getTrap,
    set: setTrap
});


const wrapClassOperators = (newable: Newable) => new Proxy(newable, { construct: constructTrap });

export default wrapClassOperators;