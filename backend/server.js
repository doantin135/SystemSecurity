const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const https = require('https');
const app = express();

app.use(cors());
app.use(express.json());

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      description: 'API documentation for your Node.js application',
    },
    servers: [
      {
        url: 'https://localhost:8888',
        description: 'Development server',
      },
    ],
  },
  apis: [
    './routes/*.js',
    './routes/auth.js',
    './routes/user.js',
    './routes/class.js'
  ],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec));

app.get('/api-test', (req, res) => {
  res.json({ message: 'API is working' });
});

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const classRoutes = require('./routes/class');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const privateKey = fs.readFileSync('certs/private_key.pem', 'utf8');
const certificate = fs.readFileSync('certs/certificate.pem', 'utf8');
const credentials = { key: privateKey, cert: certificate, passphrase: 'vvvv' };

const PORT = process.env.PORT || 8888;
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${PORT}`);
  console.log(`Swagger documentation is available at https://localhost:${PORT}/api-docs`);
  console.log('Swagger specification:', JSON.stringify(swaggerSpec, null, 2));
});

module.exports = app;