//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const { MongoNetworkError } = require("mongodb");
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const { log } = require('console');



const app = express();


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));


// set up a session 
app.use(session({
    secret : "our little secret.",
    resave : false,
    saveUninitialized: false
}));

// initialize passport/ and use session

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userShema = new mongoose.Schema({
    email : String,
    password : String
});

// use passportlocalmongoose as plugin
userShema.plugin(passportLocalMongoose);

const User =  mongoose.model("User",userShema);



// use passport to create a local strtegy and serialize and deserialize
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(express.static("public"));



/////////////////////////////////////////////////////////////////////////////routing

app.get("/",function (req,res) {
    res.render("home")    
})
app.get("/register",function (req,res) {
    res.render("register")
})

app.get("/login",function (req,res) {
    res.render("login")    
})


// add authentification to the secret page
app.get("/secrets",function (req,res) {
    if (req.isAuthenticated()) {
        console.log('already logged');
        res.render("secrets");
    } else {
        console.log("need to login");
        res.redirect("/login");
    }
})

app.get("/logout" , function (req,res) {
    req.logout( function (err) {
        console.log(err);
    })
    res.redirect("/");   
})



//////////////////////////////////////////////////////////////////////////////////////////////////////


app.post("/register" , function (req,res) {
    User.register({username : req.body.username} , req.body.password, function (err,user) {
        if (err) {
            console.log(err);
            res.redirect("/register");
        }
        else {
            passport.authenticate("local")(req,res,function () {
                res.redirect("/secrets")
            })
        }
    })
})

app.post("/login" , function (req,res) {
    const user = new User({
        username : req.body.username, 
        password: req.body.password
    });

    req.login(user , function (err) {
        if (!err) {
            passport.authenticate("local")(req,res,function () {
                res.redirect("/secrets")
            })
        } else {

            console.log(err);
        }
    })

})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});