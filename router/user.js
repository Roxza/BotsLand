const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');
const Discord = require('discord.js');
const request = require('request')

console.log("[Loading] : User router loading...");

router.get("/user/:id", async (req,res) => {
    if (!db.get(`users.${req.params.id}`)) return res.redirect("/");
        let user = await client.users.fetch(req.params.id);
        let member = client.guilds.cache.get("785468934844973056").members.cache.get(user.id) || null;
        let userFlags = [];
        if (user.flags) {
            userFlags = new Discord.UserFlags(user.flags.bitfield).toArray();
        }
        let userBotsData = Object.values(db.get("bots") || {}).filter(b => (b.owner == req.params.id || b.owners.includes(req.params.id)) && b.status >= 1).sort(function (a,b) { return b.date - a.date });
        if (req.user) {
            if (req.user.id == req.params.id) {
                userBotsData = Object.values(db.get("bots") || {}).filter(b => b.owner == req.params.id || b.owners.includes(req.params.id)).sort(function (a,b) { return b.date - a.date });
            } else {
                userBotsData = Object.values(db.get("bots") || {}).filter(b => (b.owner == req.params.id || b.owners.includes(req.params.id)) && b.status >= 1).sort(function (a,b) { return b.date - a.date });
            }
        } else {
            userBotsData = Object.values(db.get("bots") || {}).filter(b => (b.owner == req.params.id || b.owners.includes(req.params.id)) && b.status >= 1).sort(function (a,b) { return b.date - a.date });
        }

    res.render("user.ejs", {
        title: user.username + " | Bots Land",
        userr: user,
        userBotsData: userBotsData,
        user: req.user,
        db: db,
        userid: req.params.id,
        user1: req.user,
        bot: client,
        member: member,
        userFlags: userFlags,
        req: req
    })
})

module.exports = router;