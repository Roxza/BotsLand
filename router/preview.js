const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');
var md = require('markdown-it')({
    html: true,
    linkify: true,
    breaks: true,
    typographer: true
  });
console.log("[Loading] : Bot router loading...");


router.get("/bot/:id/preview", async (req,res) => {

    let id = req.params.id;
    let data = Object.values(db.get("previews")).filter(d => d.id === id)[0];
    let botowner = Object.values(db.get("bots")).filter(b => b.id === id)[0];
    if (!botowner) return;
    let postdata = req.body;
    let owner = await client.users.fetch(botowner.owner);
    let owners = [];

    if (req.user) {
        if (botowner.owner != req.user.id && !botowner.owners.includes(req.user.id)) return;
    } else {
        return;
    }

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

    let getbotdata = await client.users.fetch(data.id);
    let badge = false;
    if (client.guilds.cache.get("785468934844973056").members.cache.get(getbotdata.id)) {
       badge = client.guilds.cache.get("785468934844973056").members.cache.get(getbotdata.id).roles.cache.get("794266963282886686")
    }
    res.render("preview.ejs", {
        title: data.username + " | Bot",
        image: "https://cdn.discordapp.com/avatars/" + data.id + "/" + data.avatar,
        bot: client,
        getOwner: owner,
        getbotdata: getbotdata,
        badge: badge,
        md: md,
        req: req,
        owners: owners,
        user: req.user,
        data: data,
        db: db,
    })
})

module.exports = router;