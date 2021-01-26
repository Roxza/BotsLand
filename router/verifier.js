const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');
const Discord = require('discord.js');
const request = require('request');

router.get("/verifier", (req,res) => {
    res.render("verifier.ejs");
});

module.exports = router;
