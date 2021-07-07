const express = require('express');
const app = express();
const session = require('express-session');
const bcrypt = require('bcryptjs');
let nRounds = 12;
app.use(express.static('public')); // For static assets
let urlencodedParser = express.urlencoded({extended: true});
const port = process.env.PORT || 3006; // !!! WARNING YOU MUST CONFIGURE THIS CORRECTLY WHEN WE DEPLOY !!!
const events = require('./eventData.json');
const users = require('./clubUsersHash.json');
const nunjucks = require('nunjucks');
nunjucks.configure('templates', {autoescape:true,express:app});
let memberApplication = [];
const cookieName = 'clubsid';


app.use(session({
  secret: 'Soccer Fanatics Club of the Bay',
  resave: false,
  saveUninitialized: false,
  name: cookieName
}));

const setUpSessionMiddleware = function (req, res, next) {
    if (!req.session.user) {
        req.session.user = {loggedin: false};
    }
    next();
};

app.use(setUpSessionMiddleware);

const checkLoggedInMiddleware = function (req, res, next) {
    if (!req.session.user.loggedin) {
        res.render("Forbidden.njk.html");
    }
    else {
    next();
    }
};



app.get('/', function (req, res) {
    res.render('index.njk.html', {user: req.session.user});
});

app.get('/login', function(req, res){
    res.render('login.njk.html', {user: req.session.user});
});

app.get('/membership', function(req, res){
    res.render('membership.njk.html', {user: req.session.user});
});

app.get('/activities', function(req, res){
    res.render('activities.njk.html',{user: req.session.user, events: events});
});

app.post('/membershipSignup', urlencodedParser , function(req, res){
    let salt = bcrypt.genSaltSync(nRounds);
    let passHash = bcrypt.hashSync("req.body.password", salt);
    req.body.hash = req.body.password;
    req.body.hash = passHash;
    delete req.body.password;
    console.log("Membership Signup List");
    memberApplication.push(req.body);
    console.log(memberApplication);
    res.render('thanks.njk.html', {memberApplication: req.body});
});

app.get('/serverId', function(req, res){
    var student = {
      "studentName"  :  "Carlos Alberto Espana Jr",
      "netId"   :  "hx2847",
      "message"      :  "Soccer Fan!"
    }
    res.send(student);
});

app.post('/loggingIn', urlencodedParser , function(req, res){
    console.log(req.body);
    let user = users.find(user => user.email === req.body.email);
    if(!user) {
        console.log("Cannot Find User");
        res.render('loginProblem.njk.html');
        res.status(400);
    }
    
    else if(bcrypt.compareSync(req.body.password, user.passHash)){
        let oldInfo = req.session.user;
        req.session.regenerate(function (err) {
            if (err) {
                console.log(err);
            }
            req.session.user = Object.assign(oldInfo, user, {
                loggedin: true
            });
            console.log("User Found");
            res.render('welcome.njk.html', {user: user});
        });
    }
    else{
        console.log("Incorrect Password");
        res.render('loginProblem.njk.html');
        res.status(400);
    }
});

app.get('/addActivityForm', checkLoggedInMiddleware,  function(req, res){
    res.render('addActivity.njk.html', {user: req.session.user});

});

app.get('/addActivity', checkLoggedInMiddleware,  function(req, res){
    let temp = req.query;
    console.log(temp);
    
    let event = {
        name: temp.name,
        dates: temp.dates,
    description: temp.description
    };
    events.push(event);

    if(events.length > 100)
        events.shift();
    
    res.redirect('./activities');

});



app.get('/members', checkLoggedInMiddleware,  function(req, res){
    res.render('members.njk.html', {users: users, user: req.session.user});
});

app.get('/logOut', function(req, res, next){
    let options = req.session.cookie;
    req.session.destroy(function (err) {
      res.clearCookie(cookieName, options);
      res.render("goodbye.njk.html");
    })
});

host = '127.0.0.1';

app.listen(port, host, function () {
console.log(`clubServer.js app listening on IPv4: ${host}:${port}`);
});

