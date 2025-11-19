export class ValidationError extends Error {
    validationErrors: any;
    status: number;
    constructor(validationErrors: any, httpCode = 422) {
        super();
        this.validationErrors = validationErrors;
        this.status = httpCode;
    }
}
