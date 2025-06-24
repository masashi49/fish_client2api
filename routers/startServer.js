const router = require('express').Router();

// サーバー起動API
router.get('/ping', (req, res) => {
  res.status(200).send('pong');
});

module.exports = router;
