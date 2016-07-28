var mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    express=require('express'),
    app=express();
    
//mongoose.connect("mongodb://localhost/data");

 
//QUANDL API KEY: wD2kaqRh4j7LCzf3bJJL
//Sample call: https://www.quandl.com/api/v3/datasets/WIKI/FB.json?api_key=wD2kaqRh4j7LCzf3bJJL

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res){
    res.render('index.ejs');
});

//to compile less at command line for this project:
// $ lessc bootstrap/bootstrap.less public/stylesheets/bootstrap.css
//to minify js 
//minify public/sylesheets/bootstrap.css public/stylesheets/bootstrap.min.css

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});