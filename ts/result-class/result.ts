// export type Option<T> = T | null

export type Result<T, E> = Ok<T> | Err<E>;
export type Existing<T> = T extends null | undefined | void
  //   | unknown
  ? never
  : T;

interface IResult<T, E> {
  // Properties
  readonly isOk: boolean; // Ok<T> = true  | Err<E> = false
  readonly isErr: boolean; // Ok<T> = false | Err<E> = true

  /**
   * Returns true if the result is Ok and the value inside of it matches a
   * closure test.
   * @param f Callback to test the T against.
   */
  isOkAnd(f: (ok: Readonly<T>) => boolean): boolean;

  /**
   * Returns true if the result is Err and the value inside of it matches a
   * closure test.
   * @param f Callback to test the E against.
   */
  isErrAnd(f: (err: Readonly<E>) => boolean): boolean;

  ok(): T | null;
  err(): E | null;

  // TODO:
  // map<U, F>(op: F): IResult<U, E>
  // mapOr(default: U, f: function): U
  // mapOrElse(default: U, f: function): U
  // mapErr<F, O>(op: O): Result<T

  /**
   * Calls the provided closure and applies it to the contained value (if Ok).
   * Does not mutate it in any way.
   * @param f Closure to be called.
   */
  inspect(f: (ok: Readonly<T>) => void): Result<T, E>;

  /**
   * Calls the provided closure with a reference to the contained error (if Err).
   * Does not mutate it in any way.
   * @param f Closure to be called.
   */
  inspectErr(f: (err: Readonly<E>) => void): Result<T, E>;

  // TODO:
  // pub fn iter()
  // pub fn iter_mut()

  // UNIMPLEMENTED:
  // unwrapOrDefault
  /**
   * Returns the contained Ok value, otherwise throws an error with the passed
   * message.
   * Because this function may throw, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the Err case explicitly,
   * or call either unwrapOr or unwrapOrElse.
   * @param {string} msg Error message.
   * @throws {Error}
   */
  expect(msg: string): T | never;

  /**
   * Returns the contained Err value, otherwise throws an error with the passed
   * message.
   * Because this function may throw, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the Err case explicitly,
   * or call either unwrapOr or unwrapOrElse.
   * @param {string} msg Error message.
   * @throws {Error}
   */
  expectErr(msg: string): E | never;

  /**
   * Returns the contained Ok value, otherwise throws an error.
   * Because this function may throw, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the Err case explicitly,
   * or call either unwrapOr or unwrapOrElse.
   */
  unwrap(): T | never;

  /**
   * Returns the contained Err value, otherwise throws an error.
   * Because this function may throw, its use is generally discouraged.
   * Instead, prefer to use pattern matching and handle the Err case explicitly,
   * or call either unwrapOr or unwrapOrElse.
   */
  unwrapErr(): E | never;

  // UNIMPLEMENTED:
  // into_ok
  // into_err

  /**
   * Returns res if the result is Ok, otherwise returns the Err value of self.
   * Arguments passed to and are eagerly evaluated; if you are passing the result of a function call, it is recommended
   * to use and_then, which is lazily evaluated.
   * @param res Other Result.
   * @returns
   */
  // Unstable... and weird. Just use andThen.
  and<T2>(res: Result<T2, E>): Result<T | T2, E>;
  and<T2, E2>(res: Result<T2, E>): Result<T2, E | E2>;

  /**
   * Calls the op if the Result is Ok, otherwise returns the Err value of self.
   * @param op Function to be called.
   */
  andThen<T2>(op: (arg: T) => Ok<T2>): Result<T | T2, E>;
  andThen<E2>(op: (arg: T) => Err<E2>): Result<T, E | E2>;
  andThen<T2, E2>(op: (arg: T) => Result<T2, E2>): Result<T | T2, E | E2>;

  /**
   * Returns res if the result is Err, otherwise returns the Ok value of self.
   */
  // Unstable... and weird. Just use orElse.
  or<E2>(res: Result<T, E2>): Result<T, E | E2>;
  or<T2, E2>(res: Result<T2, E2>): Result<T2 | T, E | E2>;

  /**
   * Call the op if the result is Err, otherwise returns the Ok value of self.
   * @param op Function to be called.
   */
  orElse<T2>(op: (arg: Readonly<E>) => Ok<T2>): Result<T | T2, E>;
  orElse<E2>(op: (arg: Readonly<E>) => Err<E2>): Result<T, E | E2>;
  orElse<T2, E2>(
    op: (arg: Readonly<E2>) => Result<T2, E2>,
  ): Result<T | T2, E | E2>;

  /**
   * Returns the contained Ok value or a provided default.
   * @param def Default value provided.
   */
  unwrapOr(def: T): T;

  /**
   * Returns the contained Ok value or computes it from a closure.
   * @param op
   */
  unwrapOrElse(op: (arg: Readonly<E>) => T): T;

  /**
   * Returns true if the result is an Ok value containing the given value.
   * @param x Value to compare.
   */
  // huh
  // contains<T2>(x: Readonly<T2>): boolean;

