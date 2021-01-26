const router = require('express').Router();
const db = require('quick.db');
const request = require('request')
const client = require('../bot.js');

db.delete("control");
console.log("[Loading] : Submit Bot router loading...");

router.get("/bots/submit", (req, res) => {
    if (!req.user) return res.redirect("/auth/login");
    res.render("submit.ejs", {
        title: "Submit Bot | Bots Land",
        user: req.user,
        req: req,
        bot: client
    });
});

router.post("/bots/submit", async (req, res) => {

    if (!req.user) {
        res.redirect("/auth/login")
        return;
    }
    let data = req.body;
    let errors = { isError: false };

    if (!data.id) {
        errors.isError = true;
        errors.id = "Please enter the ID of your bot.";
    } else {
        if (data.id.length < 18) {
            errors.isError = true;
            errors.id = "Bot ID sent incorrectly. Please check.";
        } else {
            let botControl = Object.values(db.get("bots") || {}).filter(d => d.id === data.id)[0];
            if (botControl) {
                errors.isError = true;
                errors.isAlreadyAddedContol = "This bot already added our website";
            }
        }
    }

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

    if (data.owners && data.owners.split(",").includes(req.user.id)) {
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
            errors.short = "The short description can be up to 200 characters.";
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

    function random(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    if (errors.isError === false) {
        if (db.get(`users.${req.user.id}.ban-submitting-bots`) == true) {
            errors.isError = true;
            errors.ban = "Your bot submitting is banned by our moderators.";
            return;
        }
        try {
            let body = await client.users.fetch(data.id)
            if (body.username.includes("@")) {
                errors.isError = true;
                errors.username = "Your bot's username cannot contain <b>@</b>.";
                return;
            }
            if (!body.bot) {
                errors.isError = true;
                errors.isBot = "Your ID does not belong to a bot.";
            } else {
                let addBotData = {
                    id: body.id,
                    username: body.username,
                    discriminator: body.discriminator,
                    avatar: body.avatar,
                    shortDescription: data.shortDescription,
                    detailedDesc: data.detailedDescription,
                    tags: data.tags,
                    prefix: data.prefix,
                    website: data.website,
                    supportServer: data.supportServer,
                    inviteLink: data.inviteLink,
                    owner: req.user.id,
                    owners: data.owners,
                    votes: 0,
                    token: random(18),
                    invites: 0,
                    date: Date.now(),
                    rating: "0.0",
                    visitors: 0,
                    earning: 0,
                    status: 0
                };
                db.set(`bots.${body.id}`, addBotData);

                await client.channels.cache.get("797753591343087616").send(`<@${req.user.id}> applied with the bot named **${addBotData.username + "#" + addBotData.discriminator}**`)
                if (await client.users.cache.get(addBotData.owner)) {
                    await client.users.cache.get(addBotData.owner).send(`Hey <@${req.user.id}>, we received the application for **${addBotData.username + "#" + addBotData.discriminator}**. Please be patient...`)
                }
            }

        } catch (error) {
            errors.isError = true;
            errors.isBot = "Your ID is incorrect.";
            console.log(error)
        }
    }

    res.send(errors);
    /*if (errors.isError === false) {
        request({
            method: "GET",
            url: "https://discord.com/api/v7/users/"+ data.id,
            headers: {
                Authorization: "Bot Nzk1Njk4ODA0ODMzNTE3NTk4.X_NKQg.uUDWepzkB6m3lYL3uR7T-iPiz8Y"
            }
        }, function (err, request, body) {
            body = JSON.parse(body);

            let dbData = {
                message: body.message || null,
                bot: body.bot || false
            }
            db.set("control", dbData);
            if (!dbData.message && dbData.bot) {
                let addBotData = {
                    id: body.id,
                    username: body.username,
                    discriminator: body.discriminator,
                    avatar: body.avatar,
                    shortDescription: data.shortDescription,
                    detailedDesc: data.detailedDescription,
                    tags: data.tags,
                    prefix: data.prefix,
                    website: data.website,
                    supportServer: data.supportServer,
                    inviteLink: data.inviteLink,
                    owner: req.user.id,
                    owners: data.owners,
                    votes: 0,
                    token: random(18),
                    invites: 0,
                    date: Date.now(),
                    rating: "0.0",
                    visitors: 0,
                    earning: 0,
                    status: 0
                };
                db.set(`bots.${body.id}`, addBotData);

                client.channels.cache.get().send(`<@${req.user.id}> applied with the bot named **${addBotData.username + "#" + addBotData.discriminator}**`)
            }
        })
        setTimeout(() => {
            let control = db.get("control") || {};
            if (control.message === 'Unknown User') {
                    errors.isError = true;
                    errors.isBot = "Your ID is incorrect.";
                    db.delete("control");

            } else {
                if (control.bot === false) {
                    errors.isError = true;
                    errors.isBot = "Your ID does not belong to a bot.";
                }
                db.delete("control")
            }
        res.send(errors);
    }, 1000);
        
    } else {
        res.send(errors);
    }*/
})

module.exports = router;
