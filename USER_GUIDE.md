# Mid Day Meal Accounts Register – Friendly User Guide 📘

Welcome! Managing daily school meal accounts on paper registers can be tiring—adding up every single day's vegetable and condiment receipts, making sure bank and cash columns balance to the exact rupee, and carrying forward closing balances day after day. 

This little app is designed to do all the heavy lifting for you. It looks and feels just like the two-page paper register book you are already familiar with, but with one big difference: **you only type the basic daily expenses, and the app calculates everything else automatically.**

Whether you are using a screen reader (like NVDA or JAWS) or looking at the screen, this guide will walk you through everything step by step.

---

## 1. Getting Started in 2 Minutes

### Installing the App
1. Download the installer file: **[Download Mid Day Meal Register Setup (Windows)](https://github.com/hamsajaisal/mid-day-meal-register/releases/download/v1.0.1/Mid.Day.Meal.Register.Setup.1.0.0.exe)**
2. Run the downloaded file and click **Next** and **Install**.
3. You’ll find a **Mid Day Meal Register** icon sitting right on your desktop and in your Windows Start menu.
4. Open it! It runs completely on your computer—no internet connection needed.

### Setting Up Your School
When you first open the app, look at the top bar:
* **School Name:** Type your school’s name (e.g. *Government High School, Aluva*). This name will show up on all your official printed reports.
* **Month & Year:** Type the month you're working on (e.g. *October 2026*).
* **Month Start Bank (₹):** Type the bank balance you started the month with (for instance, *₹6,191*).

You only need to set this once at the start of the month!

---

## 2. Understanding the Screen: An Open Register Book

The app is laid out just like opening a physical accounts notebook on your desk:

* **The Left Side (Receipts — Money In):**  
  Treated with gentle green and teal colors. This side keeps track of:
  * Your opening balance for the day (carried forward automatically from yesterday).
  * Any cash advance given by the Headmaster/Headmistress (HM).
  * Any funds credited directly to the school bank account (like scheme allocations or sweep-ins).
  * Today’s **Cash in Hand** and **Grand Total**.

* **The Right Side (Payments — Money Spent):**  
  Treated with warm amber and orange tones. This side lists:
  * What you bought today (e.g. *For Vegetables*, *For Milk*, *For Eggs*).
  * Voucher bill numbers.
  * Today’s **Total Payments**, your remaining **Balance in Hand**, and the **Grand Total**.

* **The Status Badge (Center Top):**  
  A bright green badge that proudly says **"Ledger Balanced ✔"** when your Receipts match your Payments. If there’s ever a typo or mismatch, it turns warm orange to warn you and shows the exact rupee difference.

---

## 3. Your 30-Second Daily Routine

Entering a regular day takes less than a minute. Here is all you have to do:

1. **Pick the Date:**  
   Click or select the date you want to record (e.g. *01/08/2025*).
2. **Add Today’s Expenses (Right Side):**  
   * Type what was purchased (e.g., *For Vegetables*).
   * Enter the bill/voucher number (e.g., *401*).
   * Enter the amount paid in cash (e.g., *2467*).
   * *Need more rows?* Click **➕ Add Expense Item** (or press <kbd>Alt + A</kbd>) to add items like eggs, spices, or milk.
3. **Advance from HM (Left Side):**  
   * By default, the app automatically syncs the cash advance from the HM to match today’s cash expenses. If the HM gave a different amount, you can simply type that number in.
4. **Hit "Calculate All" (<kbd>Alt + C</kbd>):**  
   * That’s it! The app instantly updates the bank balances, adds up totals, calculates closing balances, and carries the balance straight into the next day.

---

## 4. Special Situations Made Simple

* **"What if the government deposited funds into the school bank account today?"**  
  On the Left (Receipts) side, go to **Fund To Bank** and type the credited amount (e.g. *80096*). Today’s bank balance will immediately increase. If there were multiple sweep-ins on the same day, click **+ Add Sweep** to add another line.
* **"How do I add the next school day?"**  
  Click the **Add Day** button (<kbd>Alt + N</kbd>). The app automatically creates the next date and brings forward yesterday’s closing bank and cash balance into today’s opening balance.
* **"Can I see the month-end total?"**  
  Click **Month Summary** (<kbd>Alt + M</kbd>). A tidy card pops up showing your total receipts for the whole month, total expenses, ending bank balance, and the final balance owed to the HM.

---

## 5. Screen Reader Tips (For Blind Users)

If you use NVDA, JAWS, or Windows Narrator, the entire app was built with you in mind:

* **Spoken Feedback:** Whenever you calculate, switch dates, or add an item, the app speaks what happened immediately through a live announcement (e.g., *"Calculations complete. Accounts are balanced. Receipts and Payments Grand Total both equal ₹8,658"*).
* **Logical Tab Movement:** When you press `Tab`, you only jump between fields you actually need to type into. You won't get bogged down in non-editable summary boxes.
* **Direct Shortcuts:** You don't have to search around with your mouse. Use these easy shortcuts anytime:
  * <kbd>Alt + C</kbd> → **Calculate All**
  * <kbd>Alt + N</kbd> → **Add New Day**
  * <kbd>Alt + A</kbd> → **Add Expense Item**
  * <kbd>Alt + M</kbd> → **Open Month Summary**
  * <kbd>Alt + S</kbd> → **Save your data**
  * <kbd>Ctrl + P</kbd> → **Print or Export to PDF**

---

## 6. Saving, Printing, and Handing Over

* **Saving Your Work (<kbd>Alt + S</kbd>):**  
  Click **Save** anytime. It creates a neat backup file (like `MDM_SchoolName_October_2026.json`) on your computer. Keep this file safe on your pendrive or school computer.
* **Opening Past Months:**  
  Click **Open** to load any past month's saved file to review or print old accounts.
* **Official Printout (<kbd>Ctrl + P</kbd>):**  
  Click **Print / PDF**. The app cleans away all buttons, neatens the borders, and formats the two pages side-by-side onto standard A4 paper, perfectly matching the official physical register book for inspecting officers (AEO/DEO).
