export class ApiError extends Error {

    constructor(status, error, message) {

        super(message);

        this.name = "ApiError";

        this.status = status;
        this.error = error;
    }
}