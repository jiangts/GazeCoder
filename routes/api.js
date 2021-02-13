var express = require('express');
var router = express.Router();
var path = require('path')
var fs = require('fs-extra')
var disk = require('diskusage');

var toGB = x => (x / (1024 * 1024 * 1024)).toFixed(1);


router.get('/list', function(req, res, next) {
  var logpath = path.join(__dirname, '../public/logs')
  var logfiles = fs.readdirSync(logpath)

  logfiles = logfiles.filter(f => f.endsWith('jsonl')).map(f => {
    return {
      name: f,
      href: '/logs/'+f,
      deleteHref: '/api/delete/' + f
    }
  })
  console.log(logfiles)


  disk.check('/', function(err, info) {
    var percentAvailable = ((info.available / info.total) * 100);
    var warnMsg = `You have ${toGB(info.available)}GB disk space remaining`
    res.render('list', { logfiles, warnMsg });
  });

});

router.get('/delete/:f', (req, res, next) => {
  var f = req.params.f
  if(!f) return next()
  var logpath = path.join(__dirname, '../public/logs', f)
  fs.removeSync(logpath)
  res.json({ success: true, msg: `logfile ${f} removed` })
})

module.exports = router;
