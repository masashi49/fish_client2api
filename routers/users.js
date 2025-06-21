const { PrismaClient } = require('../generated/prisma');
const isAuthenticated = require('../middlewares/isAuthenticated');
const prisma = new PrismaClient();

// app.use('/〇〇', router) を指定して、それ以降の「中の道順」は router が受け持つ！
const router = require('express').Router();

// ユーザーログイン情報取得API
router.get('/find', isAuthenticated, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.userId } });

    if (!user) {
      res.status(404).json({ error: 'ユーザーガー見つかりませんでした' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
