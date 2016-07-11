var mongoose=require('mongoose'),
    bodyParser=require('body-parser'),
    express=require('express'),
    app=express();
    
mongoose.connect("mongodb://localhost/bethere");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', function(req, res){
    res.render('index.ejs');
});

//to compile less at command line:
// $ lessc styles.less styles.css
//to minify js 
//minify public/sylesheets/bootstrap.css public/stylesheets/bootstrap.min.css

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("Server started");
});