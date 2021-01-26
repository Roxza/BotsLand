const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');

console.log("[Loading] : Index router loading...");

router.get("/applications/certification", async (req,res) => {
    let id = req.query.id;
    let bot = Object.values(db.get("bots")).filter(d => d.id === id)[0];
    if (!id || !bot) return res.redirect("/");

    if (!req.user) return res.redirect("/");
    if (req.user.id != bot.owner && !bot.owners.includes(req.user.id)) return res.redirect("/");

    let bdata = await client.users.fetch(bot.id);
   res.render("applications/certification.ejs", {
        req: req,
        user: req.user,
        title: "Certificate Application | Bots.land",
        data: bot,
        bdata: bdata,
        bot: client
    });
});

router.post("/applications/certification", async (req,res) => {
    let id = req.query.id;
    let data = req.body;
    let bot = Object.values(db.get("bots")).filter(d => d.id === id)[0];
    if (!id || !bot) return;
    if (!req.user) return res.json({status: false, message:"Please login with Discord."});
    if (req.user.id != bot.owner && !bot.owners.includes(req.user.id)) return;
    if (data.servers < 100) return res.json({status: false, message: "To apply, your bot must be in at least 100 servers."});
    if (data.codes.length == 0) return res.json({status: false, message: "Please select if you own 100% of your bot's codes."});
    if (data.english_support.length == 0) return res.json({status: false, message: "Please select if your bot has English support."});
    if (data.website.length == 0) return res.json({status: false, message: "Please select if your bot has website."});
    if (data.description.length < 50) return res.json({status: false, message: "You can write up to 50 characters in the description."});

    let dbdata = {
        id: req.query.id,
        servers: data.servers,
        codes: data.codes,
        english_support: data.english_support,
        website: data.website,
        description: data.description
    }
    db.set(`applications.${id}`, dbdata);
    res.json({status: true});
});


module.exports = router; 