const fs = require("fs");
const csv = require("csv-parser");

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
  const csvFile = "assets/global-total-case/WHO-COVID-19-global-table-data.csv";
  const results = [];
  // Read the CSV file with 'utf8' encoding and remove BOM explicitly
  fs.createReadStream(csvFile, { encoding: "utf8" })
    .pipe(csv())
    .on("data", (data) => {
      sanitizeAttributes(data);
      results.push(data);
    })
    .on("end", () => {
      fs.writeFile("world_db.json", JSON.stringify(parseGlobalCaseNewFormat(results)), "utf8", (err) => {
        if (err) {
          console.error("Error writing JSON file:", err);
        } else {
          console.log("db.json file has been created.");
          console.log(results)
        }
      });
    })
    .on("error", (error) => {
      console.error("Error reading CSV file:", error);
    });
}

generateGlobelCase();