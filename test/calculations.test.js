const assert = require('assert');
const { calculateDayLedger, calculateMonthLedger } = require('../src/calculator');

console.log('Running MDM Calculation Engine Test Suite...\n');

// TEST 1: Date 1/8/25 from PDF Page 1
{
    console.log('Test 1: Verify Date 1/8/25 from PDF');
    const result = calculateDayLedger({
        openingBalance: { bank: 6191, cash: 0 },
        advanceFromHM: 2467,
        expenses: [{ particulars: 'For Vegetables', voucherNo: '401', cash: 2467 }]
    });

    assert.strictEqual(result.receipts.total.cash, 2467);
    assert.strictEqual(result.receipts.cashInHand.bank, 6191);
    assert.strictEqual(result.receipts.cashInHand.cash, 2467);
    assert.strictEqual(result.receipts.cashInHand.total, 8658);
    assert.strictEqual(result.receipts.grandTotal.total, 8658);

    assert.strictEqual(result.payments.total.cash, 2467);
    assert.strictEqual(result.payments.balanceInHand.bank, 6191);
    assert.strictEqual(result.payments.balanceInHand.cash, 0);
    assert.strictEqual(result.payments.balanceInHand.total, 6191);
    assert.strictEqual(result.payments.grandTotal.bank, 6191);
    assert.strictEqual(result.payments.grandTotal.cash, 2467);
    assert.strictEqual(result.payments.grandTotal.total, 8658);

    assert.strictEqual(result.isBalanced, true);
    console.log('  ✓ Date 1/8/25 passed: Grand Total = 8658 balanced.\n');
}

// TEST 2: Date 6/8/25 from PDF Page 1 (with Fund to Bank credit)
{
    console.log('Test 2: Verify Date 6/8/25 from PDF (Bank Credit of ₹80,096)');
    const result = calculateDayLedger({
        openingBalance: { bank: 6191, cash: 0 },
        advanceFromHM: 5824,
        bankCredits: [{ label: 'Fund To Bank', amount: 80096 }],
        expenses: [{ particulars: 'For Egg', voucherNo: '719', cash: 5824 }]
    });

    assert.strictEqual(result.receipts.fundToBankTotal, 80096);
    assert.strictEqual(result.receipts.total.bank, 80096);
    assert.strictEqual(result.receipts.total.cash, 5824);
    assert.strictEqual(result.receipts.total.total, 85920);

    assert.strictEqual(result.receipts.cashInHand.bank, 86287);
    assert.strictEqual(result.receipts.cashInHand.cash, 5824);
    assert.strictEqual(result.receipts.cashInHand.total, 92111);

    assert.strictEqual(result.payments.balanceInHand.bank, 86287);
    assert.strictEqual(result.payments.balanceInHand.cash, 0);
    assert.strictEqual(result.payments.grandTotal.total, 92111);

    assert.strictEqual(result.isBalanced, true);
    console.log('  ✓ Date 6/8/25 passed: Bank balance updated to 86,287, Grand Total = 92,111.\n');
}

// TEST 3: Date 20/8/25 from PDF Page 4 (Multiple Bank credits / sweeps)
{
    console.log('Test 3: Verify Date 20/8/25 from PDF (Sweep Out / multiple bank inflows)');
    const result = calculateDayLedger({
        openingBalance: { bank: 86287, cash: 0 },
        advanceFromHM: 8031,
        bankCredits: [
            { label: 'Fund To Bank', amount: 66374 },
            { label: 'Fund To Bank (Sweep out)', amount: 83294 },
            { label: 'Fund To Bank (Sweep out)', amount: 71805 }
        ],
        expenses: [
            { particulars: 'For Vegetables', voucherNo: '425', cash: 2246 },
            { particulars: 'For Egg', voucherNo: '724', cash: 5785 }
        ]
    });

    assert.strictEqual(result.receipts.fundToBankTotal, 221473);
    assert.strictEqual(result.receipts.total.bank, 221473);
    assert.strictEqual(result.receipts.total.cash, 8031);
    assert.strictEqual(result.receipts.total.total, 229504);

    assert.strictEqual(result.receipts.cashInHand.bank, 307760);
    assert.strictEqual(result.receipts.cashInHand.cash, 8031);
    assert.strictEqual(result.receipts.cashInHand.total, 315791);

    assert.strictEqual(result.payments.total.cash, 8031);
    assert.strictEqual(result.payments.balanceInHand.bank, 307760);
    assert.strictEqual(result.payments.grandTotal.total, 315791);

    assert.strictEqual(result.isBalanced, true);
    console.log('  ✓ Date 20/8/25 passed: Bank updated to 3,07,760, Grand Total = 3,15,791.\n');
}

// TEST 4: Month cascading test
{
    console.log('Test 4: Verify Multi-day Cascade');
    const daysData = [
        {
            date: '01/08/2025',
            advanceFromHM: 2467,
            expenses: [{ particulars: 'For Vegetables', voucherNo: '401', cash: 2467 }]
        },
        {
            date: '04/08/2025',
            advanceFromHM: 17530,
            expenses: [
                { particulars: 'For Condiments', voucherNo: '014', cash: 6350 },
                { particulars: 'For Condiments', voucherNo: '015', cash: 4970 },
                { particulars: 'For Spices', voucherNo: '852', cash: 6210 }
            ]
        },
        {
            date: '06/08/2025',
            advanceFromHM: 5824,
            bankCredits: [{ label: 'Fund To Bank', amount: 80096 }],
            expenses: [{ particulars: 'For Egg', voucherNo: '719', cash: 5824 }]
        }
    ];

    const monthResult = calculateMonthLedger(6191, 0, daysData);
    assert.strictEqual(monthResult.days.length, 3);
    assert.strictEqual(monthResult.days[0].receipts.openingBalance.bank, 6191);
    assert.strictEqual(monthResult.days[1].receipts.openingBalance.bank, 6191);
    assert.strictEqual(monthResult.days[2].receipts.openingBalance.bank, 6191);
    assert.strictEqual(monthResult.days[2].closingBalance.bank, 86287);

    console.log('  ✓ Cascade test passed: Day balances carry forward seamlessly.\n');
}

console.log('ALL TESTS PASSED SUCCESSFULLY! 100% Match with Hand-Written Formulas & Register PDF.');
