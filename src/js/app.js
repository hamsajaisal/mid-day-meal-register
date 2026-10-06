/**
 * Mid Day Meal (MDM) Register - Frontend Application Controller
 */

// Application State
let appState = {
    monthYear: "August 2025",
    initialBankOpening: 6191,
    initialCashOpening: 0,
    aeoAdmitted: 172074,
    currentDayIndex: 0,
    days: []
};

// Formatter for Indian Currency Display
function formatINR(number) {
    if (isNaN(number) || number === null || number === undefined) return '0';
    return new Intl.NumberFormat('en-IN').format(Math.round(number));
}

// Accessible Screen Reader Announcer
function announceToSR(message) {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
        announcer.textContent = '';
        setTimeout(() => {
            announcer.textContent = message;
        }, 50);
    }
}

// Initialize Application
function initApp() {
    // Load saved data or sample August 2025 data
    const saved = localStorage.getItem('mdm_register_state');
    if (saved) {
        try {
            appState = JSON.parse(saved);
        } catch (e) {
            loadDefaultData();
        }
    } else {
        loadDefaultData();
    }

    setupEventListeners();
    populateDateSelector();
    recalculateEntireMonth();
    renderCurrentDay();

    announceToSR(`Mid Day Meal Register ready. Loaded ${appState.days.length} entries for ${appState.monthYear}. Press Alt plus C to calculate, or Tab to navigate.`);
}

function loadDefaultData() {
    if (typeof sampleAugust2025Data !== 'undefined') {
        appState = JSON.parse(JSON.stringify(sampleAugust2025Data));
    } else {
        appState = {
            monthYear: "August 2025",
            initialBankOpening: 6191,
            initialCashOpening: 0,
            aeoAdmitted: 172074,
            currentDayIndex: 0,
            days: [
                {
                    date: "01/08/2025",
                    advanceFromHM: 2467,
                    bankCredits: [],
                    expenses: [{ particulars: "For Vegetables", voucherNo: "401", cash: 2467, bank: 0 }]
                }
            ]
        };
    }
    appState.currentDayIndex = 0;
}

