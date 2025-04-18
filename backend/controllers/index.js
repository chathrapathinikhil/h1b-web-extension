const express = require("express");
const sql = require("mssql");
const NewsAPI = require("newsapi");
const newsapi = new NewsAPI(process.env.news_api);

const getJobs = (req, res) => {
  // Logic to fetch job listings
  res.send("Job listings");
};

const getJobDetails = (req, res) => {
  // Logic to fetch job details by ID
  const jobId = req.params.id;
  res.send(`Details for job ID: ${jobId}`);
};

// Function to fetch news
async function fetchCompanyNews(companyName) {
  try {
    // Create a more targeted search query
    const searchQuery = `"${companyName}" AND (technology OR "tech stack" OR project OR innovation OR acquisition OR layoffs OR "business decision" OR investment OR "tech development" OR "new product" OR partnership)`;

    const response = await newsapi.v2.everything({
      q: searchQuery,
      language: "en",
      sortBy: "relevancy", // Changed from publishedAt to get more relevant news first
      pageSize: 20, // Increased from 5 to 20
      domains:
        "techcrunch.com,bloomberg.com,reuters.com,cnbc.com,forbes.com,businessinsider.com",
    });

    // Filter news to keep only relevant articles
    const filteredArticles = response.articles.filter((article) => {
      const lowerTitle = article.title.toLowerCase();
      const lowerDesc = article.description
        ? article.description.toLowerCase()
        : "";

      // Keywords to match against
      const relevantKeywords = [
        "technology",
        "project",
        "launch",
        "innovation",
        "startup",
        "acquisition",
        "layoff",
        "investment",
        "partnership",
        "development",
        "expansion",
        "tech",
        "platform",
        "product",
        "solution",
        "digital",
        "ai",
        "cloud",
        "software",
        "engineering",
      ];

      // Check if article contains relevant keywords
      return relevantKeywords.some(
        (keyword) => lowerTitle.includes(keyword) || lowerDesc.includes(keyword)
      );
    });

    return filteredArticles;
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
  }
}

// Controller to fetch job listings by employer name
const getJobsByEmployer = async (req, res) => {
  const employerName = req.params.Employer_Petitioner_Name;

  try {
    // First fetch news data since we'll show it regardless of H1B data
    const newsData = await fetchCompanyNews(employerName);

    const suffixes = [
      "Inc",
      "Corp",
      "Ltd",
      "LLC",
      "Co",
      "Group",
      "Plc",
      "Enterprises",
      "Associates",
    ];

    const baseQuery = `
      SELECT Fiscal_Year, Employer_Petitioner_Name, Initial_Approval, Initial_Denial
      FROM [exampledb].[dbo].[master_file]
      WHERE Employer_Petitioner_Name LIKE @Employer_Petitioner_Name
    `;

    console.log("Starting query for:", employerName);

    // Step 1: Exact Match
    const exactRequest = new sql.Request();
    exactRequest.input("Employer_Petitioner_Name", sql.VarChar, employerName);

    const exactResult = await exactRequest.query(
      `SELECT Fiscal_Year, Employer_Petitioner_Name, Initial_Approval, Initial_Denial
       FROM [exampledb].[dbo].[master_file]
       WHERE Employer_Petitioner_Name = @Employer_Petitioner_Name`
    );

    let data = exactResult.recordset;

    // Step 2: Add Suffixes and Search if no exact match
    if (data.length === 0) {
      console.log("Exact match not found, trying suffixes...");
      let allSuffixMatches = [];
      for (let suffix of suffixes) {
        let modifiedEmployerName = `${employerName} ${suffix}`;

        const suffixRequest = new sql.Request();
        suffixRequest.input(
          "Employer_Petitioner_Name",
          sql.VarChar,
          `${modifiedEmployerName}%`
        );

        const suffixResult = await suffixRequest.query(baseQuery);
        allSuffixMatches.push(...suffixResult.recordset);
      }

      data = allSuffixMatches;
    }

    // Step 3: Likely Match (Broader search using LIKE) if no suffix matches
    if (data.length === 0) {
      console.log("No matches with suffixes, trying likely matches...");
      const likelyRequest = new sql.Request();
      likelyRequest.input(
        "Employer_Petitioner_Name",
        sql.VarChar,
        `${employerName}%`
      );

      const likelyResult = await likelyRequest.query(baseQuery);

      data = likelyResult.recordset.filter((record) => {
        const lowerCaseName = record.Employer_Petitioner_Name.toLowerCase();
        const baseLowerCase = employerName.toLowerCase();

        return (
          lowerCaseName.includes(baseLowerCase) ||
          suffixes.some((suffix) =>
            lowerCaseName.includes(`${baseLowerCase} ${suffix.toLowerCase()}`)
          )
        );
      });
    }

    // If no H1B data is found, still show news with a message
    if (data.length === 0) {
      console.log("No H1B records found, but displaying news.");
      const chartHTML = generateChartHTML([], newsData, {
        showNoDataMessage: true,
        companyName: employerName,
      });
      return res.send(chartHTML);
    }

    // If H1B data exists, show both chart and news
    const chartHTML = generateChartHTML(data, newsData, {
      showNoDataMessage: false,
      companyName: employerName,
    });
    return res.send(chartHTML);
  } catch (err) {
    console.error("Error executing query:", err);
    return res.status(500).send("Error executing query.");
  }
};

