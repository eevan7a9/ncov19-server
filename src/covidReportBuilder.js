import { createReadStream, writeFile } from "fs";
import csv from "csv-parser";
import { join } from 'path';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const scriptDirectory = __dirname;

const gererateFile = function (path = '', csvFile, callbackFunc) {
    const results = [];
    createReadStream(csvFile)
        .pipe(csv())
        .on('data', (data) => {
            results.push(data);
        })
        .on('end', () => {
            // Write the JSON data to the output file
            const newFormatJson = JSON.stringify(callbackFunc(results), null, 2);
            writeFile(path, newFormatJson, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                } else {
                    console.log('JSON file has been created.');
                }
            });
        })
        .on('error', (error) => {
            console.error('Error reading CSV file:', error);
        });
}

const parseGlobalCaseNewFormat = function (jsonData) {
    return jsonData.map((item) => {
        const newFormat = {
            whoRegion: item["WHO Region"],
            name: item.Name || item["Name"] || item["﻿Name"],
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



export const generateGlobelCase = function () {
    const csvFile = join(scriptDirectory, "assets/global-total-case/WHO-COVID-19-global-table-data.csv");
    gererateFile("output/global-total-case.json", csvFile, parseGlobalCaseNewFormat)
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

export const generateOvertimeCase = function () {
    const csvFile = join(scriptDirectory, "assets/countries-overtime-case/WHO-COVID-19-global-data.csv");
    gererateFile("output/countries-overtime-case.json", csvFile, parseDailyCaseNewFormat)
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

export const generateCountriesAffected = function () {
    const csvFile = join(scriptDirectory, "assets/countries-overtime-case/WHO-COVID-19-global-data.csv");
    gererateFile("output/countries-list.json", csvFile, getCountries)
}

