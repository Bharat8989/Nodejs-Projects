const express=require('express')
const path=require('path')
const fs=require('fs')
const app=express();

//set the EJS (Embedded JavaScript ) as the view engine 
app.set('view engine','ejs')

//middleware parsing JSON and url encoding data 
app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(express.static(path.join(__dirname,'public')));

//route render the 

app.get('/',(req,res)=>{
    res.render('index');

})
app.listen(3000);
console.log("localhost:3000")