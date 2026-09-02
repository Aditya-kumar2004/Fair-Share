# Bugs found

Add one section per issue. Bug 1 is filled in to show the format — fix it, then write what you changed. Copy the blank template for the rest.

Keep this file in the repo and **commit it** with your fixes.

---

## Bug 1

**How to reproduce:** Open the app and check the expenses list. The header says "Newest first", but "Wine" (7 Mar) shows up at the top while "Board game" (15 Mar) is down below.

**What is wrong:** The expenses were sorting backwards — oldest first instead of newest first.

**What I changed:** Updated `dateValue` in `src/lib/format.js` to parse dates into timestamp numbers (`getTime()`), then flipped the sort order in `src/components/ExpenseList.jsx` to `dateValue(b.date) - dateValue(a.date)` so newest items stay at the top.

---

## Bug 2

**How to reproduce:** Look at the Balances section. Aisha Khan owes money to the group, but her card says "is owed $85.00" in green. Meanwhile, Ben and Diya paid more than their share, but show up as "owes" in red text.

**What is wrong:** The balance labels and colors were swapped around. Positive numbers (people who should get money back) were showing up red as "owes", and negative numbers were showing green as "is owed".

**What I changed:** Fixed the condition inside `src/components/BalancesPanel.jsx`. Now positive numbers (`bal > 0.005`) render `is owed` with the green `owed` class, and negative numbers (`bal < -0.005`) render `owes` with the red `owe` class.

---

## Bug 3

**How to reproduce:** Look at the "Uber to airport" expense ($60). Diya Patel paid for it, but only Aisha and Ben were marked to split it (`splitWith: [1, 2]`). Check Diya's final balance.

**What is wrong:** `computeBalances` was subtracting a share of the bill from Diya even though she wasn't part of the split. Because of that extra subtraction, she was only credited $30 instead of getting her full $60 back, which threw off the whole group balance.

**What I changed:** Removed the extra subtraction logic in `src/lib/balances.js` (lines 16–19). If someone pays for a bill but isn't splitting it, they shouldn't have any share taken out.

---

## Bug 4

**How to reproduce:** Set up a situation where someone owes $50 and someone else is owed $50. Check the "Settle up" list.

**What is wrong:** The settlement suggestions completely skipped transactions where the debt matched the credit exactly. In `suggestSettlements`, when `d.amount === c.amount`, it bumped both pointers without actually recording the payment.

**What I changed:** Rewrote the settlement loop in `src/lib/settle.js` to take `amount = Math.min(d.amount, c.amount)`, add that transfer to the list, deduct it from both balances, and move the pointers forward whenever a balance reaches zero.

---

## Bug 5

**How to reproduce:** Go to the Filter bar at the top and pick a person from the "Paid by" dropdown (like "Aisha Khan").

**What is wrong:** The list immediately says "No expenses match these filters", even though there are expenses paid by her.

**What I changed:** The `<select>` element returns a string like `"1"`, but the expense object stored `paidBy` as a number `1`. Strict comparison (`e.paidBy !== paidBy`) was failing every time. Fixed it in `src/App.jsx` by converting both values to strings with `String(e.paidBy) !== String(paidBy)`.

---

## Bug 6

**How to reproduce:** 
1. Open the app (where "Board game" is the first row on screen, but "Groceries" is at index 0 in the actual data array).
2. Click "Delete" on "Board game".
3. "Groceries" gets deleted instead!
4. Modifying amounts or deleting items while filters are active breaks the wrong row too.

**What is wrong:** `ExpenseList` was using the index of the sorted/filtered array and passing that index to `onDeleteAt` and `onUpdateAt`. The reducer was deleting `state.expenses[action.index]`, which pointed to a completely different item in the main store array. Also, using `key={index}` was messing up React's state management for the input fields.

**What I changed:** 
1. Updated the reducer in `src/state/store.js` to handle `DELETE_EXPENSE` and `UPDATE_EXPENSE` using unique `action.id` instead of array index.
2. Updated `src/App.jsx` to pass `onDelete` and `onUpdate` handlers that take an ID.
3. Updated `src/components/ExpenseList.jsx` to use `key={expense.id}` and pass `expense.id` whenever deleting or saving amount changes.

---

## Bug 7

**How to reproduce:** Type a name in the "Add member" box (like "Elena") and click Add.

**What is wrong:** The total member count goes up to 5, but the new person doesn't show up in the "Paid so far" list below until you add or edit an expense.

**What I changed:** In `src/components/SummaryCards.jsx`, `members` was missing from the `useMemo` dependency array for `perPerson`. Changed `[expenses]` to `[members, expenses]` so adding a member updates the UI right away.

---

## Bug 8

**How to reproduce:** Add an expense with "Custom %" split and enter percentages like 10.1% and 89.9%. Hit Save.

**What is wrong:** The form throws an error saying "Percentages must add to 100", even though 10.1 + 89.9 = 100. Classic JS floating point bug — `10.1 + 89.9` evaluates to `100.00000000000001`, so `=== 100` failed.

**What I changed:** In `src/lib/money.js`, updated `percentsSumTo100` to allow a tiny tolerance margin (`Math.abs(sum - 100) < 0.001`) instead of checking for exact equality.

---

## Bug 9

**How to reproduce:** Split $10.00 equally between 3 people (or $100.00 between 6 people). Look at the balances and settlement list.

**What is wrong:** The split helper functions were just calling `toFixed(2)` on each person's share independently. For $10 split 3 ways, everyone got $3.33, which adds up to $9.99 (losing a penny). For $100 split 6 ways, everyone got $16.67, which sums to $100.02 (creating two pennies out of thin air). Because of these tiny rounding errors, the group net total never added up to zero, leaving leftover debt that couldn't be settled.

**What I changed:** Rewrote `splitEqual` and `splitByPercent` in `src/lib/money.js`. Now they work in total cents, calculate the base share, and distribute any leftover pennies one by one across participants so the individual shares always add up to the exact total amount of the bill.

---

## Bug 10

**How to reproduce:** Choose "Custom %" split in the Add Expense form and try to type a decimal percentage like `33.33` or `12.5`.

**What is wrong:** As soon as you type the decimal point (`"33."`), the input handler ran `Number(e.target.value)`. That turned `"33."` back into `33`, so React immediately re-rendered the input box and wiped out the dot you just typed.

**What I changed:** In `src/components/AddExpenseForm.jsx`, kept the raw text string in state while typing so you can type dots and clear fields normally. The string only gets converted to a number when validating and submitting the form.

---

## Bug 11

**How to reproduce:** Open the app or add an expense on a computer set to a Western timezone (like US Eastern or Pacific time).

**What is wrong:** Dates stored as `"YYYY-MM-DD"` (like `"2026-03-12"`) were being parsed with `new Date("2026-03-12")`, which JS interprets as midnight UTC. In timezones behind UTC, calling `toLocaleDateString()` pulled the date back to the night before, so March 12 ended up showing as March 11.

**What I changed:** In `src/state/store.js` (`hydrate`) and `src/components/AddExpenseForm.jsx`, parsed the `"YYYY-MM-DD"` string manually into year, month, and day parts (`new Date(year, month - 1, day)`). Creating a local date instance directly keeps the calendar date consistent no matter what timezone the user is in.
