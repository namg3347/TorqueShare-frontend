import { handleResponse } from "./HttpClient";

const BASE_URL = "http://localhost:8080";

export async function generateUploadUrl(payload) {

    const response = await fetch(
        `${BASE_URL}/contents/upload`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        }
    );

    await handleResponse(response);

    return response.json();
}