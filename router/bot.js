const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');
console.log("[Loading] : Bot router loading...");


router.get("/bot/:id", async (req,res) => {

    let id = req.params.id;
    let data = Object.values(db.get("bots")).filter(d => d.id === id)[0];

    if (!data) return res.redirect("/");
    if (!id) return res.redirect("/");


    if (data.status === 0) {
        if (!req.user) return res.redirect("/auth/login");
        let member = client.guilds.cache.get("785468934844973056").members.cache.get(req.user.id)
        if (member){
            if (data.owner != req.user.id && !data.owners.includes(req.user.id) && !member.roles.cache.get("794265637312397342")) return res.redirect("/");
        }
        if (!member){
        if (data.owner != req.user.id && !data.owners.includes(req.user.id)) return res.redirect("/");
        }
    }

    let owner = await client.users.fetch(data.owner);
    let owners = [];

    if (data.owners) {
        for(let i = 0; i < data.owners.split(",").length; i++) {
            try {
                let ownerData = await client.users.fetch(data.owners.split(",")[i]);
            owners.push(ownerData)
            } catch (error) {
                console.log(error)
            }

        }
    }
    if (!req.session.visit) {
        req.session.visit = true;
        let statsVisitorsData = {
            date: Date.now(),
            id: id, 
            referringUrl: String(req.headers.referer)
        }

        if (!db.get(`stats.${id}.referringUrls`)) db.set(`stats.${id}.referringUrls`, []);

        if (!db.get(`stats.${id}.referringUrls`).filter(d=> d == String(req.headers.referer))[0]) {
            let url = String(req.headers.referer) || "undefined"
            db.push(`stats.${id}.referringUrls`, url)
        }
        db.push(`stats.${id}.visitors`, statsVisitorsData); 

        //db.add(`bots.${req.params.id}.visitors`, 1);
    }
    let getbotdata = await client.users.fetch(data.id);
    let badge = false;
    if (client.guilds.cache.get("785468934844973056").members.cache.get(getbotdata.id)) {
       badge = client.guilds.cache.get("785468934844973056").members.cache.get(getbotdata.id).roles.cache.get("794266963282886686")
    }
    res.render("bot.ejs", {
        title: data.username + " | Discord Bots",
        image: "https://cdn.discordapp.com/avatars/" + data.id + "/" + data.avatar,
        bot: client,
        getOwner: owner,
        getbotdata: getbotdata,
        req: req,
        badge: badge,
        owners: owners,
        user: req.user,
        data: data,
        db: db,
    })
})

module.exports = router;