import fs from 'fs';
import * as csv from 'csv-parse';

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

function countOccurrences(arr: Row[]): Output[] {
  const owners = arr.map((o) => o.To);
  const uniqueNames = [...new Set(owners)];
  const counts = uniqueNames.map((owner) => {
    return { owner, count: owners.filter((o) => o === owner).length }
});

  return counts;
}

const csvData: Row[] = [];

fs.createReadStream('./assets/csv.csv')
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
    console.log(result);
  })
  .on('error', (err) => {
    console.error(err);
  });