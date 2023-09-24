const fs = require("fs");
const csv = require("csv-parser");
const path = require('path'); 

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



// Helper function to sanitize JSON attributes
const sanitizeAttributes = function (obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      obj[key] = obj[key].toString().trim();
    }
  }
}

const generateGlobelCase = function () {
  const scriptDirectory = __dirname;
  const csvFile = path.join(scriptDirectory, "assets/global-total-case/WHO-COVID-19-global-table-data.csv");
  const results = [];
  // Read the CSV file with 'utf8' encoding and remove BOM explicitly
  fs.createReadStream(csvFile, { encoding: "utf8" })
    .pipe(csv())
    .on("data", (data) => {
      sanitizeAttributes(data);
      results.push(data);
    })
    .on("end", () => {
      fs.writeFile("output/global-total-case.json", JSON.stringify(parseGlobalCaseNewFormat(results)), "utf8", (err) => {
        if (err) {
          console.error("Error writing JSON file:", err);
        } else {
          console.log("db.json file has been created.");
          // console.log(results)
        }
      });
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
    });
}

const parseDailyCaseNewFormat = function (jsonData = []) {
  const newForm = {};

  for(let i = 0; i < jsonData.length; i++) {
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

    if(!newForm[country]) {
      newForm[country] = {
        country: formatData.country,
        data: [formatData]
      }
      continue;
    }
    if(new Date(formatData.date).getDate() === 1) {
      newForm[country].data?.push(formatData)
    }
  }

  return Object.keys(newForm).map((key) => ({ [key]: newForm[key]}))
}

const generateMonthlyCase = function () {

  const scriptDirectory = __dirname;
  const csvFile = path.join(scriptDirectory, "assets/countries-monthly-case/WHO-COVID-19-global-data.csv");
  const results = [];

  fs.createReadStream(csvFile)
    .pipe(csv())
    .on('data', (data) => {
      results.push(data);
    })
    .on('end', () => {
      // Write the JSON data to the output file
      const newFormatJson = JSON.stringify(parseDailyCaseNewFormat(results), null, 2);
      fs.writeFile("output/global-monthly-case.json", newFormatJson, 'utf8', (err) => {
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

// generate "global-total-case.json" in output directory
generateGlobelCase();
// generate "global-monthly-case.json" in output directory
generateMonthlyCase()