// Setup Event Listeners
function setupEventListeners() {
    // Header inputs
    document.getElementById('month-year-select').addEventListener('input', (e) => {
        appState.monthYear = e.target.value;
        saveToLocalStorage();
    });

    document.getElementById('initial-bank-opening').addEventListener('input', (e) => {
        appState.initialBankOpening = parseFloat(e.target.value) || 0;
        recalculateEntireMonth();
        renderCurrentDay();
        saveToLocalStorage();
    });

    // Date selector
    document.getElementById('date-selector').addEventListener('change', (e) => {
        appState.currentDayIndex = parseInt(e.target.value, 10);
        renderCurrentDay();
        announceToSR(`Switched to date ${appState.days[appState.currentDayIndex].date}`);
    });

    document.getElementById('btn-prev-day').addEventListener('click', () => {
        if (appState.currentDayIndex > 0) {
            appState.currentDayIndex--;
            document.getElementById('date-selector').value = appState.currentDayIndex;
            renderCurrentDay();
            announceToSR(`Previous day: ${appState.days[appState.currentDayIndex].date}`);
        }
    });

    document.getElementById('btn-next-day').addEventListener('click', () => {
        if (appState.currentDayIndex < appState.days.length - 1) {
            appState.currentDayIndex++;
            document.getElementById('date-selector').value = appState.currentDayIndex;
            renderCurrentDay();
            announceToSR(`Next day: ${appState.days[appState.currentDayIndex].date}`);
        }
    });

    // Toolbar buttons
    document.getElementById('btn-calculate').addEventListener('click', () => {
        recalculateEntireMonth();
        renderCurrentDay();
        const current = getCurrentDayCalculated();
        const msg = current.isBalanced
            ? `Calculations complete. Accounts are balanced. Receipts and Payments Grand Total both equal ₹${formatINR(current.receipts.grandTotal.total)}.`
            : `Calculations complete. Warning: difference of ₹${formatINR(Math.abs(current.difference))} detected between Receipts and Payments.`;
        announceToSR(msg);
    });

    document.getElementById('btn-new-day').addEventListener('click', addNewDay);

    document.getElementById('btn-add-expense-row').addEventListener('click', () => {
        addExpenseRow();
    });

    document.getElementById('btn-add-sweep').addEventListener('click', () => {
        addSweepRow();
    });

    document.getElementById('btn-toggle-summary').addEventListener('click', () => {
        const panel = document.getElementById('month-summary-panel');
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'block' : 'none';
        if (isHidden) {
            updateMonthSummaryUI();
            panel.scrollIntoView({ behavior: 'smooth' });
            announceToSR('Opened Month-End Summary panel.');
        }
    });

    document.getElementById('btn-close-summary').addEventListener('click', () => {
        document.getElementById('month-summary-panel').style.display = 'none';
        announceToSR('Closed Month-End Summary.');
    });

    document.getElementById('input-aeo-admitted').addEventListener('input', (e) => {
        appState.aeoAdmitted = parseFloat(e.target.value) || 0;
        updateMonthSummaryUI();
        saveToLocalStorage();
    });

    // Inputs on current day
    document.getElementById('input-advance-hm').addEventListener('input', (e) => {
        const day = appState.days[appState.currentDayIndex];
        if (day) {
            day.advanceFromHM = parseFloat(e.target.value) || 0;
            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
        }
    });

    document.getElementById('input-fund-bank').addEventListener('input', (e) => {
        const day = appState.days[appState.currentDayIndex];
        if (day) {
            if (!day.bankCredits) day.bankCredits = [];
            const fundCredit = day.bankCredits.find(c => c.label === 'Fund To Bank');
            const val = parseFloat(e.target.value) || 0;
            if (fundCredit) {
                fundCredit.amount = val;
            } else if (val > 0) {
                day.bankCredits.unshift({ label: 'Fund To Bank', amount: val });
            }
            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
        }
    });

    document.getElementById('input-bank-withdrawal').addEventListener('input', (e) => {
        const day = appState.days[appState.currentDayIndex];
        if (day) {
            day.bankWithdrawals = parseFloat(e.target.value) || 0;
            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
        }
    });

    // Save and Print buttons
    document.getElementById('btn-save').addEventListener('click', exportData);
    document.getElementById('btn-print').addEventListener('click', handlePrint);
    document.getElementById('btn-load-sample').addEventListener('click', () => {
        if (confirm('Reset to original August 2025 register data?')) {
            loadDefaultData();
            populateDateSelector();
            recalculateEntireMonth();
            renderCurrentDay();
            saveToLocalStorage();
            announceToSR('Reset to original August 2025 data.');
        }
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.altKey && e.key.toLowerCase() === 'c') {
            e.preventDefault();
            document.getElementById('btn-calculate').click();
        } else if (e.altKey && e.key.toLowerCase() === 'n') {
            e.preventDefault();
            document.getElementById('btn-new-day').click();
        } else if (e.altKey && e.key.toLowerCase() === 'a') {
            e.preventDefault();
            document.getElementById('btn-add-expense-row').click();
        } else if (e.altKey && e.key.toLowerCase() === 'm') {
            e.preventDefault();
            document.getElementById('btn-toggle-summary').click();
        } else if (e.altKey && e.key.toLowerCase() === 's') {
            e.preventDefault();
            document.getElementById('btn-save').click();
        } else if (e.ctrlKey && e.key.toLowerCase() === 'p') {
            e.preventDefault();
            handlePrint();
        }
    });
}

function handlePrint() {
    if (window.electronAPI && window.electronAPI.exportPDF) {
        window.electronAPI.exportPDF();
    } else {
        window.print();
    }
}

function exportData() {
    const dataStr = JSON.stringify(appState, null, 2);
    if (window.electronAPI && window.electronAPI.saveData) {
        window.electronAPI.saveData(dataStr).then(res => {
            if (res.success) {
                announceToSR('Register backup successfully saved to file.');
            }
        });
    } else {
        // Fallback for browser download
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `MDM-Register-${appState.monthYear.replace(/\s+/g, '-')}.json`;
        a.click();
        URL.revokeObjectURL(url);
        announceToSR('Register backup downloaded.');
    }
}

function populateDateSelector() {
    const selector = document.getElementById('date-selector');
    selector.innerHTML = '';
    appState.days.forEach((day, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `Entry #${index + 1}: ${day.date}`;
        selector.appendChild(option);
    });
    selector.value = appState.currentDayIndex;
}

