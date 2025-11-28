import { getToken } from "./auth.js";
import { getCostData } from "./cost.js";
import { getUsageData } from "./usage.js"

import cds from "@sap/cds";
import axios from "axios";



export default function (srv) {
  srv.on('getAccessToken', async () => {
    const token = await getToken();

    return token;
  });

  srv.on('getCostData', async () => {
    const costData = await getCostData();

    return costData;
  });

  srv.on('getUsageData', async (req) => {
    const { fromDate, toDate } = req.data; // action parameters

    //  return `FromDate : ${fromDate} To Date : ${toDate}`;

    if (!fromDate || !toDate) {
      throw new Error('fromDate and toDate are required');
    }

    // Call your existing function and pass parameters
    const usageData = await getUsageData({ fromDate, toDate });
    return usageData;
  });



  this.on("fetchUsage", async (req) => {
    const { fromDate, toDate } = req.data;

    const GLOBAL_ACCOUNTS = [];
    let index = 1;

    while (process.env[`SAP_AUTH_URL_${index}`]) {
      GLOBAL_ACCOUNTS.push({
        authUrl: process.env[`SAP_AUTH_URL_${index}`],
        clientId: process.env[`SAP_USERNAME_${index}`],
        clientSecret: process.env[`SAP_PASSWORD_${index}`],
        usageUrl: `${process.env[`SAP_USAGE_API_URL_${index}`]}?fromDate=${fromDate}&toDate=${toDate}`
      });
      index++;
    }

    // Result container with 1 single object
    let finalResult = { usageData: [] };

    async function getToken(account) {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      params.append("client_id", account.clientId);
      params.append("client_secret", account.clientSecret);
      const res = await axios.post(account.authUrl, params);
      return res.data.access_token;
    }

    async function callAPI(token, url) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      } catch {
        return [];
      }
    }

    async function processAccount(i) {
      if (i >= GLOBAL_ACCOUNTS.length) return;

      const account = GLOBAL_ACCOUNTS[i];
      const token = await getToken(account);
      const usage = await callAPI(token, account.usageUrl);

      // Append all usage records into one object
      if (usage?.content) {
        finalResult.usageData.push(...usage.content);
      } else {
        finalResult.usageData.push(...usage);
      }

      return processAccount(i + 1);
    }

    await processAccount(0);

    return finalResult; // ⬅ return a single JSON object
  });


  this.on("fetchCost", async (req) => {
    const { fromDate, toDate } = req.data;

    const GLOBAL_ACCOUNTS = [];
    let index = 1;

    while (process.env[`SAP_AUTH_URL_${index}`]) {
      GLOBAL_ACCOUNTS.push({
        authUrl: process.env[`SAP_AUTH_URL_${index}`],
        clientId: process.env[`SAP_USERNAME_${index}`],
        clientSecret: process.env[`SAP_PASSWORD_${index}`],
        usageUrl: `${process.env[`SAP_COST_API_URL_${index}`]}?fromDate=${fromDate}&toDate=${toDate}`
      });
      index++;
    }


    let finalResult = { usageData: [] };

    async function getToken(account) {
      const params = new URLSearchParams();
      params.append("grant_type", "client_credentials");
      params.append("client_id", account.clientId);
      params.append("client_secret", account.clientSecret);

      const res = await axios.post(account.authUrl, params);
      return res.data.access_token;
    }

    async function callAPI(token, url) {
      try {
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
      } catch (err) {
        console.error("API failed:", err.message);
        return [];
      }
    }

    async function processAccount(i) {
      if (i >= GLOBAL_ACCOUNTS.length) return;

      const account = GLOBAL_ACCOUNTS[i];
      const token = await getToken(account);
      const usage = await callAPI(token, account.usageUrl);


      if (Array.isArray(usage?.content)) {
        finalResult.usageData.push(...usage.content);
      }
      else if (Array.isArray(usage)) {
        finalResult.usageData.push(...usage);
      }
      else if (usage && typeof usage === "object") {
        finalResult.usageData.push(usage);
      }

      return processAccount(i + 1);
    }

    await processAccount(0);

    return finalResult;
  });


}
