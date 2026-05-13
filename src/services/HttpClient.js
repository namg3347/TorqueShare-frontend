import { ApiError } from "./ApiError";

export async function handleResponse(response) {

    console.log("STATUS:", response.status);

    if (response.ok) {
        return response;
    }

    let errorBody;

    try {

        errorBody = await response.json();

        console.log("ERROR BODY:", errorBody);

    } catch (e) {

        console.error("JSON PARSE FAILED", e);

        throw new ApiError(
            response.status,
            "UNKNOWN_ERROR",
            "Unexpected server error"
        );
    }

    throw new ApiError(
        response.status,
        errorBody.error,
        errorBody.message
    );
}