function addNewDay() {
    const lastDay = appState.days[appState.days.length - 1];
    let newDate = "30/08/2025";
    if (lastDay && lastDay.date) {
        const parts = lastDay.date.split('/');
        if (parts.length === 3) {
            const nextDayNum = parseInt(parts[0], 10) + 1;
            newDate = `${nextDayNum.toString().padStart(2, '0')}/${parts[1]}/${parts[2]}`;
        }
    }

    const newDayObj = {
        date: newDate,
        advanceFromHM: 0,
        bankCredits: [],
        expenses: [
            { particulars: "For Vegetables", voucherNo: "", cash: 0, bank: 0 }
        ]
    };

    appState.days.push(newDayObj);
    appState.currentDayIndex = appState.days.length - 1;

    populateDateSelector();
    recalculateEntireMonth();
    renderCurrentDay();
    saveToLocalStorage();

    announceToSR(`Added new entry for date ${newDate}. Focus moved to new day.`);
}

function addExpenseRow(particulars = "", voucherNo = "", cash = 0, bank = 0) {
    const currentDay = appState.days[appState.currentDayIndex];
    if (!currentDay.expenses) currentDay.expenses = [];

    currentDay.expenses.push({ particulars, voucherNo, cash, bank });
    renderExpenseRows();
    recalculateEntireMonth();
    renderCurrentDaySummaryOnly();
    saveToLocalStorage();

    // Focus newly added input
    const inputs = document.querySelectorAll('.expense-particulars-input');
    if (inputs.length > 0) {
        inputs[inputs.length - 1].focus();
    }
    announceToSR(`Added new expense row. You can type item name.`);
}

function addSweepRow() {
    const currentDay = appState.days[appState.currentDayIndex];
    if (!currentDay.bankCredits) currentDay.bankCredits = [];

    currentDay.bankCredits.push({ label: 'Fund To Bank (Sweep out)', amount: 0 });
    renderAdditionalBankCredits();
    recalculateEntireMonth();
    renderCurrentDaySummaryOnly();
    saveToLocalStorage();

    announceToSR(`Added sweep out row to bank credits.`);
}

// Recalculates whole month cascade
let monthlyCalcResult = null;
function recalculateEntireMonth() {
    if (typeof calculateMonthLedger === 'function') {
        monthlyCalcResult = calculateMonthLedger(
            appState.initialBankOpening,
            appState.initialCashOpening,
            appState.days,
            appState.aeoAdmitted
        );
    }
}

function getCurrentDayCalculated() {
    if (monthlyCalcResult && monthlyCalcResult.days[appState.currentDayIndex]) {
        return monthlyCalcResult.days[appState.currentDayIndex];
    }
    // Fallback if not yet calculated
    return calculateDayLedger({
        openingBalance: { bank: appState.initialBankOpening, cash: 0 },
        advanceFromHM: 0,
        expenses: []
    });
}

// Render Current Active Day
function renderCurrentDay() {
    const day = appState.days[appState.currentDayIndex];
    if (!day) return;

    document.getElementById('month-year-select').value = appState.monthYear;
    document.getElementById('initial-bank-opening').value = appState.initialBankOpening;
    document.getElementById('date-selector').value = appState.currentDayIndex;

    // Date cells
    document.getElementById('cell-rcpt-date').textContent = day.date;

    // Advance from HM
    document.getElementById('input-advance-hm').value = day.advanceFromHM || '';

    // Fund to bank
    const fundCredit = (day.bankCredits || []).find(c => c.label === 'Fund To Bank');
    document.getElementById('input-fund-bank').value = fundCredit ? fundCredit.amount : '';

    // Bank withdrawal
    document.getElementById('input-bank-withdrawal').value = day.bankWithdrawals || '';

    // Render Additional Bank Credits (Sweeps)
    renderAdditionalBankCredits();

    // Render Expense Rows in Payments table
    renderExpenseRows();

    // Render Summary numbers
    renderCurrentDaySummaryOnly();
}

