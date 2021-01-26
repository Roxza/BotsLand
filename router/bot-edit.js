const router = require('express').Router();
const db = require('quick.db');
const request = require('request')
const client = require('../bot.js');

db.delete("control");
console.log("[Loading] : Edit Bot router loading...");

router.get("/bot/:id/edit", (req,res) =>{
    try {
        let guild = client.guilds.cache.get("785468934844973056");
        let member = guild.members.cache.get(req.user.id);
        let botdata = db.get(`bots.${req.params.id}`);
        if (!req.user || (!botdata.owners.includes(req.user.id) && !member.roles.cache.get("794265637312397342") && botdata.owner != req.user.id)) {
            res.redirect("/");
            return;
        }
        res.render("bot-edit.ejs",{
            title: "Edit your Bot | Bots Land",
            user: req.user,
            req: req,
            data: botdata,
            bot: client
        });
    } catch (error) {
        res.redirect("/");
    }
});

router.post("/bots/edit/:id", async (req,res) => {
    try {
        let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    let botdata = db.get(`bots.${req.params.id}`);
    if (!req.user) return res.redirect("/auth/login");
    if (!botdata) return res.redirect("/");
    if (!req.user || (!botdata.owners.includes(req.user.id) && !member.roles.cache.get("794265637312397342") && botdata.owner != req.user.id)) {
        res.redirect("/");
        return;
    }
    let data = req.body;
    data.id = req.params.id;
    let errors = {isError: false};
  
    if (!data.prefix.length) {
        errors.isError = true;
        errors.prefix = "Please enter a prefix.";
    }

    if (!data.tags) {
        errors.isError = true;
        errors.tags = "Please indicate the tags of your bot.";
    } else {
        if (data.tags.split(",").length > 6) {
            errors.isError = true;
            errors.tags = "You can specify up to 6 tags for your bot.";
        }
    }

    if (data.owners && data.owners.split(",").includes(req.user.id) && data.owner == req.user.id) {
        errors.isError = true;
        errors.selfowner = "You cannot add yourself to other CO-Owners.";
    }
    
    if (data.owners && data.owners.split(",").length > 4) {
        errors.isError = true;
        errors.owners = "You can add up to 4 CO-Owners.";
    }

    if (!data.shortDescription) {
        errors.isError = true;
        errors.short = "Please enter a short description.";
    } else {
        if (data.shortDescription.length >= 200) {
            errors.isError = true;
            errors.short = "The short description can be up to 100 characters.";
        }
        if (data.shortDescription.length <= 30) {
            errors.isError = true;
            errors.short = "The short description can be at least 30 characters.";
        }
    }

    if (!data.detailedDescription) {
        errors.isError = true;
        errors.long = "Please enter a Detailed Description.";
    } else {
        if (data.detailedDescription.length < 300) {
            errors.isError = true;
            errors.long = "The detailed description can be at least 300 characters.";
        }
    }

    if (errors.isError === false) {
        db.set(`bots.${req.params.id}.prefix`, data.prefix);
        db.set(`bots.${req.params.id}.tags`, data.tags);
        db.set(`bots.${req.params.id}.inviteLink`, data.inviteLink);
        db.set(`bots.${req.params.id}.owners`, data.owners);
        db.set(`bots.${req.params.id}.website`, data.website);
        db.set(`bots.${req.params.id}.shortDescription`, data.shortDescription);
        db.set(`bots.${req.params.id}.detailedDesc`, data.detailedDescription);
        res.send(errors);
    } else {
        res.send(errors);
    }
    } catch (error) {
        
    }
})

module.exports = router;