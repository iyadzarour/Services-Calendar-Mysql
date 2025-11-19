export class ClientError extends Error {
    status: number;
    constructor(message: string, httpCode = 500) {
        super(message);
        this.status = httpCode;
    }
}