function renderAdditionalBankCredits() {
    const container = document.getElementById('additional-bank-credits');
    container.innerHTML = '';
    const day = appState.days[appState.currentDayIndex];
    if (!day || !day.bankCredits) return;

    day.bankCredits.forEach((item, index) => {
        if (item.label === 'Fund To Bank') return; // Handled by primary input

        const row = document.createElement('div');
        row.className = 'sweep-item-row';
        row.innerHTML = `
            <input type="text" class="input-text" value="${item.label}" aria-label="Credit label" data-sweep-label="${index}">
            <input type="number" class="input-cell" value="${item.amount || ''}" placeholder="0" aria-label="Sweep credit amount" data-sweep-amount="${index}">
            <button type="button" class="btn-row-del" aria-label="Remove this credit row" data-sweep-del="${index}">✕</button>
        `;

        row.querySelector('[data-sweep-label]').addEventListener('input', (e) => {
            day.bankCredits[index].label = e.target.value;
            saveToLocalStorage();
        });

        row.querySelector('[data-sweep-amount]').addEventListener('input', (e) => {
            day.bankCredits[index].amount = parseFloat(e.target.value) || 0;
            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
        });

        row.querySelector('[data-sweep-del]').addEventListener('click', () => {
            day.bankCredits.splice(index, 1);
            renderAdditionalBankCredits();
            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
            announceToSR('Removed bank credit item.');
        });

        container.appendChild(row);
    });
}

function renderExpenseRows() {
    const tbody = document.getElementById('payments-tbody');
    tbody.innerHTML = '';
    const day = appState.days[appState.currentDayIndex];
    if (!day || !day.expenses) return;

    day.expenses.forEach((item, index) => {
        const tr = document.createElement('tr');
        tr.className = 'row-expense-item';
        tr.innerHTML = `
            <td class="date-cell">${index === 0 ? day.date : ''}</td>
            <td class="particulars-cell">
                <input type="text" class="input-text expense-particulars-input" 
                       value="${item.particulars}" placeholder="e.g. For Vegetables" 
                       aria-label="Expense item ${index + 1} particulars">
            </td>
            <td>
                <input type="text" class="input-text" 
                       value="${item.voucherNo || ''}" placeholder="Voucher" 
                       aria-label="Voucher number for item ${index + 1}" style="width: 75px;">
            </td>
            <td class="amount-input-cell">
                <input type="number" class="input-cell" 
                       value="${item.bank || ''}" placeholder="0" 
                       aria-label="Bank amount for item ${index + 1}">
            </td>
            <td class="amount-input-cell">
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                    <input type="number" class="input-cell input-required" 
                           value="${item.cash || ''}" placeholder="0" 
                           aria-label="Cash amount for item ${index + 1}">
                    <button type="button" class="btn-row-del" aria-label="Delete expense item ${item.particulars || index + 1}">✕</button>
                </div>
            </td>
        `;

        const inputs = tr.querySelectorAll('input');
        // Particulars
        inputs[0].addEventListener('input', (e) => {
            item.particulars = e.target.value;
            saveToLocalStorage();
        });
        // Voucher
        inputs[1].addEventListener('input', (e) => {
            item.voucherNo = e.target.value;
            saveToLocalStorage();
        });
        // Bank
        inputs[2].addEventListener('input', (e) => {
            item.bank = parseFloat(e.target.value) || 0;
            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
        });
        // Cash
        inputs[3].addEventListener('input', (e) => {
            item.cash = parseFloat(e.target.value) || 0;
            
            // Auto-sync Advance from HM if only 1 expense row and advance matches!
            const totalCashExpenses = day.expenses.reduce((s, x) => s + (x.cash || 0), 0);
            if (day.advanceFromHM === 0 || day.expenses.length === 1) {
                day.advanceFromHM = totalCashExpenses;
                document.getElementById('input-advance-hm').value = day.advanceFromHM;
            }

            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
        });

        // Delete button
        tr.querySelector('.btn-row-del').addEventListener('click', () => {
            day.expenses.splice(index, 1);
            renderExpenseRows();
            recalculateEntireMonth();
            renderCurrentDaySummaryOnly();
            saveToLocalStorage();
            announceToSR('Expense item deleted.');
        });

        tbody.appendChild(tr);
    });
}

