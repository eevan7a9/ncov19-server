import { createReadStream, writeFile, readFile } from "fs";
import csv from "csv-parser";
import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';
import { promisify } from "util";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptDirectory = __dirname;
const writeFileAsync = promisify(writeFile);
const readFileAsync = promisify(readFile);

const gererateFile = async function (path = '', csvFile, callbackFunc) {
    try {
        const results = []
        await new Promise((resolve, reject) => {
            createReadStream(csvFile)
                .pipe(csv())
                .on('data', (data) => {
                    results.push(data);
                })
                .on('end', () => {
                    resolve();
                })
                .on('error', (error) => {
                    reject(error)
                    console.error('Error reading CSV file:', error);
                });
        });
        // Write the JSON data to the output file
        const newFormat = await callbackFunc(results)
        const newFormatJson = JSON.stringify(newFormat, null, 2);
        await writeFileAsync(path, newFormatJson, 'utf8');
        console.log('JSON file has been created.');
    } catch (error) {
        console.error('Error writing JSON file:', error);
    }
}

const parseGlobalCaseNewFormat = async function (jsonData) {
    let countries = [];
    try {
        const data = await readFileAsync(join(scriptDirectory, "../output/countries-list.json"), 'utf8');
        countries = JSON.parse(data)
    } catch (parseError) {
        console.error('Error reading "countries-list.json" JSON:', parseError);
    }
    return jsonData.map((item) => {
        const name = item.Name || item["Name"] || item["﻿Name"];
        const foundCountry = countries.find(country => country.country === name);
        const countryCode = foundCountry?.countryCode;
        const newFormat = {
            whoRegion: item["WHO Region"],
            name,
            countryCode,
            casesCumulativeTotal: item["Cases - cumulative total"],
            casesCumulativeTotalPer100000Population:
                item["Cases - cumulative total per 100000 population"],
            casesNewlyReportedInLast7Days:
                item["Cases - newly reported in last 7 days"],
            casesNewlyReportedInLast7DaysPer100000Population:
                item["Cases - newly reported in last 7 days per 100000 population"],
            casesNewlyReportedInLast24Hours:
                item["Cases - newly reported in last 24 hours"],
            deathsCumulativeTotal: item["Deaths - cumulative total"],
            deathsCumulativeTotalPer100000Population:
                item["Deaths - cumulative total per 100000 population"],
            deathsNewlyReportedInLast7Days:
                item["Deaths - newly reported in last 7 days"],
            deathsNewlyReportedInLast7DaysPer100000Population:
                item["Deaths - newly reported in last 7 days per 100000 population"],
            deathsNewlyReportedInLast24Hours:
                item["Deaths - newly reported in last 24 hours"],
        };
        return newFormat;
    });
};

export const generateGlobelCase = async function () {
    const csvFile = join(scriptDirectory, "assets/global-total-case/WHO-COVID-19-global-table-data.csv");
    await gererateFile("output/global-total-case.json", csvFile, parseGlobalCaseNewFormat)
}

const parseDailyCaseNewFormat = function (jsonData = []) {
    const newForm = {};

    for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        const country = item['Country']
        const formatData = {
            date: item['Date_reported'] || item[`﻿Date_reported`],
            countryCode: item[`Country_code`],
            country: item['Country'],
            whoRegion: item['WHO_region'],
            newCases: item['New_cases'],
            cumulativeCases: item['Cumulative_cases'],
            newDeaths: item['New_deaths'],
            cumulativeDeaths: item['Cumulative_deaths']
        };

        if (!newForm[country]) {
            newForm[country] = {
                country: formatData.country,
                countryCode: formatData.countryCode,
                data: [formatData]
            }
            continue;
        }
        if (new Date(formatData.date).getDate() === 1) {
            newForm[country].data?.push(formatData)
        }
    }

    return Object.keys(newForm).map((key) => (newForm[key]))
}

export const generateOvertimeCase = async function () {
    const csvFile = join(scriptDirectory, "assets/countries-overtime-case/WHO-COVID-19-global-data.csv");
    await gererateFile("output/countries-overtime-case.json", csvFile, parseDailyCaseNewFormat)
}

const getCountries = function (jsonData = []) {
    const countries = {};

    for (let i = 0; i < jsonData.length; i++) {
        const item = jsonData[i];
        if (countries[item.Country_code]) {
            continue
        }
        const newFormat = {
            countryCode: item.Country_code,
            country: item.Country,
            whoRegion: item.WHO_region
        }
        countries[newFormat.countryCode] = newFormat;
    }
    return Object.keys(countries).map((key) => (countries[key]))
}

export const generateCountriesAffected = async function () {
    const csvFile = join(scriptDirectory, "assets/countries-overtime-case/WHO-COVID-19-global-data.csv");
    await gererateFile("output/countries-list.json", csvFile, getCountries)
}

