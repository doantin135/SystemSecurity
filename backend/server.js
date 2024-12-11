const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const https = require('https');
const crypto = require('crypto'); // Import crypto module
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

// Endpoint test
app.get('/api-test', (req, res) => {
  res.json({ message: 'API is working' });
});

// Import các route khác
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const classRoutes = require('./routes/class');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/classes', classRoutes);

// Đọc các file chứng chỉ
const privateKey = fs.readFileSync('certs/server.key', 'utf8');
const publicKey = fs.readFileSync('certs/server.crt', 'utf8'); // Public key được lấy từ certificate
const caCertificate = fs.readFileSync('certs/ca.crt', 'utf8');

// Cấu hình HTTPS credentials
const credentials = {
  key: privateKey,
  cert: publicKey,
  ca: caCertificate,
  passphrase: 'vvvv',
};

// Endpoint ký dữ liệu
app.post('/api/sign', (req, res) => {
  const { data } = req.body; // Dữ liệu cần ký
  if (!data) {
    return res.status(400).json({ message: 'Data is required' });
  }

  try {
    // Ký dữ liệu
    const sign = crypto.createSign('SHA256');
    sign.update(data);
    sign.end();
    const signature = sign.sign(privateKey, 'base64'); // Tạo chữ ký
    res.json({ signature });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error signing data' });
  }
});

// Endpoint xác minh chữ ký
app.post('/api/verify', (req, res) => {
  const { data, signature } = req.body; // Dữ liệu và chữ ký cần xác minh
  if (!data || !signature) {
    return res.status(400).json({ message: 'Data and signature are required' });
  }

  try {
    // Xác minh chữ ký
    const verify = crypto.createVerify('SHA256');
    verify.update(data);
    verify.end();
    const isValid = verify.verify(publicKey, signature, 'base64'); // Kiểm tra chữ ký
    res.json({ isValid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error verifying signature' });
  }
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Tạo HTTPS server
const PORT = process.env.PORT || 8888;
const httpsServer = https.createServer(credentials, app);

httpsServer.listen(PORT, () => {
  console.log(`HTTPS Server is running on https://localhost:${PORT}`);
  console.log(`Swagger documentation is available at https://localhost:${PORT}/api-docs`);
});

module.exports = app;