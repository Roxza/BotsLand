const express = require('express');
const router = require('express').Router();
const db = require('quick.db');
const path = require("path");
const client = require('../../bot');
const ms = require('ms');
const { channels } = require('../../bot');

console.log("[Loading] : Admin - Api router loading...");

router.post("/posts/approve", async (req,res) => {
    let data = req.body;
    if (!req.user) return;
    
    try {
        client.guilds.cache.get("785468934844973056").member(db.get(`bots.${data.id}`).owner).roles.add("794266836387627019");        
    } catch (error) {
        
    }

    let id = req.body.id;

    if (!id) return;

    if (!db.get(`bots.${id}`) || db.get(`bots.${id}`).status > 0) {
        return res.json({
            status: false,
            message: "This bot has already been checked."
        });
    };

    if (req.cookies.timeout) {
        return res.json({status: false, message: "Rate limit! Try again in 10 seconds."});
    }

    let owner = client.users.cache.get(db.get(`bots.${id}`).owner);
    if (owner) {
        owner.send(`:tada: Your bot named **${db.get(`bots.${id}`).username}** has been approved! Your bot's page: https://bots.land/bot/${id} `);
        try {
            client.channels.cache.get("797753591343087616").send(`<:check_mark:787604864288948225> <@${db.get(`bots.${id}`).owner}>'s bot named **${db.get(`bots.${id}`).username}** was approved by <@${req.user.id}>.`);
        } catch (error) {
            console.log(error)
        }
    }

    db.set(`bots.${id}.status`, 1);
    db.add(`modstats.${req.user.id}.approveCount`, 1);
    db.add(`modstats.${req.user.id}.earning`, 0.03);
    res.cookie('timeout', Date.now() + ms("10s"), { maxAge: ms("10s"), httpOnly: true })
    res.json({
        status: true
    });    
});

router.post("/posts/decline", (req,res) => {
    let data = req.body;
    if (!req.user) return;
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return;
    if (!member.roles.cache.get("794265637312397342")) return;

    let id = req.body.id;

    if (!id) return;

    if (!db.get(`bots.${id}`)) {
        return res.json({
            status: false,
            message: "An error occured!"
        });
    };

    if (req.cookies.timeout) {
        return res.json({status: false, message: "Rate limit! Try again in 10 seconds."});
    }

    if (data.reason.length < 3) return res.json({status: false, message: "Please enter a reason!"});

    let owner = client.users.cache.get(db.get(`bots.${id}`).owner);
    if (owner) {
        try {
            owner.send(`<:x_mark:787604461572325386> Your bot named **${db.get(`bots.${id}`).username}** has been declined! \n\nReason: \`\`\` ${data.reason}\`\`\` `);
        } catch (error) {
            console.log(error);
        }
        client.channels.cache.get("797753591343087616").send(`<:x_mark:787604461572325386> <@${db.get(`bots.${id}`).owner}>'s bot named **${db.get(`bots.${id}`).username}** was declined by <@${req.user.id}>.`);
    }

    if (data.action == "kick") {
        try {
            if(client.guilds.cache.get("785468934844973056").members.cache.get(`${id}`))
                client.guilds.cache.get("785468934844973056").members.cache.get(`${id}`).kick();
        } catch (error) {
            console.log(error)
        }
    }

    db.delete(`bots.${id}`);
    db.delete(`stats.${id}`);
    db.add(`modstats.${req.user.id}.declineCount`, 1);
    db.add(`modstats.${req.user.id}.earning`, 0.03);
    res.cookie('timeout', Date.now() + ms("10s"), { maxAge: ms("10s"), httpOnly: true })
    res.json({
        status: true
    });    
});

