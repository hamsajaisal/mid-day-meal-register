/**
 * Mid Day Meal (MDM) Register Calculation Engine
 * 
 * Based on equations from:
 * 1. Receipts: 'eq ashwin sir.jpeg'
 * 2. Payments: 'asw eq.jpeg'
 * 3. Monthly Double-Entry Register: 'mid day meal acnt.pdf'
 */

/**
 * Calculates a single day's double-entry account ledger.
 * 
 * @param {Object} params
 * @param {Object} params.openingBalance - { bank: number, cash: number }
 * @param {number} params.advanceFromHM - Cash advance received from Headmaster/Headmistress
 * @param {Array<{label: string, amount: number}>} params.bankCredits - Inflows like "Fund to Bank", "Sweep out", etc.
 * @param {number} params.otherCashIn - Additional cash received if any (defaults to 0)
 * @param {Array<{particulars: string, voucherNo: string, cash: number, bank?: number}>} params.expenses - List of payment items
 * @param {number} params.refundToHM - Cash refund to HM if any (defaults to 0)
 * @param {number} params.bankWithdrawals - Bank withdrawals if any (defaults to 0)
 */
function calculateDayLedger({
    openingBalance = { bank: 0, cash: 0 },
    advanceFromHM = 0,
    bankCredits = [],
    otherCashIn = 0,
    expenses = [],
    refundToHM = 0,
    bankWithdrawals = 0
}) {
    // -------------------------------------------------------------
    // 1. RECEIPTS CALCULATIONS (from eq ashwin sir.jpeg)
    // -------------------------------------------------------------
    
    // TOTAL: BANK = Sum of all 'Fund to Bank' / credit items
    const fundToBankTotal = bankCredits.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    const receiptsBankTotal = fundToBankTotal;

    // TOTAL: CASH = Advance from HM + Cash in (if any)
    const receiptsCashTotal = (Number(advanceFromHM) || 0) + (Number(otherCashIn) || 0);

    // TOTAL: TOTAL = BANK + CASH
    const receiptsTotal = receiptsBankTotal + receiptsCashTotal;

    // CASH IN HAND: BANK = Fund to Bank + Opening Balance
    const cashInHandBank = fundToBankTotal + (Number(openingBalance.bank) || 0);

    // CASH IN HAND: CASH = Opening Cash + Advance from HM + Cash (if any)
    const cashInHandCash = (Number(openingBalance.cash) || 0) + receiptsCashTotal;

    // CASH IN HAND: TOTAL = BANK + CASH
    const cashInHandTotal = cashInHandBank + cashInHandCash;

    // GRAND TOTAL: Matches CASH IN HAND
    const receiptsGrandTotal = {
        bank: cashInHandBank,
        cash: cashInHandCash,
        total: cashInHandTotal
    };

    // -------------------------------------------------------------
    // 2. PAYMENTS CALCULATIONS (from asw eq.jpeg)
    // -------------------------------------------------------------

    // Expense sums
    const expensesCashTotal = expenses.reduce((sum, item) => sum + (Number(item.cash) || 0), 0);
    const expensesBankTotal = expenses.reduce((sum, item) => sum + (Number(item.bank) || 0), 0);

    // TOTAL: BANK = Withdrawal from Bank + Expense from Bank
    const paymentsBankTotal = (Number(bankWithdrawals) || 0) + expensesBankTotal;

    // TOTAL: CASH = Expenses + Refund to HM
    const paymentsCashTotal = expensesCashTotal + (Number(refundToHM) || 0);

    // TOTAL: TOTAL = BANK + CASH
    const paymentsTotal = paymentsBankTotal + paymentsCashTotal;

    // BALANCE IN HAND: BANK = Opening Balance Bank + Fund to Bank - Withdrawal from Bank
    // which equals cashInHandBank - paymentsBankTotal
    const balanceInHandBank = cashInHandBank - paymentsBankTotal;

    // BALANCE IN HAND: CASH = Cash In Hand (Cash) - Payments Total (Cash)
    const balanceInHandCash = cashInHandCash - paymentsCashTotal;

    // BALANCE IN HAND: TOTAL = BANK + CASH
    const balanceInHandTotal = balanceInHandBank + balanceInHandCash;

    // GRAND TOTAL:
    // BANK = Payments Total (Bank) + Balance in Hand (Bank)
    const paymentsGrandTotalBank = paymentsBankTotal + balanceInHandBank;

    // CASH = Payments Total (Cash) + Balance in Hand (Cash)
    const paymentsGrandTotalCash = paymentsCashTotal + balanceInHandCash;

    // TOTAL = Payments Total (TOTAL) + Balance in Hand (TOTAL)
    const paymentsGrandTotalCombined = paymentsTotal + balanceInHandTotal;

    const paymentsGrandTotal = {
        bank: paymentsGrandTotalBank,
        cash: paymentsGrandTotalCash,
        total: paymentsGrandTotalCombined
    };

    // Verification check (Receipts Grand Total should equal Payments Grand Total)
    const isBalanced = (
        receiptsGrandTotal.bank === paymentsGrandTotal.bank &&
        receiptsGrandTotal.cash === paymentsGrandTotal.cash &&
        receiptsGrandTotal.total === paymentsGrandTotal.total
    );

    return {
        receipts: {
            openingBalance: {
                bank: Number(openingBalance.bank) || 0,
                cash: Number(openingBalance.cash) || 0,
                total: (Number(openingBalance.bank) || 0) + (Number(openingBalance.cash) || 0)
            },
            advanceFromHM: Number(advanceFromHM) || 0,
            bankCredits: [...bankCredits],
            fundToBankTotal,
            otherCashIn: Number(otherCashIn) || 0,
            total: {
                bank: receiptsBankTotal,
                cash: receiptsCashTotal,
                total: receiptsTotal
            },
            cashInHand: {
                bank: cashInHandBank,
                cash: cashInHandCash,
                total: cashInHandTotal
            },
            grandTotal: receiptsGrandTotal
        },
        payments: {
            expenses: [...expenses],
            refundToHM: Number(refundToHM) || 0,
            bankWithdrawals: Number(bankWithdrawals) || 0,
            total: {
                bank: paymentsBankTotal,
                cash: paymentsCashTotal,
                total: paymentsTotal
            },
            balanceInHand: {
                bank: balanceInHandBank,
                cash: balanceInHandCash,
                total: balanceInHandTotal
            },
            grandTotal: paymentsGrandTotal
        },
        closingBalance: {
            bank: balanceInHandBank,
            cash: balanceInHandCash
        },
        isBalanced,
        difference: receiptsGrandTotal.total - paymentsGrandTotal.total
    };
}

