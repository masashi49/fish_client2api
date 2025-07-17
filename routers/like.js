const { PrismaClient } = require('@prisma/client');
const isAuthenticated = require('../middlewares/isAuthenticated');
const prisma = new PrismaClient();

// app.use('/〇〇', router) を指定して、それ以降の「中の道順」は router が受け持つ！
const router = require('express').Router();

// postにいいねするAPI
router.get('/myLike/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        likePosts: true,
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    res.status(200).json(user.likePosts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// postにいいねするAPI
router.post('/add', async (req, res) => {
  const { userId, postId } = req.body;
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        likePosts: {
          connect: { id: postId },
        },
      },
    });
    res.status(200).json({ message: 'いいねしました' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// いいねをはずすするAPI
router.post('/remove', isAuthenticated, async (req, res) => {
  const { userId, postId } = req.body;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        likedPosts: {
          disconnect: { id: postId },
        },
      },
    });
    res.status(200).json({ message: 'いいねを解除しました' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
