const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
    res.send('welcome!<br>Here is your code :'+req.query.valid);
});


module.exports = router;
