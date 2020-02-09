var express = require("express");
var app = express();
var bodyParser = require('body-parser');
var color = require('./extra/color');
var view = require('./src/view');
var storage = require('./src/storage');

function log(s, c) {
    console.log(color[c](s));
}

function notFound(res) {
    res.sendFile(__dirname + "/views/404/404.html");
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/assets'));

app.get("/", function(req, res) {
    res.sendFile(__dirname + '/views/index.html');
    log("User with IP " + req.ip + " Visited Vm", "green");
});

app.post("/new", function(req, res) {
    res.set('Content-Type', 'text/html');
    var showNew = vm => res.send(view.renderNew(req.hostname + "/" + vm.id));
    storage.addVm(req.body.message).then(showNew);
    log("User posted to /new", "green");
});

app.get("/:key", function(req, res) {
   var key = req.params["key"];
   res.set('Content-Type', 'text/html');
   storage.getVm(key).then(function(vm) {
      if(!vm) {
          notFound(res);
          log("404 Not Found", "yellow");
      } else {
          var html = view.renderDel(vm.message);
          res.send(html);
          setTimeout(function() {
              storage.deleteVm(key);
              log("Message Deleted!", "green");
          }, 5000);
          log("User visited /" + key, "green");
      }
   });
});

app.get("/vm/submit", function(req, res) {
    var apiMessage = req.query.message;
    res.header('Content-Type', 'application/json');
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    
    var sendApiResponse = vm => {
        res.send(JSON.stringify({url: req.protocol + '://' + req.hostname + "/" + vm.id, message: vm.message}));
    };
    
    storage.addVm(apiMessage).then(sendApiResponse);
    log("[VM] Creating Vm via API", "green");
});


app.listen(process.env.PORT, function (req, res) {
    log("Listening", "blue");
});
