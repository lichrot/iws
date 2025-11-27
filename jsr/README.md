# [@qnd/iws] Set, both Weak and Iterable

[![Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](https://opensource.org/license/apache-2-0)
[![JSR Version](https://jsr.io/badges/@qnd/iws)](https://jsr.io/@qnd/iws)
[![NPM Version](https://img.shields.io/npm/v/@qnd/iws)](https://www.npmjs.com/package/@qnd/iws)

[WeakSet](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet)
made iterable.

## [💾] Installation

Choose your fighter:

```sh
npm   install @qnd/iws
yarn  add     @qnd/iws
pnpm  install @qnd/iws
deno  install jsr:@qnd/iws
```

## [💀] Example

```ts
import { IterableWeakSet } from "@qnd/iws";

const set = new IterableWeakSet<(() => void)>();

const listener = () => console.log("event");
set.add(listener);
for (const item of set) item();
set.delete(listener);
```

## [🖥️] Tasks

```sh
# Run tests
deno task test

# Run publishing in dry mode
deno task dry-run

# Prepare for publishing (does all of the above)
deno task prepare

# Publish to JSR and NPM
deno task publish
```

## [📝] License

This work is licensed under
[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0) (see
[NOTICE](/NOTICE)).
