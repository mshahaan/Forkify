import { TIMEOUT_LENGTH_SECONDS } from './config.js';

const timeout = function (s) {
    return new Promise(function (_, reject) {
      setTimeout(function () {
        reject(new Error(`Request took too long! Timeout after ${s} second${s>1?'s':''}`));
      }, s * 1000);
    });
};

export async function AJAX(url, uploadData = undefined) {
  try {

    const fetchItem = uploadData ? fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(uploadData),
    }) : fetch(url);

    const response = await Promise.race([fetchItem, timeout(TIMEOUT_LENGTH_SECONDS)]);
    const data = await response.json();

    if (!response.ok) throw new Error(`${data.message} (${response.status})`);

    return data;
    
  } catch (error) {
      throw error;
  }
}