const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');

console.log("[Loading] : Index router loading...");

router.get("/", (req,res) => {
    let bestBotsData = Object.values(db.get("bots") || {}).filter(b => b.status >= 1).sort(function (a,b) { return b.votes - a.votes })
    let lastAddedBots = Object.values(db.get("bots") || {}).filter(b => b.status >= 1).sort(function (a,b) { return b.date - a.date })
    res.render("index.ejs", {
        title: "Discord Bots | Discord Bot List | Bots Land",
        user: req.user,
        req: req,
        db: db,
        bot: client,
        bestBotsData: bestBotsData,
        lastAddedBots: lastAddedBots
    })
})

router.get("/404", (req,res) =>{
    res.send("404 NOT FOUND!")
})

module.exports = router;