type AnyFunction = (...args: any[]) => void;

type WithoutMethods<T> = { [Key in keyof T as T[Key] extends AnyFunction ? never : Key]: T[Key] };

export type EntityInterface<Entity> = WithoutMethods<Entity>;
