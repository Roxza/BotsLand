const router = require('express').Router();
const db = require('quick.db');
const session = require("express-session");
const client = require('../bot.js');
console.log("[Loading] : Stat router loading...");

router.use(session({
  secret: 'Secret',
  resave: false,
  saveUninitialized: true
}));

router.get("/bot/:id/invite", (req,res) =>{
    let bot = db.get(`bots.${req.params.id}`);
    if (!bot) return res.redirect("/");
    let botId = req.params.id;
    if (bot.inviteLink) {
        inviteLink = bot.inviteLink;
    } else {
        inviteLink = `https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot&permissions=0`; 
    }
    if (!req.session.invite) {
        req.session.invite = true;

        let statsInvitesData = {
            date: Date.now(),
            id: botId
        }
        db.push(`stats.${botId}.invites`, statsInvitesData);
        db.add(`bots.${req.params.id}.invites`, 1);
    }
    res.redirect(inviteLink);
    
});

module.exports = router;