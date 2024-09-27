require('dotenv').config();
const actual = require('@actual-app/api');
const axios = require('axios');

// Function to connect to Actual Budget API
async function connectActualBudget() {
  await actual.runWithServer(
    process.env.ACTUAL_SERVER_URL, 
    process.env.ACTUAL_DATA_DIR, 
    process.env.ACTUAL_PASSWORD
  );
}

// Function to fetch account data from PaymentsNZ API
async function getAccountData() {
  const response = await axios.get(`https://api.paymentsnz.com/accounts/${process.env.ACCOUNT_ID}/transactions`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYMENTSNZ_TOKEN}`,
    },
  });
  return response.data;
}

// Function to import transactions into Actual Budget
async function importTransactions(transactions) {
  for (let transaction of transactions) {
    await actual.addTransaction({
      account: 'your-actual-budget-account-id',
      date: transaction.transactionDate,
      amount: transaction.amount * 100, // Convert to integer cents
      payee: transaction.merchantName,
      category: 'your-actual-category-id',
    });
  }
}

// Function to handle the import process
async function runImporter() {
  try {
    await connectActualBudget();
    const transactions = await getAccountData();
    const transformedTransactions = transactions.map(tx => ({
      account: 'your-actual-budget-account-id',
      date: tx.transactionDate,
      amount: tx.amount * 100, // Convert to integer cents
      payee: tx.merchantName,
      category: 'your-actual-category-id',
    }));
    await importTransactions(transformedTransactions);
    console.log('Transactions imported successfully');
  } catch (error) {
    console.error('Error importing transactions:', error);
  }
}

// Function to convert user-friendly time intervals to milliseconds
const convertToMs = (interval) => {
  const time = parseInt(interval.slice(0, -1), 10);
  const unit = interval.slice(-1);

  switch (unit) {
    case 'm':
      return time * 60 * 1000; // Minutes to milliseconds
    case 'h':
      return time * 60 * 60 * 1000; // Hours to milliseconds
    case 'd':
      return time * 24 * 60 * 60 * 1000; // Days to milliseconds
    default:
      throw new Error('Invalid time unit. Use "m" for minutes, "h" for hours, or "d" for days.');
  }
};

// Get the run interval from environment variables
const runInterval = process.env.RUN_INTERVAL || '60m'; // Default to 60 minutes
const intervalMs = convertToMs(runInterval);

// Schedule the importer based on the user-friendly interval
setInterval(() => {
  runImporter();
}, intervalMs);

runImporter(); // Run immediately on startup
