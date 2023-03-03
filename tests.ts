import { assertEquals, assertThrows } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { Result, Ok, Err } from "./result.ts";

Deno.test("Boolean properties", () => {
    const ok: Result<number, number> = Ok.wrap(1);
    assertEquals(ok.isOk ,  true);
    assertEquals(ok.isErr, false);

    const err: Result<number, number> = Err.wrap(0);
    assertEquals(err.isErr,  true);
    assertEquals(err.isOk , false);
});


Deno.test("isOkAnd()", () => {
    const x: Result<number, string> = Ok.wrap(2);
    assertEquals(x.isOkAnd((x) => x > 1), true);

    const y: Result<number, string> = Ok.wrap(0);
    assertEquals(y.isOkAnd((y) => y > 1), false);

    const z: Result<number, string> = Err.wrap("hey");
    assertEquals(z.isOkAnd((z) => z > 1), false);
});


Deno.test("isErrAnd()", () => {
    const x: Result<number, Error> = Err.wrap(TypeError("Mock type error!"));
    assertEquals(x.isErrAnd((err) => err instanceof TypeError), true);

    const y: Result<number, Error> = Err.wrap(RangeError("Mock range error"));
    assertEquals(y.isErrAnd((err) => err instanceof TypeError), false);

    const z: Result<number, Error> = Ok.wrap(123);
    assertEquals(z.isErrAnd((err) => err instanceof TypeError), false);
});


Deno.test("Nullable unwraps", () => {
    const x = Ok.wrap<number, string>(2);
    assertEquals(x.ok() ,    2);
    assertEquals(x.err(), null);

    const y = Err.wrap<number, string>("Nothing here!");
    assertEquals(y.err(), "Nothing here!");
    assertEquals(y.ok() ,            null);
});


Deno.test("Inspect Result", () => {
    let stdout = "";
    let stderr = "";

    const x = Ok.wrap(2)
                .inspect((x) => stdout += `${x}`);
                
    assertEquals(x, Ok.wrap(2));
    assertEquals(stdout, "2");

    const y = Err.wrap("filepath.txt")
                 .inspectErr((y) => stderr += `${y} not found!`);
    
    assertEquals(y, Err.wrap("filepath.txt"));
    assertEquals(stderr, "filepath.txt not found!");
});


Deno.test("expect()", () => {
    const x = Ok.wrap(2);
    assertEquals(x.expect("NOOOOOOOOOO!!!"), 2);

    assertThrows(() => Err.wrap(0).expect("WHAT?!?!: 0"));
});


Deno.test("expectErr()", () => {
    const x = Err.wrap(2);
    assertEquals(x.expectErr("NOOOOOOOOOO!!!"), 2);

    assertThrows(() => Ok.wrap(0).expectErr("WHAT?!?!: 0"));
});


Deno.test("unwrap()", () => {
    const x = Ok.wrap(2);
    assertEquals(x.unwrap(), 2);

    const y = Err.wrap("Oh no!!!!!");
    assertThrows(() => y.unwrap());
});


Deno.test("unwrapErr()", () => {
    const x = Err.wrap<number, number>(2);
    assertEquals(x.unwrapErr(), 2);

    const y = Ok.wrap<number, number>(0);
    assertThrows(() => y.unwrapErr());
});


Deno.test("and()", () => {
    const x1 = Ok.wrap<number, string>(2);
    const y1 = Err.wrap<string, string>("late error");
    assertEquals(x1.and(y1), Err.wrap("late error"));

    const x2 = Err.wrap<number, string>("early error");
    const y2 = Ok.wrap<string, string>("foo");
    assertEquals(x2.and(y2), Err.wrap("early error"));

    const x3 = Err.wrap<number, string>("not a 2");
    const y3 = Ok.wrap<string, string>("late error");
    assertEquals(x3.and(y3), Err.wrap("not a 2"));

    const x4 = Ok.wrap<number, string>(2);
    const y4 = Ok.wrap<string, string>("different result type");
    assertEquals(x4.and(y4), Ok.wrap("different result type"));
});


Deno.test("andThen()", () => {
    const factToString = (x: number): Result<string, string> => {
        if (x < 0) return Err.wrap("Number is too small!");
    
        let result = 1;
        for (let i = 1; i <= x; i++) result *= i;

        return Ok.wrap(result.toString());
    }

    assertEquals(Ok.wrap(5).andThen((x) => factToString(x)), Ok.wrap(String(120)));
    assertEquals(Ok.wrap(-1_000_000).andThen((x) => factToString(x)), Err.wrap("Number is too small!"));
    assertEquals(Err.wrap("not a number").andThen((x) => factToString(x)), Err.wrap("not a number"));
});


Deno.test("or()", () => {
    const x1: Result<number, string> = Ok.wrap(2);
    const y1: Result<number, string> = Err.wrap("late error");
    assertEquals(x1.or(y1), Ok.wrap(2));

    const x2: Result<number, string> = Err.wrap("early error");
    const y2: Result<number, string> = Ok.wrap(2);
    assertEquals(x2.or(y2), Ok.wrap(2));

    const x3: Result<number, string> = Err.wrap("not a 2");
    const y3: Result<number, string> = Err.wrap("late error");
    assertEquals(x3.or(y3), Err.wrap("late error"));

    const x4: Result<number, string> = Ok.wrap(2);
    const y4: Result<number, string> = Ok.wrap(100);
    assertEquals(x4.or(y4), Ok.wrap(2));
});


Deno.test("orElse()", () => {
    const sq  = (x: number): Result<number, number> => Ok.wrap(x * x);
    const err = (x: number): Result<number, number> => Err.wrap(x);

    assertEquals(Ok.wrap(2).orElse(sq).orElse(sq), Ok.wrap(2));
    assertEquals(Ok.wrap(2).orElse(err).orElse(sq), Ok.wrap(2));
    assertEquals(Err.wrap(3).orElse(sq).orElse(err), Ok.wrap(9));
    assertEquals(Err.wrap(3).orElse(err).orElse(err), Err.wrap(3));
});


Deno.test("unwrapOr()", () => {
    const def = 2;
    const a: Result<number, string> = Ok.wrap(9);
    assertEquals(a.unwrapOr(def), 9)
    
    const b = Err.wrap<number, string>("Whoops");
    assertEquals(b.unwrapOr(def), def);
});


Deno.test("unwrapOrElse()", () => {
    const x: Result<number, string> = Ok.wrap(2);
    assertEquals(x.unwrapOrElse((err) => err.length), 2);

    const y: Result<number, string> = Err.wrap("Whoops.");
    assertEquals(y.unwrapOrElse((err) => err.length), 7);
});
