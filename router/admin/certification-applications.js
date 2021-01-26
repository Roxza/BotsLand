const express = require('express');
const router = require('express').Router();
const db = require('quick.db');
const path = require("path");
const client = require('../../bot');
const ms = require('ms');
const { channels } = require('../../bot');

console.log("[Loading] : Certification router loading...");

router.get("/certification-applications", (req,res) => {
    
    if (!req.user) return res.redirect("/auth/login");
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/");
    if (!member.roles.cache.get("794265637312397342")) return res.redirect("/");

    res.render("admin/certification-applications.ejs", {
        user: req.user,
        db: db,
        bot: client,
    });
});

router.post("/approve/certification", (req,res) => {
    
    if (!req.user) return res.redirect("/auth/login");
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/");
    if (!member.roles.cache.get("794265637312397342")) return res.redirect("/");

    let id = req.body.id;
    let getbot = Object.values(db.get(`bots`)).filter(b => b.id == id)[0];

    try {
        client.guilds.cache.get("785468934844973056").members.cache.get(getbot.owner).send(":tada: Yay! The certification application of your bot named **"+ getbot.username +"** has been approved!");
        client.guilds.cache.get("785468934844973056").members.cache.get(getbot.owner).roles.add("794266641366122556")
        client.guilds.cache.get("785468934844973056").members.cache.get(id).roles.add("794266963282886686")
        client.guilds.cache.get("785468934844973056").channels.cache.get("801024733743022110").send(`<@${getbot.owner}>'s certification application has been approved! \nhttps://bots.land/bot/${id}`);
        res.json({status:true});
        db.delete(`applications.${id}`);
    } catch (error) {
        res.json({status:true, message: error});
    }
    
});

router.post("/decline/certification", (req,res) => {
    
    if (!req.user) return res.redirect("/auth/login");
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/");
    if (!member.roles.cache.get("794265637312397342")) return res.redirect("/");

    let id = req.body.id;
    let getbot = Object.values(db.get(`bots`)).filter(b => b.id == id)[0];

    try {
        client.guilds.cache.get("785468934844973056").members.cache.get(getbot.owner).send("Oops! The certification application of your bot named **"+ getbot.username +"** has been declined! \n\nReason: ```" + req.body.reason + "```");
        res.json({status:true});
        db.delete(`applications.${id}`);
    } catch (error) {
        res.json({status:true, message: error});
    }

});














module.exports = router;