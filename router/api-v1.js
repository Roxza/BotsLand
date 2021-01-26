const router = require('express').Router();
const db = require('quick.db');
const ms = require('ms');
const fs = require('fs');
const client = require('../bot');
const request = require('request')
const Canvas = require("canvas");
console.log("[Loading] : API - V1 router loading...");

 
// Write "Awesome!"
//router.get("/api/v1/bots/:id/widget", async (req,res) => { });
router.get("/api", async (req,res) => {
    res.json({status: true, code: 200});
});

router.post("/api/v1/postStats",(req,res)=>{
    let token = req.headers.authorization;
    if (!token) return res.json({status: false, code: 0});
    const info = Object.values(db.get("bots"), {}).filter(c => c.token === token)[0]
    if(!info) return res.json({status: false, code: 0});
    console.log(req.body) // burada konsola yazdırıyorumö
    res.json({status:true})
})

router.get("/api/v1/bots/:token",(req,res)=>{
    const data = Object.values(db.get("bots"), {}).filter(c => c.token === req.params.token)[0]
    if(!data) return res.json({status: false, code: 0, message: "A bot for the specified Token was not found!"}); 
    if(data) {
        let response = {
            status: true,
            code: 200,
            id: data.id,
            username: data.username,
            discriminator: data.discriminator,
            prefix: data.prefix,
            webSite: data.website,
            supportServer: data.supportServer,
            tags: data.tags.split(","),
            owner: data.owner,
            owners: data.owners.split(","),
            status: data.status,
            adedDate: data.date,
            votes: data.votes || null,
            invites: data.invites || null,
            servers: data.servers || null,
            members: data.members || null
        }
        res.json(response);
    } else {
        res.json({status: false});
    }
})

request.get({
    url: "https://bots.land/api/v1/bots/795698804833517598",
    headers: {
        "Authorization": "52FLPaowpVG4qLQXJC"
    }
}, function(err,req,body){
 //body = JSON.parse(body)
})

/* Token Api */

router.post("/api/token/stats", (req,res)=>{
    let gelen = req.headers.authorization;
    if (!gelen) return;
    const info = Object.values(db.get("bots"), {}).filter(c => c.token === gelen)[0]
    if(info) {
        let data = info;
        let info_res = {
            id: data.id,
            username: data.username,
            discriminator: data.discriminator,
            prefix: data.prefix,
            webSite: data.website,
            supportServer: data.supportServer,
            tags: data.tags.split(","),
            owner: data.owner,
            owners: data.owners.split(","),
            status: data.status,
            adedDate: data.date,
            votes: data.votes || null,
            invites: data.invites || null,
            servers: data.servers || null,
            members: data.members || null
        }
        res.json({status: true, message: info_res});
    } else {
        res.json({status: false});
    }
})

/*
router.get("/api/v1/bots/:id/widget", async (req,res) => {
    let id = req.params.id;
    
    if (!id) return res.json({status: false, message: ""});
    let data = db.get(`bots.${id}`);
    if (!data) return res.json({status: false, message: "A bot for the specified ID was not found!"});
    let owner;
    let botData;
    try {
      owner = await client.users.fetch(data.owner);  
      botData = await client.users.fetch(data.id);
    } catch (error) {
        
    }
    const canvas = Canvas.createCanvas(480, 200); 
    const ctx = canvas.getContext('2d');
    Canvas.registerFont("router/Mulish-VariableFont_wght.ttf", {family: "Mulish"});
    const background = await Canvas.loadImage('https://cdn.discordapp.com/attachments/797785842398658590/800015027679395860/widget.png');
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
   
    let size = 35
    let voteSize = 16;
    while(ctx.measureText("test").width >= canvas.width - 100){
      size -= 5;
    }
  
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.font = `${size}px Mulish`
    ctx.fillText("test", 100, 57);
    
    ctx.font = `${voteSize}px Mulish`
    ctx.fillText("Votes: 1244", 40, 127);
  
    ctx.font = `${voteSize}px Mulish`
    ctx.fillText("Invites: 4005", 280, 127);
    
     ctx.font = `${voteSize}px Mulish`
    ctx.fillText("Owner: 4005", 40, 173);
   
    ctx.font = `${voteSize}px Mulish`
    ctx.fillText("Library: 4005", 280, 170);
   
  let avatar;
  try {
    avatar = await Canvas.loadImage(`https://cdn.discordapp.com/${data.id}/${data.avatar}.png`);
  } catch (error) {
      console.log(error)
      res.redirect("/")
      return;
  }

    ctx.beginPath();;
    ctx.arc(52.3, 46, 35, 0, Math.PI *2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 17.3, 11, 70, 70);
    res.set("Content-Type","image/png");
    res.send(canvas.toBuffer());
});*/

router.get("/api/v1/bots/:token/:user/has-voted", async (req,res) => {
    let tokens = req.params.token;
    if (!tokens) return res.json({status: false});
    let data = Object.values(db.get("bots"), {}).filter(c => c.token === tokens)[0]

    if (!data) return res.json({status: false, message: "A bot for the specified ID was not found!"});
    let vote = db.get(`votes.${data.id}.${req.params.user}`);      
    if (!vote) return res.json({status: false});
    if (vote.time > new Date().getTime()) return res.json({status: true});
    else return res.json({status: false});
});


module.exports = router;