  /**
   * Returns true if the result is an Err value containing the given value.
   * @param f Value to compare.
   */
  // huh
  // contains<E2>(x: Readonly<E2>): boolean;
}

export class Ok<T> implements IResult<T, never> {
  // Properties
  public readonly isOk!: true;
  public readonly isErr!: false;
  private readonly value!: T;

  private constructor(value: NonNullable<T>) {
    this.isOk = true;
    this.isErr = false;
    this.value = value;
  }

  static wrap<T, E>(value: NonNullable<T>): Result<T, E> {
    return new Ok<T>(value);
  }

  isOkAnd(f: (ok: Readonly<T>) => boolean): boolean {
    return f(this.value);
  }

  isErrAnd(_f: (err: Readonly<never>) => boolean): boolean {
    return false;
  }

  ok() {
    return this.value;
  }
  err() {
    return null;
  }

  inspect(f: (ok: Readonly<T>) => void): Ok<T> {
    f(this.value);
    return this;
  }

  inspectErr(_f: unknown): Ok<T> {
    return this;
  }

  expect(_msg: string): T {
    return this.value;
  }
  expectErr(msg: string): never {
    throw new Error(`${msg}: ${this.value}`);
  }

  unwrap(): T {
    return this.value;
  }
  unwrapErr(): never {
    throw new Error(`Failed to unwrap Ok: ${this.value}`);
  }

  and<T2>(res: Ok<T2>): Ok<T2>;
  and<E2>(res: Result<T, E2>): Result<T, E2>;
  and<T2, E2>(res: Result<T2, E2>): Result<T2, E2>;
  public and<T2, E2>(res: Result<T2, E2>) {
    return res;
  }

  andThen<T2>(op: (val: T) => Ok<T2>): Ok<T2>;
  andThen<E2>(op: (val: T) => Err<E2>): Result<T, E2>;
  andThen<T2, E2>(op: (val: T) => Result<T2, E2>): Result<T2, E2>;
  public andThen<T2, E2>(op: (val: T) => Result<T2, E2>): Result<T2, E2> {
    return op(this.value);
  }

  or<T2>(_res: Ok<T2>): Ok<T2>;
  or<E2>(_res: Result<T, E2>): Result<T, E2>;
  or<T2, E2>(_res: Result<T2, E2>): Result<T2, E2>;
  public or<T2, E2>(_res: Result<T2, E2>) {
    return this;
  }

  orElse(_op: unknown): Ok<T> {
    return this;
  }

  unwrapOr(_def: T): T {
    return this.value;
  }

  unwrapOrElse(_op: unknown): T {
    return this.value;
  }
}

export class Err<E> implements IResult<never, E> {
  // Properties
  public readonly isOk!: false;
  public readonly isErr!: true;
  private readonly value!: E;

  private constructor(value: Existing<E>) {
    this.isOk = false;
    this.isErr = true;
    this.value = value;
  }

  public static wrap<T, E>(value: Existing<E>): Result<T, E> {
    return new Err<E>(value);
  }

  public isOkAnd(_f: (ok: Readonly<never>) => boolean): boolean {
    return false;
  }

  public isErrAnd(f: (err: Readonly<E>) => boolean): boolean {
    return f(this.value);
  }

  public ok() {
    return null;
  }
  public err() {
    return this.value;
  }

  public inspect(_f: unknown): Err<E> {
    return this;
  }

  inspectErr(f: (err: Readonly<E>) => void): Err<E> {
    f(this.value);
    return this;
  }

  expect(msg: string): never {
    throw new Error(`${msg}: ${this.value}`);
  }
  expectErr(_msg: string): E {
    return this.value;
  }

  unwrap(): never {
    throw new Error(`Failed to unwrap Err: ${this.value}`);
  }
  unwrapErr(): E {
    return this.value;
  }

  and<E2>(res: Err<E2>): Err<E2>;
  and<T2>(res: Ok<T2>): Result<T2, E>;
  and<T2, E2>(res: Result<T2, E2>): Result<T2, E2>;
  public and<T2, E2>(_res: Result<T2, E2>) {
    return this;
  }

  andThen(_op: unknown): Err<E> {
    return this;
  }

  or<E2>(res: Err<E2>): Err<E2>;
  or<T2>(res: Ok<T2>): Result<T2, E>;
  or<T2, E2>(res: Result<T2, E2>): Result<T2, E2>;
  public or<T2, E2>(res: Result<T2, E2>): Result<T2, E2> {
    return res;
  }

  orElse<E2>(op: (arg: Readonly<E>) => Err<E2>): Err<E2>;
  orElse<T2>(op: (arg: Readonly<E>) => Ok<T2>): Result<T2, E>;
  orElse<T2, E2>(op: (arg: Readonly<E2>) => Result<T2, E2>): Result<T2, E | E2>;
  orElse<T2, E2>(op: (arg: Readonly<E>) => Result<T2, E2>): Result<T2, E2> {
    return op(this.value);
  }

  unwrapOr<T2>(def: T2): T2 {
    return def;
  }

  unwrapOrElse<T2>(op: (arg: Readonly<E>) => Existing<T2>): T2 {
    return op(this.value);
  }
} 
