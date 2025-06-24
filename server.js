const express = require('express');
const app = express();
require('dotenv').config(); // 環境変数の適用
const authRoute = require('./routers/auth');
const postsRoute = require('./routers/posts');
const usersRoute = require('./routers/users');
const profileRoute = require('./routers/profile');
const startServer = require('./routers/startServer');

const cors = require('cors'); // corsのインストールが必要

const PORT = process.env.PORT || 10000; //  5000だと[nodemon] clean exit - waiting for changes before restart

app.use(cors()); // corsの適用
app.use(express.json()); // express側に、json形式で送ると宣言しておく
app.use('/api/auth', authRoute);
app.use('/api/posts', postsRoute);
app.use('/api/users', usersRoute);
app.use('/api/profile', profileRoute);
app.use('/api/startServer', startServer);
app.listen(PORT, () => {
  console.log(`server is running on Port ${PORT}`);
});
