//jshint esversion:6

require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const { MongoNetworkError } = require("mongodb");
const md5 = require("md5");
const bcrypt = require("bcrypt");
const { log } = require('console');

const saltRounds= 10;


const app = express();


app.set('view engine', 'ejs');


app.use(bodyParser.urlencoded({
  extended: true
}));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userShema = new mongoose.Schema({
    email : String,
    password : String
});


userShema.plugin(encrypt, { secret: process.env.SECRET,encryptedFields: ['password'] });


const User = new mongoose.model("User",userShema);

app.use(express.static("public"));


app.get("/",function (req,res) {
    res.render("home")    
})


app.get("/register",function (req,res) {
    res.render("register")    
})

app.get("/login",function (req,res) {
    res.render("login")    
})


app.get("/secrets",function (req,res) {
    res.render("secrets")    
})

app.post("/register" , function (req,res) {

    bcrypt.hash(req.body.password, saltRounds, function (err,hash) {
        if (!err) {
            const newUser = new User({
                email : req.body.username,
                password : hash
            })
            newUser.save(function (err) {
                if (!err) {
                    res.render("secrets")
                } else {
                    console.log(err);
                }
            })
        } else {
            console.log(err);
        }        
    })


})

app.post("/login" , function (req,res) {
    const userName = req.body.username;
    const password = req.body.password;
    User.findOne({email :userName }, function (err,founduser) {
        if (!err) {
            if (founduser) {
                bcrypt.compare(password,founduser.password,function (err,result) {
                    if (result) {
                        res.render("secrets"); 
                    } else {
                        
                    }
                })
                
            }
            
        }  
        else {
            console.log(err);
        }      
    })
})


app.listen(3000, function() {
  console.log("Server started on port 3000");
});