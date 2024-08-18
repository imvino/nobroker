import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://www.nobroker.in/api/v3/multi/property/RENT/filter";

const headers = {
    "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Brave\";v=\"127\", \"Chromium\";v=\"127\"",
    "X-User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "sec-ch-ua-mobile": "?0",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
    "Access-Control-Allow-Origin": "*",
    "Accept": "application/json",
    "Referer": "https://www.nobroker.in/property/rent/chennai/Chennai/?searchParam=W3sibGF0IjoxMy4wNDM3NjEyODI5MTkyLCJsb24iOjgwLjIwMDA2ODUxNjk2OTMsInBsYWNlSWQiOiJDaElKWVROOVQtcGxVam9STTlSamFBdW5ZVzQiLCJwbGFjZU5hbWUiOiJDaGVubmFpIiwic2hvd01hcCI6dHJ1ZX1d&sharedAccomodation=0&radius=2.0&budgetRange=0,500000&locality=Chennai&isMetro=false&rent=18000,18000&type=BHK2&leaseType=FAMILY&furnishing=FULLY_FURNISHED,SEMI_FURNISHED&parking=TWO_WHEELER,FOUR_WHEELER&farea=0,3000&withPics=1&fpref=true&orderBy=lastUpdateDate,desc&showMap=true",
    "userid": "ff80818167d0ccf80167d144738e29fd",
    "sec-ch-ua-platform": "\"macOS\"",
    "Cookie": "dummy=foo; mbTrackID=5daeb848a6e44ab1b98d41f057e57f3e; nbDevice=desktop; nbccc=36f1410bb7744e7ba46eb21d18af780c"
};

async function fetchData(bhk, rent) {
    const url = `${BASE_URL}?pageNo=1&searchParam=W3sibGF0IjoxMy4wNDM3NjEyODI5MTkyLCJsb24iOjgwLjIwMDA2ODUxNjk2OTMsInBsYWNlSWQiOiJDaElKWVROOVQtcGxVam9STTlSamFBdW5ZVzQiLCJwbGFjZU5hbWUiOiJDaGVubmFpIiwic2hvd01hcCI6dHJ1ZX1d&sharedAccomodation=0&radius=2.0&budgetRange=0,500000&locality=Chennai&isMetro=false&rent=${rent},${rent}&type=BHK${bhk}&leaseType=FAMILY&furnishing=FULLY_FURNISHED,SEMI_FURNISHED&parking=TWO_WHEELER,FOUR_WHEELER&farea=0,3000&withPics=1&fpref=true&orderBy=lastUpdateDate,desc&showMap=true&city=chennai`;

    try {
        const response = await fetch(url, { headers });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching data for BHK${bhk}, rent ${rent}: ${error}`);
        return null;
    }
}

async function saveData(data, bhk, rent) {
    const dir = path.join(__dirname, 'nobroker_api_data');
    await fs.mkdir(dir, { recursive: true });
    const filename = path.join(dir, `BHK${bhk}_rent_${rent}.json`);
    await fs.writeFile(filename, JSON.stringify(data, null, 2));
    console.log(`Data saved for BHK${bhk}, rent ${rent}`);
}

async function main() {
    for (let bhk = 1; bhk <= 3; bhk++) {
        for (let rent = 10000; rent <= 25000; rent += 1000) {
            console.log(`Fetching data for BHK${bhk}, rent: ${rent}`);
            const data = await fetchData(bhk, rent);
            if (data) {
                await saveData(data, bhk, rent);
            }
            // Wait for a short time to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
    console.log("Data collection complete. Check the 'nobroker_api_data' directory for JSON files.");
}

main().catch(console.error);