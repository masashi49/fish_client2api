const { PrismaClient } = require('@prisma/client');
const isAuthenticated = require('../middlewares/isAuthenticated');
const prisma = new PrismaClient();

// app.use('/〇〇', router) を指定して、それ以降の「中の道順」は router が受け持つ！
const router = require('express').Router();

// いいねしたpostを取得するするAPI
router.get('/myLike/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      include: {
        likePosts: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                profile: {
                  select: {
                    profileImageUrl: true,
                  },
                },
                // いいねした数をカウントする
                _count: { select: { likedBy: true } },
              },
            },
          },
        },
      },
    });
    if (!user) {
      return res.status(404).json({ message: 'ユーザーが見つかりません' });
    }
    const posts = user.likePosts.map((p) => ({
      ...p,
      likeCount: p._count.likedBy,
    }));
    res.status(200).json({
      likePosts: user.likePosts,
      posts,
    });
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
router.post('/remove/:userId', isAuthenticated, async (req, res) => {
  const userId = parseInt(req.params.userId); // ここで URL param を使う
  const { postId } = req.body; // postId は body から

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        likePosts: {
          disconnect: { id: postId },
        },
      },
    });
    res.status(200).json({ success: true, action: 'unliked', postId: postId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
