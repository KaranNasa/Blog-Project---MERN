const express=require('express');
const cors=require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser'); 
const multer=require('multer');
const fs=require('fs');

const Post = require('./models/Post')
const uploadMiddleware = multer({dest: 'uploads/'});

var salt=bcrypt.genSaltSync(10);
const secret= 'iwddweffeewdwdwiowfifewefiweho23r';


const app=express();

app.use(cors({credentials: true, origin:'http://localhost:3000'}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname + '/uploads'));

// connecting to mongoose database
mongoose.connect('mongodb+srv://blog:6XTXvzdOjQNsXMIa@cluster0.9urpbyi.mongodb.net/?retryWrites=true&w=majority',()=>{
    console.log("Connected to mongodb");
});

app.post('/register',async (req,res) => { // we use post since we need to send some information
    const {username,password}=req.body;

    // Creating the user
    try{
        const userDoc = await User.create({
            username,
            password:bcrypt.hashSync(password,salt)
        });
        res.json(userDoc);      
    } catch(e){
        console.log(e);
        res.status(400).json(e);
    }
    // We put the try and catch block so that if a user has already registered so it cant be registered and hence it will throw an error
});

app.post('/login',async (req,res) =>{
    const {username,password}=req.body;
    const userDoc = await User.findOne({username});
    const passOk = bcrypt.compareSync(password,userDoc.password);   // here we are comparing the password

    // res.json(passOk);   // if password match then it returns true

    if(passOk){
        // logged in

        jwt.sign({username,id:userDoc._id}, secret, {}, (err,token) => {
            if(err){
                console.log(err);
            }
            else{
                res.cookie('token',token).json({
                    id: userDoc._id,
                    username,
                });
            }
        });

    }
    else{
        // not logged in
        res.status(400).json("Wrong credentials");
    }
})

app.get('/profile',(req,res)=>{
    const {token}=req.cookies;

    jwt.verify(token,secret,{},(err,info)=>{
        if(err)
            console.log(err);
        else{
            res.json(info);
        }
    })      // now we need to verify that the jwt token is authentic
    
});


app.post('/logout',(req,res)=>{
    res.cookie('token',' ').json('ok');
})


app.post('/post',uploadMiddleware.single('file'), async (req,res)=>{
    const {originalname,path} = req.file;
    const parts=originalname.split('.');
    const ext=parts[parts.length - 1];

    const newPath=path+'.'+ext;
    fs.renameSync(path,newPath);

    // Extracting name from jwt token and // Uploading the file

    const {token}=req.cookies;

    jwt.verify(token,secret,{},async (err,info)=>{
        if(err)
            console.log(err);
        
        const {title,summary,content} = req.body;
    
        const postDoc = await Post.create({
                title,
                summary,
                content, 
                cover: newPath,
                author: info.id,
            })
        
            res.json(postDoc);
    });   


   
})

app.get('/post',async(req,res)=>{
    const posts = (await Post.find().populate('author',['username']));
    res.json(posts);
})

app.get('/post/:id',async(req,res) => {
    const {id}=req.params;
    const postDoc = await Post.findById(id).populate('author',['username']);
    res.json(postDoc);
})

app.put('/post',uploadMiddleware.single('file'),async (req,res) => {
    let newPath=null;
    if(req.file){
        const {originalname,path} = req.file;
        const parts=originalname.split('.');
        const ext=parts[parts.length - 1];

        newPath=path+'.'+ext;
        fs.renameSync(path,newPath);

    }

    const {token} = req.cookies;

    jwt.verify(token,secret,{},async (err,info)=>{
        if(err){
            console.log(err);
        }

        const {id,title,summary,content} = req.body;

        const postDoc = await Post.findById(id);

        const isAuthor = JSON.stringify(postDoc.author) == JSON.stringify(info.id);

        if(!isAuthor){
            return res.status(400).json('You are not the author');
        }
        
        await postDoc.update({
            title,
            summary,
            content,
            cover: newPath ? newPath : postDoc.cover,
        });
        
        res.json(postDoc);
    });  
    

})

app.listen(4000,()=>{
    console.log("Listening on port 4000");
});



// mongodb+srv://blog:6XTXvzdOjQNsXMIa@cluster0.9urpbyi.mongodb.net/?retryWrites=true&w=majority
// username: blog
// Password: 6XTXvzdOjQNsXMIa