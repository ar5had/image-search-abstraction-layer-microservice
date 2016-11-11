var express = require("express");
var router = express.Router();

var styles = "<style>@import url('https://fonts.googleapis.com/css?family=Quicksand');" +
            "body{background: #fefefe; word-wrap: break-word;}" +
            "p {font-size: 20px;color: rgba(244, 67, 54, 0.87);font-family: 'Quicksand', monospace;text-align: center;" +
            "margin-top: 40vh;font-weight: 500;word-spacing: 2px;}</style>";

router.get("/latest", function(req, res){
    req.collection.find({}, {term: 1, when: 1, _id: 0, count: 1})
        .sort({$natural: -1}).limit(5)
        .toArray(function(err, data) {
           if(err) console.error("Error occurred while getting latest search results:", err);
           var elem = "<p>"+JSON.stringify(data)+"</p>";
           res.send(styles + elem);
        });
});

function insertQueryDoc(req, res, next) {
    var query = req.params.queries.toString();
    
    req.collection.find({term: query}).toArray(function(err, data){
        if(err) console.error("Error occurred while checking query existence:",err);
        
        if(data.length > 0) {
            console.log("item existed");
            req.collection.update(
                { 
                    term: query
                },
                {
                    $inc : {
                        count : 1
                    }
                }
            , function(err) {
                if(err) console.error("Error occurred while increasing count for query-", query, ":", err);
                next();
            });
        }
        else {
            var obj = {};
            obj.term = query;
            obj.when = new Date().toString();
            obj.count = 1;
            req.collection.insert(obj, function(err, data){
               if(err) console.log("Error occurrred while inserting data:", data);
               next();
            });
        }
    });
}

function showData(req, res) {
    console.log("...showing data...");
}

router.get("/:queries", function(req, res, next) {
    res.send(JSON.stringify(req.query));
    next();
}, insertQueryDoc, showData);

module.exports = router;