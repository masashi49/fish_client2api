const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const router = require("express").Router();

// ユーザープロフィール
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const profile = await prisma.profile.findUnique({
      where: { userId: parseInt(userId) },
      select: {
        // 限定的に情報を取得する、必要な情報だけを select で指定するのがよい。
        bio: true,
        profileImageUrl: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!profile) {
      res.status(404).json({ message: "プロフィールが見つかりませんでした" });
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ユーザープロフィール編集
router.post("/edit/:userId", async (req, res) => {
  const { bio, name, id } = req.body;
  try {
    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        username: name,
        profile: {
          update: {
            bio: bio,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    res.status(200).json({ message: "更新成功", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

// APIのエンドポイントと取得する情報を作成する
// server.jsにて、expressでapp.useする
