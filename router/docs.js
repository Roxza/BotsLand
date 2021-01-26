const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');
const Discord = require('discord.js');
const request = require('request');

router.get("/docs", (req,res) => {
    res.render("docs/docs.ejs", {
        title: "Documentation | Bots Land",
        req: req,
        bot: client,
        user: req.user
    });
});

router.get("/docs/bot-page/css-classes", (req,res) => {
    res.render("docs/css-classes.ejs", {
        title: "CSS Classess | Bots Land",
        req: req,
        bot: client,
        user: req.user
    });
});
router.get("/docs/bot-page/examples", (req,res) => {
    res.render("docs/examples.ejs", {
        title: "CSS Classess | Bots Land",
        req: req,
        bot: client,
        user: req.user
    });
});

module.exports = router;
