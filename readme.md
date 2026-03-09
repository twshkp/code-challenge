# 99Tech Code Challenge

This repository contains solutions to three coding problems. Each problem is in its own folder under `src/`.

## Table of Contents

- [99Tech Code Challenge](#99tech-code-challenge)
  - [Table of Contents](#table-of-contents)
  - [Problem 1 - Sum to N](#problem-1---sum-to-n)
  - [Problem 2 - Currency Swap Form](#problem-2---currency-swap-form)
  - [Problem 3 - WalletPage Analysis](#problem-3---walletpage-analysis)
  - [Prerequisites](#prerequisites)

---

## Problem 1 - Sum to N

**What it is:** Three different JavaScript implementations of a function that calculates the sum of all integers from 1 to `n`.

**Where:** `src/problem1/index.js`

**The three approaches:**

1. **Gauss's Formula** — uses the math formula `n * (n + 1) / 2` for instant O(1) calculation
2. **Iterative Loop** — adds numbers one by one using a `for` loop
3. **Recursion** — calls itself repeatedly, adding `n + sum_to_n(n - 1)`

**How to run:**

```bash
cd src/problem1
node index.js
```

You can test them by adding this at the bottom of `index.js`:

```js
console.log(sum_to_n_a(10)); // 55
console.log(sum_to_n_b(10)); // 55
console.log(sum_to_n_c(10)); // 55
```

---

## Problem 2 - Currency Swap Form

**What it is:** A web application that lets users swap between different currencies. It features a modern dark UI with token selection, live exchange rates, input validation, and a confirmation dialog.

**Where:** `src/problem2/`

**Tech stack:** Vite + React + TypeScript + Tailwind CSS + shadcn/ui

**Features:**

- Two currency selectors with searchable dropdowns and token icons
- Auto-calculated exchange rates (fetched from a live API)
- Swap direction button to flip the from/to tokens
- Input validation (empty fields, insufficient balance, min/max amounts)
- Confirmation dialog (desktop) or bottom sheet (mobile) before executing swap
- Loading spinner and success animation
- Fully responsive design

**How to run:**

```bash
# 1. Go to the project folder
cd src/problem2

# 2. Install dependencies (only needed the first time)
npm install

# 3. Start the development server
npm run dev
```

This will start a local server (usually at `http://localhost:5173`). Open that URL in your browser to see the app.

**How to build for production:**

```bash
npm run build
```

The output will be in the `src/problem2/dist/` folder, ready to be deployed to any static hosting service.

---

## Problem 3 - WalletPage Analysis

**What it is:** A written analysis of a React component (`WalletPage`) that contains bugs, performance issues, and anti-patterns. Includes both the analysis and a refactored version.

**Where:** `src/problem3/`

**Files:**

- `analysis.md` — detailed breakdown of 16 issues found in the original code (bugs, type errors, performance problems, and anti-patterns)
- `refactored.tsx` — a clean rewrite that fixes all identified issues

---

## Prerequisites

To work with these solutions, you'll need:

- **Node.js** (version 18 or higher) — [download here](https://nodejs.org/)
