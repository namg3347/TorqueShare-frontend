import { handleResponse } from "./httpClient";

const BASE_URL = "https://torqueshare.onrender.com";

export async function fetchDownloadData(slug) {

    const response = await fetch(
        `${BASE_URL}/api/content/${slug}`
    );

    await handleResponse(response);

    return response.json();
}