const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const generateIdenticon = require('../utils/generateIdenticon');
const prisma = new PrismaClient();

const router = require('express').Router();

// 新規ユーザー登録API
// /api/auth/register
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const defaultIconImage = generateIdenticon(email);

  const hashPassWord = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
      password: hashPassWord,
      profile: {
        create: {
          bio: '初めまして',
          profileImageUrl: defaultIconImage,
        },
      },
    },
    include: {
      profile: true,
    },
  });
  return res.json({ user });
});

// ユーザーログインAPIの作成
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  // prisma.<model名の小文字>.<メソッド>()
  const user = await prisma.user.findUnique({ where: { email } }); // where条件を絞るという意味

  if (!user) {
    return res.status(401).json({
      error: 'メールアドレスかパスワードが間違っています',
    });
  }

  const isPasswordVaild = await bcrypt.compare(password, user.password);

  if (!isPasswordVaild) {
    return res.status(401).json({
      error: 'パスワードが間違っています',
    });
  }

  //tocenの発行をidを用いて行う。＊環境変数は、dotenvライブラリが必要
  const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY, {
    expiresIn: '1d',
  }); // expiresIn有効期限

  return res.json({ token });
});

module.exports = router;
