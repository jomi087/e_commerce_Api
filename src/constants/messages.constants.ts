export const SUCCESS_MESSAGES = {
  SERVER_RUNNING: 'Server is running',
  DB_CONNECTED: 'Database Connected Successfully',

  REGISTER_SUCCESS: 'User registered successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  SUCCESS: 'Success-full',

  //
};

export const ERROR_MESSAGES = {
  //env
  MISSING_DB_URI: 'DB_URI is missing',
  MISSING_FRONTEND_URL: 'FRONTEND_URL must be a valid URL',
  ALLOWED_ORIGINS: 'Invalid or missing allowed origins configuration',
  MISSING_JWT_SECRET: 'JWT_SECRET is missing',
  MISSING_AUTH_SESSION_TOKEN_EXPIRY: 'Auth session expiry is missing',
  MISSING_AUTH_SESSION_COOKIE_AGE: 'Auth session cookie age is missing',

  //jwt
  SESSION_TOKEN_EXPIRED: 'Session token has expired',
  INVALID_TOKEN: 'Invalid token',
  UNAUTHORIZED: 'Unauthorized access',

  //Auth
  ACCOUNT_INACTIVE: 'Your account is inactive',
  INVALID_CREDENTIALS: 'Invalid Credentials',
  AUTH_TOKEN_REQUIRED: 'Authentication token is required',

  //user
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User already exists',

  //category
  CATEGORY_NOT_FOUND: 'Category not found',
  CATEGORY_PARENT_NOT_FOUND: 'Parent category not found',
  CATEGORY_EXISTS: 'Category with this name already exists under this parent',
  CATEGORY_CIRCULAR_REFERENCE: 'Circular category relationship is not allowed',
  CATEGORY_HAS_CHILDREN: 'Cannot delete a category that has child categories',

  //common
  INTERNAL_SERVER_ERROR: 'Internal server error',
  SOMETHING_WENT_WRONG: 'Something went wrong',
  VALIDATION_FAILED: 'Validation failed',
};
