const express = require('express');
const router = require('express').Router();
const db = require('quick.db');
const path = require("path");
const client = require('../../bot');

console.log("[Loading] : Admin - Index router loading...");

const templateDir = path.resolve(`${process.cwd()}${path.sep}/views/admin/`); 
router.use("/assets", express.static(path.resolve(`${templateDir}${path.sep}/assets`)));
router.use("/assets/css", express.static(path.resolve(`${templateDir}${path.sep}/assets/css`)));
router.use("/assets/images", express.static(path.resolve(`${templateDir}${path.sep}/assets/images`)));
router.use("/assets/js", express.static(path.resolve(`${templateDir}${path.sep}/assets/js`)));
router.use("/assets/font", express.static(path.resolve(`${templateDir}${path.sep}/assets/font`)));
router.use("/assets/plugins", express.static(path.resolve(`${templateDir}${path.sep}/assets/plugins`)));

router.get("/", (req,res) => {
    if (!req.user) return res.redirect("/auth/login");
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return res.redirect("/");
    if (!member.roles.cache.get("794265637312397342")) return res.redirect("/");

    res.render("admin/index.ejs", {
        user: req.user,
        db: db,
        bot: client,
    });
});

let waitingBotsRouter = require('./waiting-bots');
router.use("/", waitingBotsRouter);

let approvedBotsRouter = require('./approved-bots');
router.use("/", approvedBotsRouter);


let applicationsRouter = require('./certification-applications');
router.use("/", applicationsRouter);


let apiRouter = require('./api');
router.use("/", apiRouter);

let banRouter = require('./ban');
router.use("/", banRouter);

let botReportsRouter = require('./bot-reports');
router.use("/", botReportsRouter);

let premiumRouter = require('./premium');
router.use("/", premiumRouter);

module.exports = router;