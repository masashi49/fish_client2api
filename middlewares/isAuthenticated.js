const jwt = require('jsonwebtoken');

// エラーハンドリング用のミドルウェアを作成する
function isAuthenticated(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]; // `Bearer token` の token

  if (!token) {
    return res.status(401).json({ message: '権限がありません' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      console.log(err);
      return res.status(401).json({ message: '権限がありません' }); // デコードしたけど、元のトークンではなかった
    }
    req.userId = decoded.id;

    next();
  });
}

module.exports = isAuthenticated;
