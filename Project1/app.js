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

//route render 

app.get('/',(req,res)=>{
    fs.readdir('./files',(err,files)=>{
    if(err){
        console.error(err);
        return  res.render('index',{files:[]});
    }
    res.render('index',{files}); 
});


// View task details
  app.get('/files/:filename',(req,res)=>{
    const filePath=path.join(__dirname,'files',req.params.filename);
    fs.readFile(filePath,'utf-8',(err,fileData)=>{
        if(err){
            console.error(err);
            return res.status(404).send('Task not Found');
        }
        res.render('show',{title:req.params.filename.replace('.txt',''),content:fileData});

    });
  })

});

// Create a new task
app.post('/create', (req, res) => {
    const title = req.body.title || 'Untitled';
    const details = req.body.details || '';
    const filename = `${title.split(' ').join('')}.txt`;

    fs.writeFile(path.join(__dirname, 'files', filename), details, (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error creating task');
        }
        res.redirect('/');
    });
});


app.listen(3000);
console.log("localhost:3000") 