function renderCurrentDaySummaryOnly() {
    const calc = getCurrentDayCalculated();
    if (!calc) return;

    // RECEIPTS SIDE
    document.getElementById('val-rcpt-open-bank').textContent = formatINR(calc.receipts.openingBalance.bank);
    document.getElementById('val-rcpt-open-cash').textContent = formatINR(calc.receipts.openingBalance.cash);

    document.getElementById('val-rcpt-tot-bank').textContent = formatINR(calc.receipts.total.bank);
    document.getElementById('val-rcpt-tot-cash').textContent = formatINR(calc.receipts.total.cash);

    document.getElementById('val-rcpt-cih-bank').textContent = formatINR(calc.receipts.cashInHand.bank);
    document.getElementById('val-rcpt-cih-cash').textContent = formatINR(calc.receipts.cashInHand.cash);

    document.getElementById('val-rcpt-gt-bank').textContent = formatINR(calc.receipts.grandTotal.bank);
    document.getElementById('val-rcpt-gt-cash').textContent = formatINR(calc.receipts.grandTotal.cash);
    document.getElementById('val-rcpt-gt-combined').textContent = `₹ ${formatINR(calc.receipts.grandTotal.total)}`;

    // PAYMENTS SIDE
    document.getElementById('val-pay-tot-bank').textContent = formatINR(calc.payments.total.bank);
    document.getElementById('val-pay-tot-cash').textContent = formatINR(calc.payments.total.cash);

    document.getElementById('val-pay-bih-bank').textContent = formatINR(calc.payments.balanceInHand.bank);
    document.getElementById('val-pay-bih-cash').textContent = formatINR(calc.payments.balanceInHand.cash);

    document.getElementById('val-pay-gt-bank').textContent = formatINR(calc.payments.grandTotal.bank);
    document.getElementById('val-pay-gt-cash').textContent = formatINR(calc.payments.grandTotal.cash);
    document.getElementById('val-pay-gt-combined').textContent = `₹ ${formatINR(calc.payments.grandTotal.total)}`;

    // Balance status badge
    const badge = document.getElementById('balance-badge');
    const badgeText = document.getElementById('balance-text');
    if (calc.isBalanced) {
        badge.className = 'balance-status is-balanced';
        badgeText.textContent = `Ledger Balanced (₹ ${formatINR(calc.receipts.grandTotal.total)})`;
        badge.querySelector('.status-indicator').textContent = '✔';
    } else {
        badge.className = 'balance-status is-unbalanced';
        badgeText.textContent = `Difference: ₹ ${formatINR(Math.abs(calc.difference))}`;
        badge.querySelector('.status-indicator').textContent = '⚠';
    }
}

function updateMonthSummaryUI() {
    if (!monthlyCalcResult) recalculateEntireMonth();
    const sum = monthlyCalcResult.summary;

    document.getElementById('input-aeo-admitted').value = appState.aeoAdmitted || 172074;

    document.getElementById('sum-rcpt-bank').textContent = `₹ ${formatINR(sum.totalOfMonth.receipts.bank)}`;
    document.getElementById('sum-rcpt-cash').textContent = `₹ ${formatINR(sum.totalOfMonth.receipts.cash)}`;
    document.getElementById('sum-rcpt-total').textContent = `₹ ${formatINR(sum.totalOfMonth.receipts.total)}`;

    document.getElementById('sum-pay-bank').textContent = `₹ ${formatINR(sum.totalOfMonth.payments.bank)}`;
    document.getElementById('sum-pay-cash').textContent = `₹ ${formatINR(sum.totalOfMonth.payments.cash)}`;
    document.getElementById('sum-pay-total').textContent = `₹ ${formatINR(sum.totalOfMonth.payments.total)}`;

    document.getElementById('sum-close-bank').textContent = `₹ ${formatINR(sum.balanceInHandMonth.bank)}`;
    document.getElementById('sum-close-cash').textContent = `₹ ${formatINR(sum.balanceInHandMonth.cash)}`;
    document.getElementById('sum-balance-hm').textContent = `₹ ${formatINR(sum.balanceToHM)}`;
}

function saveToLocalStorage() {
    localStorage.setItem('mdm_register_state', JSON.stringify(appState));
}

// Start application when DOM loaded
window.addEventListener('DOMContentLoaded', initApp);
