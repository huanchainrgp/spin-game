const swaggerDocumentClean = {
  openapi: '3.0.0',
  info: {
    title: 'Spin Game API',
    version: '1.0.0',
    description: 'API documentation for the Spin Game server',
  },
  servers: [{ url: '/' }],
  paths: {
    '/api/auth/signup': {
      post: {
        summary: 'Sign up a new user',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } } } }
        },
        responses: { '200': { description: 'User created' }, '400': { description: 'Invalid payload' }, '409': { description: 'Username exists' } }
      }
    },
    '/api/auth/login': { post: { summary: 'Login', requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } } } } }, responses: { '200': { description: 'Logged in' }, '401': { description: 'Invalid credentials' } } } },
    '/api/auth/me': { get: { summary: 'Get current session user', responses: { '200': { description: 'User' }, '401': { description: 'Not authenticated' } } } },
    '/api/auth/logout': { post: { summary: 'Logout', responses: { '200': { description: 'OK' } } } },
  },
};

export { swaggerDocumentClean as swaggerDocument };
export default swaggerDocumentClean;