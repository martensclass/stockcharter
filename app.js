var mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    express=require('express'),
    app=express();

mongoose.connect("mongodb://localhost/data");

var StockSchema = new mongoose.Schema({
  symbol: String,
  name: String,
  dates: [String],
  prices: [Number]
});

var Stock = mongoose.model("Stock", StockSchema);

var request = require('request');
//QUANDL API KEY: wD2kaqRh4j7LCzf3bJJL
//Sample call: https://www.quandl.com/api/v3/datasets/WIKI/FB.json?api_key=wD2kaqRh4j7LCzf3bJJL

function getDate(when){
    var d = new Date();
    var m = d.getMonth()+1;
    var dt = d.getDate();
    var y = d.getFullYear();
    y=(when=='now')?y:y-1;
    m=(m<10)?'0'+m:m;
    dt=(dt<10)?'0'+dt:dt;
    var datestr = y+'-'+m+'-'+dt;
    return datestr;
}

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res){
    res.render('index.ejs');
});


app.get('/api/allstocks',function(req,res){
    Stock.find({},function(err,stocks){
        if(err)console.log(err);
    var results=[], nums=[];
    for(var i=0; i<stocks.length; i++){
        for(var x=0; x<stocks[i].prices.length; x++){
             var dt = stocks[i].dates[x].split('-');
              var d = Date.UTC(dt[0], dt[1]-1, dt[2]);
            nums.push([d,stocks[i].prices[x]]);
        }
         var obj={"symbol": stocks[i].symbol, "name": stocks[i].name, "data": nums};
         results.push(obj);
         nums=[]
    }
        res.json(results);
    })
});

app.get('/api/getstock/:sym', function(req,res){
    var symbol= req.params.sym + '.json';
    var start = getDate('then');
    var end = getDate('now');
    request('https://www.quandl.com/api/v3/datasets/WIKI/' + symbol + '?&start_date=' + start + '&end_date=' + end + 'api_key=wD2kaqRh4j7LCzf3bJJL', function(err,response,data){
        if(!err && response.statusCode==200){
            var result = JSON.parse(data);
            var nums = [], ds=[], ps=[];
            symbol = result['dataset']['name'].substring(0,result['dataset']['name'].indexOf("(")-1);
            for(var i=0; i<result['dataset']['data'].length; i++){
                var dt = result['dataset']['data'][i][0].split("-");
                var d = Date.UTC(dt[0], dt[1]-1, dt[2]);
                var p = Number(result['dataset']['data'][i][4]);
                nums.push([d, p ]);
                ds.push(result['dataset']['data'][i][0]);
                ps.push(p);
            }
            var obj={"name": symbol, "data": nums};
            var ioobj = {"symbol": req.params.sym, "name":symbol, "data": nums};
            io.emit('newstock', ioobj);

            Stock.create({
                symbol:  req.params.sym,
                name: symbol,
                dates: ds,
                prices: ps
            },function(err,result){
                if(err)console.log(err);
            });
            res.json(obj);
        }
        else{
            res.json('error');
        }
});
});

app.delete('/api/stocks/:sym',function(req,res){
    Stock.remove({
        symbol: req.params.sym
    },function(err,item){
        if(err){
            console.log(err);
        }
        else{
            io.emit('delstock', req.params.sym);
            res.sendStatus(200);
        }
    });
});

//to compile less at command line for this project:
// $ lessc bootstrap/bootstrap.less public/stylesheets/bootstrap.css
//to minify js 
//minify public/sylesheets/bootstrap.css public/stylesheets/bootstrap.min.css

var server = app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});

var io = require("socket.io").listen(server);

io.sockets.on('connection',function(socket){
    console.log("Socket connected: %s", socket.id);
});