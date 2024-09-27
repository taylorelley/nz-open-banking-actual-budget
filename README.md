# Actual Budget Importer for NZ Open Banking Standard

This project aims to provides a simple solution for importing bank transactions from the NZ bank accounts using the PaymentsNZ Account Information API standrd into an Actual Budget server. 

## Features
- Imports transactions from a PaymentsNZ compliant API to Actual Budget.
- Runs at intervals specified by the `RUN_INTERVAL` environment variable.

## Requirements
- Docker
- Docker Compose
- Bank API token
- Actual Budget API credentials

## Setup

1. Clone this repository:

   ```bash
   git clone <repo-url>
   cd customer-importer
   ```
2. Amend the .env Environment Variables file
3. Build and run the Docker container using docker-compose:
   ```
   docker-compose up --build
   ```
## Environment Variables

| Variable           | Description                                             |
|--------------------|---------------------------------------------------------|
| `ACTUAL_SERVER_URL` | URL of the Actual Budget server (e.g., `http://localhost:5006`). |
| `ACTUAL_PASSWORD`   | Actual Budget server password.                          |
| `ACTUAL_BUDGET_ACCOUNT_ID`| Actual Budget account ID                          |
| `ACTUAL_CATEGORY_ID`   | Actual Budget default category for transactions.     |
| `BANK_API_URL`  | URL end point for accessing Bank API.               |
| `RUN_INTERVAL`      | Time interval to run the importer (e.g., `30m`, `2h`, `1d`). |

## How It Works

- On startup, the importer fetches transactions from the PaymentsNZ Account Information API and imports them into Actual Budget.
- The importer runs at intervals specified by the `RUN_INTERVAL` environment variable (e.g., every 30 minutes or 2 hours).
- Transaction data is mapped to Actual Budget's required format.
