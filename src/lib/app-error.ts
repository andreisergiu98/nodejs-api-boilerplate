export class AppError extends Error {
    code: number;
    namespace?: string;

    constructor(code: number, message?: string, namespace?: string) {
        super(message);
        this.code = code;
        this.namespace = namespace;
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        // This clips the constructor invocation from the stack trace.
        // It's not absolutely essential, but it does make the stack trace a little nicer.
        //  @see Node.js reference (bottom)
        Error.captureStackTrace(this, this.constructor);
    }
}