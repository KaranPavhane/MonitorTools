import { getToken } from '../srv/auth.js';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();

export async function getUsageData({ fromDate, toDate }) {
    try {

        if (!fromDate || !toDate) {
            throw new Error('fromDate and toDate are required');
        }

        // Convert to ISO format
        // const from = new Date(fromDate).toISOString().split('T')[0];
        // const to = new Date(toDate).toISOString().split('T')[0];

      //  return `From Date ${from} To Date : ${to}`;

        const sapApiUrl = process.env.SAP_USAGE_API_URL;
        if (!sapApiUrl) {
            throw new Error('SAP_USAGE_API_URL is not configured in .env');
        }

        const token = await getToken();
        const url = `${sapApiUrl}?fromDate=${fromDate}&toDate=${toDate}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`SAP API returned ${response.status}: ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        return result; 

    } catch (error) {
        console.error('Usage API Error:', error.message);
        throw new Error(error instanceof Error ? error.message : 'Failed to fetch usage data');
    }
}