// Function to generate HTML with Chart.js
function generateChartHTML(data, newsData, options = {}) {
  const { showNoDataMessage, companyName } = options;

  // Process data only if it exists
  const groupedData = data.reduce((acc, item) => {
    const year = item.Fiscal_Year;
    if (!acc[year]) acc[year] = { approvals: 0, denials: 0 };
    acc[year].approvals += item.Initial_Approval;
    acc[year].denials += item.Initial_Denial;
    return acc;
  }, {});

  const chartData =
    data.length > 0
      ? {
          years: Object.keys(groupedData).sort(),
          approvals: Object.keys(groupedData)
            .sort()
            .map((year) => groupedData[year].approvals),
          denials: Object.keys(groupedData)
            .sort()
            .map((year) => groupedData[year].denials),
        }
      : {
          years: [],
          approvals: [],
          denials: [],
        };

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>H1B Data Chart</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', sans-serif;
          background-color: #f5f5f5;
          margin: 0;
          padding: 16px;
        }

        h1, h2 {
          margin-bottom: 20px;
          color: #333;
        }

        .container {
          display: flex;
          gap: 20px;
          max-width: 1400px;
          margin: 0 auto;
          flex-wrap: wrap;
        }

        .chart-container {
          flex: 1;
          min-width: 300px;
          height: 500px; /* Set fixed height */
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          position: relative; /* Add this */
        }

        canvas#lineChart {
          max-height: 100% !important; /* Add this */
        }

        .news-container {
          flex: 0.8; /* Reduced from 1 to make it narrower */
          min-width: 180px; /* Reduced from 225px */
          max-width: 350px; /* Added max-width */
          overflow-y: auto;
          max-height: 800px; /* Increased from 500px to accommodate more cards */
          padding-right: 16px;
          scrollbar-gutter: stable;
        }

        .news-container::-webkit-scrollbar {
          width: 8px;
        }

        .news-container::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .news-container::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .news-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px; /* Further reduced */
          padding: 10px; /* Further reduced */
          margin-bottom: 8px; /* Reduced from 10px to create tighter spacing */
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .news-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }

        .news-title {
          font-size: 13px;
          line-height: 1.2;
          margin-bottom: 4px;
        }

        .news-description {
          font-size: 11px;
          line-height: 1.3;
          margin-bottom: 4px;
          /* Limit description to 3 lines */
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .news-meta {
          font-size: 10px;
          color: #666;
          gap: 6px;
        }

        .news-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .news-image {
          width: 100%;
          height: 120px; /* Further reduced */
          object-fit: cover;
          border-radius: 4px;
          margin-bottom: 8px;
        }

        @media (max-width: 1200px) {
          .container {
            gap: 16px;
          }
          
          .chart-container,
          .news-container {
            flex: 100%;
            max-width: 100%;
          }

          .news-container {
            max-width: 100%;
            max-height: 600px; /* Increased from 400px */
          }
        }

        @media (max-width: 768px) {
          body {
            padding: 12px;
          }

          .chart-container {
            padding: 16px;
          }

          .news-container {
            max-height: 500px; /* Increased from 350px */
          }
          
          .news-card {
            padding: 9px; /* Reduced from 12px */
          }

          .news-image {
            height: 100px;
          }
        }

        @media (max-width: 480px) {
          body {
            padding: 8px;
          }

          h1 {
            font-size: 20px;
          }

          h2 {
            font-size: 18px;
          }

          .news-title {
            font-size: 12px; /* Reduced from 14px */
          }

          .news-description {
            font-size: 11px; /* Reduced from 13px */
          }

          .news-image {
            height: 105px; /* Reduced from 140px */
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="chart-container">
          <h1>H1B Data for ${companyName}</h1>
          ${
            showNoDataMessage
              ? `
            <div class="no-data-message" style="
              text-align: center;
              padding: 20px;
              color: #666;
              font-size: 16px;
            ">
              No H1B visa records found for this company.
              <br>
              This might be because:
              <ul style="
                list-style: none;
                padding: 10px;
                text-align: left;
                margin-top: 10px;
              ">
                <li>• The company hasn't filed for H1B visas recently</li>
                <li>• The company name might be different in our records</li>
                <li>• The company might be too new in our database</li>
              </ul>
            </div>
          `
              : `<canvas id="lineChart"></canvas>`
          }
        </div>
        <div class="news-container">
          <h2>Latest News</h2>
          ${
            newsData.length > 0
              ? newsData
                  .map(
                    (article) => `
              <a href="${article.url}" target="_blank" class="news-link">
                <div class="news-card">
                  ${
                    article.urlToImage
                      ? `
                    <img src="${article.urlToImage}" 
                         alt="${article.title}"
                         class="news-image"
                         onerror="this.style.display='none'">
                  `
                      : ""
                  }
                  <div class="news-title">${article.title}</div>
                  <div class="news-description">${
                    article.description || ""
                  }</div>
                  <div class="news-meta">
                    <span>${new Date(
                      article.publishedAt
                    ).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>${article.source.name}</span>
                  </div>
                </div>
              </a>
            `
                  )
                  .join("")
              : `
            <div class="no-news-message" style="
              padding: 15px;
              color: #666;
              text-align: center;
            ">
              No recent news found for this company.
            </div>
          `
          }
        </div>
      </div>
      ${
        !showNoDataMessage
          ? `
        <script>
          const ctx = document.getElementById("lineChart").getContext("2d");
          new Chart(ctx, {
            type: "line",
            data: {
              labels: ${JSON.stringify(chartData.years)},
              datasets: [
                {
                  label: "Initial Approvals",
                  data: ${JSON.stringify(chartData.approvals)},
                  borderColor: "rgba(75, 192, 192, 1)",
                  backgroundColor: "rgba(75, 192, 192, 0.2)",
                  fill: true,
                  tension: 0.4,
                },
                {
                  label: "Initial Denials",
                  data: ${JSON.stringify(chartData.denials)},
                  borderColor: "rgba(255, 99, 132, 1)",
                  backgroundColor: "rgba(255, 99, 132, 0.2)",
                  fill: true,
                  tension: 0.4,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: true, // Change to true
              height: 400, // Add this
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "H1B Data Trends" },
              },
              scales: {
                x: { title: { display: true, text: "Fiscal Year" } },
                y: { title: { display: true, text: "Count" }, beginAtZero: true },
              },
            },
          });
        </script>
      `
          : ""
      }
    </body>
    </html>
  `;
}

// Controller for the "about" route
const aboutPage = (req, res) => {
  res.send("<p>About page</p>");
};

const nodemailer = require("nodemailer");

const sendReport = async (req, res) => {
  const { email, company, message } = req.body;

  if (!email || !company || !message) {
    return res.status(400).send("Missing required fields.");
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // or use any SMTP service you prefer
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_RECEIVER, // your email
      subject: `🔍 H1B Data Issue Report: ${company}`,
      text: `From: ${email}\nCompany: ${company}\n\nFeedback:\n${message}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("Report sent successfully!");
  } catch (err) {
    console.error("Error sending report:", err);
    res.status(500).send("Failed to send report.");
  }
};

module.exports = {
  getJobs,
  getJobDetails,
  getJobsByEmployer,
  aboutPage,
  sendReport,
};