/**
 * Calculates a series of consecutive days for a month.
 * Automatically cascades each day's closing balance into the next day's opening balance.
 * 
 * @param {number} initialBankOpening - Starting Bank Balance of the 1st of the month
 * @param {number} initialCashOpening - Starting Cash Balance of the 1st of the month (usually 0)
 * @param {Array<Object>} rawDayEntries - List of day inputs
 * @param {number} aeoAdmitted - AEO Admitted amount for the month
 */
function calculateMonthLedger(initialBankOpening, initialCashOpening = 0, rawDayEntries = [], aeoAdmitted = 0) {
    let currentBankBalance = Number(initialBankOpening) || 0;
    let currentCashBalance = Number(initialCashOpening) || 0;

    const calculatedDays = [];

    for (const day of rawDayEntries) {
        const dayResult = calculateDayLedger({
            openingBalance: {
                bank: currentBankBalance,
                cash: currentCashBalance
            },
            advanceFromHM: day.advanceFromHM ?? 0,
            bankCredits: day.bankCredits || [],
            otherCashIn: day.otherCashIn ?? 0,
            expenses: day.expenses || [],
            refundToHM: day.refundToHM ?? 0,
            bankWithdrawals: day.bankWithdrawals ?? 0
        });

        calculatedDays.push({
            date: day.date,
            remarks: day.remarks || '',
            ...dayResult
        });

        // Carry forward to next day
        currentBankBalance = dayResult.closingBalance.bank;
        currentCashBalance = dayResult.closingBalance.cash;
    }

    // Month End Aggregations (as seen on Page 6 of PDF)
    const monthTotalReceiptsBank = calculatedDays.reduce((s, d) => s + d.receipts.total.bank, 0);
    const monthTotalReceiptsCash = calculatedDays.reduce((s, d) => s + d.receipts.total.cash, 0);
    const monthTotalReceiptsCombined = monthTotalReceiptsBank + monthTotalReceiptsCash;

    const monthTotalPaymentsBank = calculatedDays.reduce((s, d) => s + d.payments.total.bank, 0);
    const monthTotalPaymentsCash = calculatedDays.reduce((s, d) => s + d.payments.total.cash, 0);
    const monthTotalPaymentsCombined = monthTotalPaymentsBank + monthTotalPaymentsCash;

    const finalCashInHandBank = currentBankBalance;
    const finalCashInHandCash = monthTotalPaymentsCash; // Monthly cash turnover
    const finalReceiptsGrandTotal = finalCashInHandBank + finalCashInHandCash;

    const finalBalanceInHandBank = currentBankBalance;
    const finalBalanceInHandCash = currentCashBalance;
    const finalPaymentsGrandTotal = finalBalanceInHandBank + monthTotalPaymentsCash;

    // Balance to HM = Total Cash Expenses spent by HM (or cumulative balance)
    const balanceToHM = monthTotalPaymentsCash;

    return {
        initialOpening: { bank: Number(initialBankOpening) || 0, cash: Number(initialCashOpening) || 0 },
        days: calculatedDays,
        summary: {
            aeoAdmitted: Number(aeoAdmitted) || 0,
            totalOfMonth: {
                receipts: {
                    bank: monthTotalReceiptsBank,
                    cash: monthTotalReceiptsCash,
                    total: monthTotalReceiptsCombined
                },
                payments: {
                    bank: monthTotalPaymentsBank,
                    cash: monthTotalPaymentsCash,
                    total: monthTotalPaymentsCombined
                }
            },
            cashInHandMonth: {
                bank: finalCashInHandBank,
                cash: monthTotalReceiptsCash,
                total: finalReceiptsGrandTotal
            },
            balanceInHandMonth: {
                bank: finalBalanceInHandBank,
                cash: finalBalanceInHandCash,
                total: finalBalanceInHandBank + finalBalanceInHandCash
            },
            grandTotalMonth: {
                receipts: {
                    bank: finalCashInHandBank,
                    cash: monthTotalReceiptsCash,
                    total: finalReceiptsGrandTotal
                },
                payments: {
                    bank: finalBalanceInHandBank,
                    cash: monthTotalPaymentsCash,
                    total: finalPaymentsGrandTotal
                }
            },
            balanceToHM
        }
    };
}

// Support both Node.js (CommonJS) and browser/ES module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { calculateDayLedger, calculateMonthLedger };
}
