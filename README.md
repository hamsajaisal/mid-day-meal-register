# Mid Day Meal (MDM) Accounts Register - Windows Application

An accessible, double-entry cash and bank accounting ledger designed specifically for the school **Mid Day Meal Scheme (PM POSHAN)**.

---

### 📥 Quick Links
* 🚀 **[Download Windows Installer (.exe)](https://github.com/hamsajaisal/mid-day-meal-register/releases/download/v1.0.1/Mid.Day.Meal.Register.Setup.1.0.0.exe)**
* 📖 **[Read the Friendly User Guide (Step-by-Step)](USER_GUIDE.md)**

---

## 🌟 Key Features

1. **Exact Register Equations Implemented:**
   - **Receipts:**
     - $\text{Total Bank} = \sum \text{Fund to Bank}$
     - $\text{Total Cash} = \text{Advance from HM} + \text{Cash In}$
     - $\text{Cash in Hand (Bank)} = \text{Fund to Bank} + \text{Opening Balance}$
     - $\text{Cash in Hand (Cash)} = \text{Opening Cash} + \text{Advance from HM}$
     - $\text{Grand Total} = \text{Cash in Hand}$
   - **Payments:**
     - $\text{Total Cash} = \sum \text{Expenses} + \text{Refund to HM}$
     - $\text{Total Bank} = \text{Withdrawal from Bank}$
     - $\text{Balance in Hand (Bank)} = \text{Cash in Hand (Bank)} - \text{Bank Withdrawal}$
     - $\text{Balance in Hand (Cash)} = \text{Cash in Hand (Cash)} - \text{Payments Total (Cash)}$
     - $\text{Grand Total} = \text{Payments Total} + \text{Balance in Hand}$
   - **Daily Auto-Cascade:**
     - Each day's closing Balance in Hand automatically becomes the next day's Opening Balance.
   - **Real-Time Verification:**
     - An instant Emerald Green status badge confirms when Receipts and Payments balance.

2. **Visually Friendly Design (For Sighted Staff):**
   - **Open Ledger Book View:** Dual side-by-side pages mimicking the physical register book (Receipts on Left with calm Emerald/Teal accents, Payments on Right with warm Terracotta accents).
   - **Clear Field Indicators:** Required input fields are distinctly highlighted, while automatically calculated formula fields are displayed with clean tabular badges.
   - **Print to PDF:** Direct official 2-page printout layout formatted for A4 landscape paper.

3. **100% Screen Reader Accessible (NVDA / JAWS / Narrator):**
   - Built to WAI-ARIA standards with explicit labels on every control.
   - `aria-live="polite"` dynamic voice announcements whenever calculations update or dates change.
   - Fast keyboard navigation with standard shortcuts:
     - <kbd>Alt + C</kbd>: Recalculate whole month
     - <kbd>Alt + N</kbd>: Add a new day
     - <kbd>Alt + A</kbd>: Add a new expense item
     - <kbd>Alt + M</kbd>: Toggle Month Summary
     - <kbd>Alt + S</kbd>: Save data backup
     - <kbd>Ctrl + P</kbd>: Print or Export to PDF

---

## 🚀 Automated Cloud Build via GitHub Actions

This repository includes `.github/workflows/build-windows.yml`.

When you push this repository to GitHub:
1. GitHub Actions automatically installs all dependencies and runs the mathematical equation unit tests.
2. It compiles the Windows application into a standard **Windows Setup Installer (`.exe`)**.
3. You can download the installable `.exe` from the **GitHub Actions Artifacts** or **Releases** tab and install it on any Windows PC.

---

## 🛠 Local Development & Testing

Run unit tests directly:
```powershell
npm test
```

To run in Electron locally (after running `npm install`):
```powershell
npm start
```
