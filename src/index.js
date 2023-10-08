import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { generateGlobelCase, generateOvertimeCase, generateCountriesAffected } from "./covidReportBuilder.js";

dotenv.config();

if (process.env.DISABLE_GENERATE_CASES !== 'true') {
    (async () => {
        try {
            // generate Monthly & Total Cases into output/
            await generateCountriesAffected();
            await generateOvertimeCase();
            await generateGlobelCase();
        } catch (error) {
            console.error('Error Generating Files:', error);
        }
    })();
}

const app = express();
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a route
app.get('/', (req, res) => {
    res.send('Hello, Server!');
});
app.get('/global-cases', (req, res) => {
    const jsonFilePath = path.join(__dirname, '..', 'output', 'global-total-case.json');

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        try {
            res.json(JSON.parse(data));
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.get('/country/:country', (req, res) => {
    const country = req.params.country;
    const jsonFilePath = path.join(__dirname, '..', 'output', 'countries-overtime-case.json');

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }
        try {
            const countries = JSON.parse(data);
            const foundCountry = countries.find(item => item.country === country || item.countryCode === country);
            res.json(foundCountry);
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});