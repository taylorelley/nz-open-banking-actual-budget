require('dotenv').config();
const actual = require('@actual-app/api');
const axios = require('axios');

// Function to validate necessary environment variables
const validateEnv = () => {
  if (!process.env.BANK_API_URL || !process.env.ACTUAL_SERVER_URL || !process.env.BANK_TOKEN) {
    console.error('Required environment variables are missing.');
    process.exit(1);
  }
};

// Function to connect to Actual Budget API
async function connectActualBudget() {
  await actual.runWithServer(process.env.ACTUAL_SERVER_URL, process.env.ACTUAL_PASSWORD);
}

// Fetch account data from Bank API
async function getAccountData() {
  try {
    const url = process.env.BANK_API_URL;
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${process.env.BANK_TOKEN}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Bank API error:', error.response.data);
    } else if (error.request) {
      console.error('No response from Bank API:', error.request);
    } else {
      console.error('Error during Bank API call:', error.message);
    }
    throw error; // Rethrow to prevent transaction import in case of failure
  }
}

// Function to import transactions into Actual Budget
async function importTransactions(transactions) {
  for (let transaction of transactions) {
    await actual.addTransaction({
      account: process.env.ACTUAL_BUDGET_ACCOUNT_ID,  // Use from .env
      date: transaction.transactionDate,
      amount: transaction.amount * 100, // Convert to integer cents
      payee: transaction.merchantName,
      category: process.env.ACTUAL_CATEGORY_ID,  // Use from .env
    });
  }
}

// Function to handle the import process
async function runImporter() {
  try {
    await connectActualBudget();
    const transactions = await getAccountData();
    const transformedTransactions = transactions.map(tx => ({
      account: process.env.ACTUAL_BUDGET_ACCOUNT_ID,
      date: tx.transactionDate,
      amount: tx.amount * 100,
      payee: tx.merchantName,
      category: process.env.ACTUAL_CATEGORY_ID,
    }));
    await importTransactions(transformedTransactions);
    console.log('Transactions imported successfully');
  } catch (error) {
    console.error('Error importing transactions:', error);
  } finally {
    setTimeout(runImporter, intervalMs); // Schedule next run
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

// Validate environment variables before starting
validateEnv();

// Get the run interval from environment variables
const runInterval = process.env.RUN_INTERVAL || '60m'; // Default to 60 minutes
const intervalMs = convertToMs(runInterval);

// Start the importer process immediately and schedule it based on interval
runImporter();