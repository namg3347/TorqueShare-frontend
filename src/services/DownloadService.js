import { handleResponse } from "./HttpClient";

const BASE_URL = "https://torqueshare.onrender.com";

export async function fetchDownloadData(slug) {

    const response = await fetch(
        `${BASE_URL}/contents/download/${slug}`
    );

    await handleResponse(response);

    return response.json();
}