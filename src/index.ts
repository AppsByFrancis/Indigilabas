import fs from 'fs';
import * as csv from 'csv-parse';
import path from 'path';
import { createObjectCsvWriter } from 'csv-writer';

const csvFilePath = path.resolve(__dirname, '../assets/csv.csv');
import notExportedTransactionData from '../assets/notExported.json';
import exportedTransactionData from '../assets/output.json';

interface Output {
  owner: string;
  count: number;
}

interface Row {
  Signature: string;
  Time: string;
  Action: string;
  From: string;
  To: string;
  Amount: string;
  Decimals: string;
  TokenAddress: string;
}

interface ExportedTransaction {
  owner: string;
  address: string;
}

interface NotExportedTransaction {
  block_id: number;
  trans_id: string;
  block_time: number;
  activity_type: string;
  from_address: string;
  to_address: string;
  token_address: string;
  token_decimals: number;
  amount: number;
  flow: string;
  value: number;
}

type FilteredTransaction = {
  trans_id: string;
  block_time: number;
  activity_type: string;
  from_address: string;
  to_address: string;
  amount: number;
  token_decimals: number;
  token_address: string;
};

function parseOutput(outputRecord: ExportedTransaction[]): Output[] {
    function countOwners(arr: ExportedTransaction[]): Output[]  {
      const owners = arr.map((o) => o.owner);
      const uniqueNames = [...new Set(owners)];
      const counts = uniqueNames.map((owner) => {
        return { owner, count: owners.filter((o) => o === owner).length }
    });
    
      return counts;
    }

    return countOwners(outputRecord)
}

function extractFields(transactions: NotExportedTransaction[]): FilteredTransaction[] {
    return transactions.reduce<FilteredTransaction[]>((acc, curr) => {
      const {
        trans_id,
        block_time,
        activity_type,
        from_address,
        to_address,
        amount,
        token_decimals,
        token_address,
      } = curr;

      acc.push({
        trans_id,
        block_time,
        activity_type,
        from_address,
        to_address,
        amount,
        token_decimals,
        token_address,
      });

      return acc;
    }, []);
}

const csvWriter = createObjectCsvWriter({
  path: csvFilePath,
  header: [
    { id: 'trans_id', title: 'Signature' },
    { id: 'block_time', title: 'Time' },
    { id: 'activity_type', title: 'Action' },
    { id: 'from_address', title: 'From' },
    { id: 'to_address', title: 'To' },
    { id: 'amount', title: 'Amount' },
    { id: 'token_decimals', title: 'Decimals' },
    { id: 'token_address', title: 'TokenAddress' },
  ],
  append: true,
});

async function appendToCsv() {
  try {
    await csvWriter.writeRecords(extractFields(notExportedTransactionData));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function processTransactions() {
  const appended = await appendToCsv();

  if (appended) {
    function countOccurrences(arr: Row[]): Output[]  {
      const owners = arr.map((o) => o.To);
      const uniqueNames = [...new Set(owners)];
      const counts = uniqueNames.map((owner) => {
        return { owner, count: owners.filter((o) => o === owner).length }
    });
  
      return counts;
    }

    const csvData: Row[] = [];
    
    fs.createReadStream(csvFilePath)
      .pipe(
        csv.parse({
          columns: true,
          trim: true,
        })
      )
      .on('data', function (data: Row) {
        csvData.push(data);
      })
      .on('end', function () {
        const result = countOccurrences(csvData);
        // console.log(result);
      })
      .on('error', (err) => {
        console.error(err);
      });


      parseOutput(exportedTransactionData);
    }
}


processTransactions()