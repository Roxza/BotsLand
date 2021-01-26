const router = require('express').Router();
const db = require('quick.db');
const request = require('request')
const client = require('../bot.js');
const moment = require('moment')
const ms = require('ms');
db.delete("control");
console.log("[Loading] : Stat router loading...");

router.get("/bot/:id/stats", (req,res) =>{
    let botdata = db.get(`bots.${req.params.id}`);
    if (!req.user) return res.redirect("/auth/login");
    if (!botdata) return res.redirect("/");
    if (!botdata.owners.includes(req.user.id) && botdata.owner != req.user.id) {
        res.redirect("/");
        return;
    }
    let uniquevisitors = db.get(`stats.${botdata.id}.visitors`).length || 0;
    res.render("stats.ejs",{
        title: "Stats | Bots Land",
        user: req.user,
        req: req,
        bot: client,
        db: db,
        uniquevisitors:uniquevisitors,
        botData: botdata,
        moment: moment,
        ms: ms
    });
});

module.exports = router;