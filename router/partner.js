const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');
const Discord = require('discord.js');
const request = require('request');

router.get("/partners", (req,res) => {
    res.render("partner.ejs", {
        title: "Partners | Bots Land",
        req: req,
        bot: client,
        user: req.user
});
});
module.exports = router;
