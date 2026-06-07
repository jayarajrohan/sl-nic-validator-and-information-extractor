# sl-nic-validator-and-information-extractor

[![npm version](https://img.shields.io/npm/v/sl-nic-validator-and-information-extractor.svg)](https://www.npmjs.com/package/sl-nic-validator-and-information-extractor)
[![downloads](https://img.shields.io/npm/dm/sl-nic-validator-and-information-extractor.svg)](https://www.npmjs.com/package/sl-nic-validator-and-information-extractor)
[![minzipped size](https://img.shields.io/bundlephobia/minzip/sl-nic-validator-and-information-extractor.svg)](https://bundlephobia.com/package/sl-nic-validator-and-information-extractor)
[![types](https://img.shields.io/npm/types/sl-nic-validator-and-information-extractor.svg)](https://www.npmjs.com/package/sl-nic-validator-and-information-extractor)
[![license](https://img.shields.io/npm/l/sl-nic-validator-and-information-extractor.svg)](./LICENSE)

Validate Sri Lankan **National Identity Card (NIC)** numbers and extract the date of birth, age, and gender encoded inside them. Supports both the **old format** (9 digits + a `V`/`X` suffix) and the **new format** (12 digits).

- **Zero runtime dependencies**
- **TypeScript-first** — ships full type declarations
- **Dual module output** — works with both ESM (`import`) and CommonJS (`require`)
- Tiny and dependency-free, so it drops into any JavaScript runtime or framework

> **Ecosystem note:** This is an npm package, so it runs anywhere JavaScript runs — Node.js, browsers, and JS/TS frameworks. It cannot be imported directly into non-JavaScript languages (Python, Java, C#, Go, etc.). If you need it there, expose it behind a small HTTP endpoint (see the [Express](#expressnodejs-backend) example) and call that from any language.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [API Reference](#api-reference)
- [Usage by Environment](#usage-by-environment)
  - [TypeScript / ESM](#typescript--esm)
  - [Node.js (CommonJS)](#nodejs-commonjs)
  - [React](#react)
  - [Next.js](#nextjs-api-route)
  - [Vue 3](#vue-3)
  - [Angular](#angular)
  - [Express (Node.js backend)](#expressnodejs-backend)
  - [Browser (no build step)](#browser-no-build-step)
- [How the NIC Format Works](#how-the-nic-format-works)
- [Behavior & Edge Cases](#behavior--edge-cases)
- [License](#license)

## Installation

```bash
npm install sl-nic-validator-and-information-extractor
```

```bash
yarn add sl-nic-validator-and-information-extractor
```

```bash
pnpm add sl-nic-validator-and-information-extractor
```

```bash
bun add sl-nic-validator-and-information-extractor
```

## Quick Start

```ts
import {
  isValidSlNic,
  extractDetailsFromSlNic,
} from "sl-nic-validator-and-information-extractor";

isValidSlNic("972002662V");   // true
isValidSlNic("199720002662"); // true  (new 12-digit format)
isValidSlNic("hello");        // false

extractDetailsFromSlNic("972002662V");
// {
//   dateOfBirth: "1997-07-18",
//   age: 28,            // computed relative to today's date
//   gender: "Male"
// }

extractDetailsFromSlNic("invalid"); // undefined
```

## API Reference

### `isValidSlNic(nic: string): boolean`

Returns `true` if the string is a structurally valid old- or new-format Sri Lankan NIC, `false` otherwise. Input is trimmed and case-normalized before checking, so `" 972002662v "` is accepted.

```ts
isValidSlNic("972002662V");   // true  — old format
isValidSlNic("199720002662"); // true  — new format
isValidSlNic("970002662V");   // false — invalid day-of-year (000)
isValidSlNic("12345");        // false — wrong length
```

### `extractDetailsFromSlNic(nic: string): INicDetails | undefined`

Parses a valid NIC and returns the decoded details. Returns `undefined` if the NIC is invalid, so it doubles as a validity check.

```ts
interface INicDetails {
  dateOfBirth: string; // ISO date, "YYYY-MM-DD"
  age: number;         // whole years, relative to today's date
  gender: string;      // "Male" | "Female"
}
```

```ts
const details = extractDetailsFromSlNic("977002662V");
// { dateOfBirth: "1997-07-18", age: 28, gender: "Female" }
```

## Usage by Environment

### TypeScript / ESM

```ts
import {
  isValidSlNic,
  extractDetailsFromSlNic,
  type INicDetails,
} from "sl-nic-validator-and-information-extractor";

const nic = "199720002662";

if (isValidSlNic(nic)) {
  const details: INicDetails | undefined = extractDetailsFromSlNic(nic);
  console.log(details);
}
```

### Node.js (CommonJS)

```js
const {
  isValidSlNic,
  extractDetailsFromSlNic,
} = require("sl-nic-validator-and-information-extractor");

console.log(isValidSlNic("972002662V")); // true
console.log(extractDetailsFromSlNic("972002662V"));
```

### React

```tsx
import { useState } from "react";
import {
  isValidSlNic,
  extractDetailsFromSlNic,
} from "sl-nic-validator-and-information-extractor";

export function NicInput() {
  const [nic, setNic] = useState("");

  const touched = nic.length > 0;
  const valid = isValidSlNic(nic);
  const details = valid ? extractDetailsFromSlNic(nic) : undefined;

  return (
    <div>
      <input
        value={nic}
        onChange={(e) => setNic(e.target.value)}
        placeholder="Enter NIC number"
      />

      {touched && !valid && <p style={{ color: "red" }}>Invalid NIC number</p>}

      {details && (
        <ul>
          <li>Date of birth: {details.dateOfBirth}</li>
          <li>Age: {details.age}</li>
          <li>Gender: {details.gender}</li>
        </ul>
      )}
    </div>
  );
}
```

### Next.js (API Route)

```ts
// app/api/nic/route.ts  (App Router)
import { NextResponse } from "next/server";
import {
  isValidSlNic,
  extractDetailsFromSlNic,
} from "sl-nic-validator-and-information-extractor";

export async function POST(request: Request) {
  const { nic } = await request.json();

  if (!isValidSlNic(nic)) {
    return NextResponse.json({ error: "Invalid NIC" }, { status: 400 });
  }

  return NextResponse.json(extractDetailsFromSlNic(nic));
}
```

### Vue 3

```vue
<script setup lang="ts">
import { ref, computed } from "vue";
import {
  isValidSlNic,
  extractDetailsFromSlNic,
} from "sl-nic-validator-and-information-extractor";

const nic = ref("");
const valid = computed(() => isValidSlNic(nic.value));
const details = computed(() =>
  valid.value ? extractDetailsFromSlNic(nic.value) : undefined
);
</script>

<template>
  <input v-model="nic" placeholder="Enter NIC number" />
  <p v-if="nic && !valid">Invalid NIC number</p>
  <ul v-if="details">
    <li>Date of birth: {{ details.dateOfBirth }}</li>
    <li>Age: {{ details.age }}</li>
    <li>Gender: {{ details.gender }}</li>
  </ul>
</template>
```

### Angular

A reusable Reactive Forms validator:

```ts
import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { isValidSlNic } from "sl-nic-validator-and-information-extractor";

export const slNicValidator: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  if (!control.value) return null; // let `required` handle empties
  return isValidSlNic(control.value) ? null : { invalidNic: true };
};
```

```ts
// In a component
import { FormControl } from "@angular/forms";
import { slNicValidator } from "./sl-nic.validator";

nicControl = new FormControl("", [slNicValidator]);
```

### Express (Node.js backend)

This is also the pattern to follow if you need NIC validation from a non-JavaScript language — call this endpoint over HTTP.

```js
import express from "express";
import {
  isValidSlNic,
  extractDetailsFromSlNic,
} from "sl-nic-validator-and-information-extractor";

const app = express();
app.use(express.json());

app.post("/nic", (req, res) => {
  const { nic } = req.body;

  if (!isValidSlNic(nic)) {
    return res.status(400).json({ error: "Invalid NIC" });
  }

  res.json(extractDetailsFromSlNic(nic));
});

app.listen(3000);
```

### Browser (no build step)

The package ships ESM, so it loads directly from an ESM CDN such as [esm.sh](https://esm.sh) — no bundler required:

```html
<script type="module">
  import {
    isValidSlNic,
    extractDetailsFromSlNic,
  } from "https://esm.sh/sl-nic-validator-and-information-extractor";

  console.log(isValidSlNic("972002662V")); // true
  console.log(extractDetailsFromSlNic("972002662V"));
</script>
```

## How the NIC Format Works

Every Sri Lankan NIC encodes the holder's birth year, day of birth, and gender.

**Old format** — 9 digits followed by a letter, e.g. `972002662V`:

| Part        | Example | Meaning                                                        |
| ----------- | ------- | -------------------------------------------------------------- |
| Year        | `97`    | Last two digits of the birth year (interpreted as `19xx`)      |
| Day of year | `200`   | Day of the year (1–366); **+500 for females**                  |
| Serial      | `2662`  | Sequential / uniqueness digits                                 |
| Suffix      | `V`     | `V` or `X`                                                     |

**New format** — 12 digits, e.g. `199720002662`:

| Part        | Example | Meaning                                |
| ----------- | ------- | -------------------------------------- |
| Year        | `1997`  | Full four-digit birth year             |
| Day of year | `200`   | Day of the year (1–366); +500 females  |
| Serial      | `02662` | Sequential / uniqueness digits         |

The day-of-year uses a fixed 366-day calendar (it always reserves a slot for Feb 29). Females have **500 added** to the day, so the valid ranges are **001–366** for males and **501–866** for females.

## Behavior & Edge Cases

- **Whitespace and case** — input is trimmed and uppercased, so `" 972002662v "` validates the same as `"972002662V"`.
- **Old-format century** — old NICs are interpreted as `19xx` birth years.
- **Age is dynamic** — `age` is computed against the current date at call time, so the same NIC returns a different age over time.
- **February 29** — because the format reserves day 60 for Feb 29 in every year, a non-leap birth year can decode to a calendar date that didn't technically occur (e.g. `"1997-02-29"`). This is faithful to what the card encodes. If you'd rather reject such impossible dates, that guard is a one-line change in the source.

## License

[MIT](./LICENSE) © rohan_jayaraj
