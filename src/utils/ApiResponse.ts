export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data?: T;

  constructor(statusCode: number, message: string, data?: T) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  static success<T>(message: string, data?: T, statusCode = 200): ApiResponse<T> {
    return new ApiResponse<T>(statusCode, message, data);
  }

  static created<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(201, message, data);
  }
}
