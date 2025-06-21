const { PrismaClient } = require('../generated/prisma');
const prisma = new PrismaClient();
const router = require('express').Router();
const isAuthenticated = require('../middlewares/isAuthenticated');

// つぶやき投稿用API
router.post('/post', isAuthenticated, async (req, res) => {
  const { content } = req.body;
  const authorId = req.userId;

  if (!content) {
    return res.status(400).json({ message: '投稿内容がありません' });
  }

  try {
    const newPost = await prisma.post.create({
      data: {
        content,
        authorId,
      },
      // 最新投稿にも名前を取得
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    res.status(201).json(newPost);
  } catch (erro) {
    return res.status(500).json({ message: erro + 'サーバーエラーです' });
  }
});

// 最近呟き取得用API
router.get('/latestpost', async (req, res) => {
  try {
    const latestPosts = await prisma.post.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          include: {
            profile: true,
          },
        },
      },
    });
    return res.json(latestPosts);
  } catch (error) {
    res.status(500).json({ message: error + 'サーバーエラーです' });
  }
});

// 閲覧ユーザーの投稿だけを取得
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const post = await prisma.post.findMany({
      where: { authorId: parseInt(userId) },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!post) {
      res.status(404).json({ message: '投稿が見つかりませんでした' });
    }

    res.status(200).json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
