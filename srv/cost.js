import { getToken } from '../srv/auth.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch'; 

dotenv.config();

export async function getCostData() {
    const sapApiUrl = process.env.SAP_COST_API_URL;

    if (!sapApiUrl) {
        throw new Error('SAP_COST_API_URL is not configured in .env');
    }

    // Get token
    const token = await getToken();

    const url = `${sapApiUrl}?$format=json`;

    console.log("Token:", token);
    console.log("URL:", url);

  //  return `Token : ${token} URL :${url}`;
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });


        if (!response.ok) {
            throw new Error(`SAP API request failed with status ${response.status}`);
        }

        const data = await response.json();

      //  console.log("Cost Data:", data);

        return data;

        
    } catch (err) {
        console.error("Error fetching cost data:", err.message);
        throw new Error("Failed to fetch cost data from SAP API");
    }
}