router.post("/posts/ban", async(req,res) => {
    let data = req.body;
    if (!req.user) return;
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return;
    if (!member.roles.cache.get("794265637312397342")) return;

    let id = req.body.id;
    if (!id) return;

    if (req.cookies.timeoutban) {
        return res.json({status: false, message: "Rate limit! Try again in 3 minutes."});
    }

    if (!data.id) {
        return res.json({status: false, message: "Please enter a id."});
    }
    let banMember = client.guilds.cache.get("785468934844973056").members.cache.get(`${id}`);
    if (!banMember) {
        return res.json({status: false, message: "This person was not found."});
    }

    if (Object.values(db.get(`bots`)).filter(d => d.owner == banMember || d.owners.includes(banMember))) {
        for (let i = 0; i < Object.values(db.get(`bots`)).filter(d => d.owner == banMember || d.owners.includes(banMember))[0].length; i++) {
            let memberbots = Object.values(db.get(`bots`)).filter(d => d.owner == banMember || d.owners.includes(banMember))[i];
            try {
                await client.guilds.cache.get("785468934844973056").members.cache.get(`${memberbots.id}`).kick();
             } catch (error) {
                 console.log(error)
             }
        }
    }

    if (!banMember.bannable) {
        return res.json({status: false, message: "You cannot Ban this person!"});
    };

    try {
       await client.guilds.cache.get("785468934844973056").members.cache.get(`${id}`).ban();
    } catch (error) {
        console.log(error)
    }
    db.set(`users.${id}.ban`, true);
    res.cookie('timeoutban', Date.now() + ms("3m"), { maxAge: ms("3m"), httpOnly: true })
    res.json({
        status: true
    });    
});

router.post("/posts/decline-report", async(req,res) => {
    let data = req.body;
    if (!req.user) return;
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return;
    if (!member.roles.cache.get("794265637312397342")) return;

    let code = req.body.code;

    if (!code) return;

    if (!db.get(`reports.${code}`)) {
        return res.json({
            status: false,
            message: "An error occured!"
        });
    };

    if (req.cookies.timeout) {
        return res.json({status: false, message: "Rate limit! Try again in 10 seconds."});
    }

    if (data.reason.length < 3) return res.json({status: false, message: "Please enter a reason!"});
    client.channels.cache.get("797843391320293429").send(`<@${db.get(`reports.${code}`).user}>'s report was declined.`);
    
    try {
        await client.users.cache.get(db.get(`reports.${code}`).user).send("A report you sent has been reviewed and declined. \n\nReason: ```" + data.reason + "```");
    } catch (error) {
        console.log(error);
    }

    db.delete(`reports.${code}`);
    res.cookie('timeout', Date.now() + ms("10s"), { maxAge: ms("10s"), httpOnly: true })
    res.json({
        status: true
    });    
});

router.post("/posts/approve-report", async (req,res) => {
    let data = req.body;
    if (!req.user) return;
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return;
    if (!member.roles.cache.get("794265637312397342")) return;

    let code = req.body.code;

    if (!code) return;

    if (!db.get(`reports.${code}`)) {
        return res.json({
            status: false,
            message: "This report has already been checked."
        });
    };

    if (req.cookies.timeout) {
        return res.json({status: false, message: "Rate limit! Try again in 10 seconds."});
    }

    client.channels.cache.get("797843391320293429").send(`<@${db.get(`reports.${code}`).user}>'s report was examined by our moderators and the necessary action was taken.`);
    try {
       await client.users.cache.get(db.get(`reports.${code}`).user).send(`Hey <@${db.get(`reports.${code}`).user}>, a report you sent has been reviewed and approved.`);
    } catch (error) {
        console.log(error);
    }
    db.delete(`reports.${code}`);
    res.cookie('timeout', Date.now() + ms("10s"), { maxAge: ms("10s"), httpOnly: true })
    res.json({
        status: true
    });    
});


router.post("/posts/give-premium", (req,res) =>{
    let data = req.body;
    if (!req.user) return;
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return;
    if (!member.roles.cache.get("794265637312397342")) return;

    try {
        client.guilds.cache.get("785468934844973056").member(data.id).roles.add("801411074586443796");        
    } catch (error) {
        
    }

    if (!data.id) return;
    res.json({
        status: true
    }); 
})

router.post("/posts/remove-premium", (req,res) =>{
    let data = req.body;
    if (!req.user) return;
    
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return;
    if (!member.roles.cache.get("794265637312397342")) return;

    try {
        client.guilds.cache.get("785468934844973056").member(data.id).roles.remove("801411074586443796");        
    } catch (error) {
        
    }

    if (!data.id) return;
    res.json({
        status: true
    }); 
})

router.post("/posts/ban-submitting-bot", (req,res) =>{
    let data = req.body;
    if (!req.user) return;
    let guild = client.guilds.cache.get("785468934844973056");
    let member = guild.members.cache.get(req.user.id);
    if (!member) return;
    if (!member.roles.cache.get("794265637312397342")) return;

    if (!data.id) return;
    db.set(`users.${data.id}.ban-submitting-bot`, true);
    res.json({
        status: true
    }); 
})

router


module.exports = router;