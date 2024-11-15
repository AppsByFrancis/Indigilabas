import fs from 'fs';

const result: string = fs.readFileSync('./csv.csv').toString();

interface PublicKeyRecord {
    owner: string;
    count: number;
    dates: string[];
}

function convertTimestampToDate(timestamp: string): string {
    const date = new Date(parseInt(timestamp, 10) * 1000);
    return date.toISOString().split('T')[0];
}

function analyzePublicKeys(csvData: string): PublicKeyRecord[] {
    const rows = csvData.trim().split("\n");
    const publicKeyMap: { [key: string]: PublicKeyRecord } = {};
    const today = new Date().toISOString().split('T')[0];

    rows.forEach(row => {
        const columns = row.split(",");
        const timestamp = columns[1];
        const publicKey = columns[4];
        const date = convertTimestampToDate(timestamp);

        if (!publicKeyMap[publicKey]) {
            publicKeyMap[publicKey] = { owner: publicKey, count: 0, dates: [] };
        }

        publicKeyMap[publicKey].count += 1;

        if (date !== today) {
            publicKeyMap[publicKey].dates.push(date);
        }
    });

    return Object.values(publicKeyMap);
}

const publicKeyAnalysis = analyzePublicKeys(result);
console.log(publicKeyAnalysis);