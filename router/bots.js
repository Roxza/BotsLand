const router = require('express').Router();
const db = require('quick.db');
const ms = require('ms');
const client = require('../bot');

console.log("[Loading] : Bots router loading...");

/* Bots Start */

router.get("/bots", (req,res) =>{
    let page = req.query.page || 1;
    let data = Object.values(db.get("bots") || {}).filter(b => b.status > 0).sort(function (a,b) { return b.votes - a.votes; });
   // if (page < 1 || (page != Math.ceil(data.length / 8) && data.length > 0)) page = 1;

   if(page < 1) return res.redirect(`/bots`);
   if(data.length <= 0) return res.redirect("/");
   if((page > Math.ceil(data.length / 8)))return res.redirect(`/bots`);
    if (Math.ceil(data.length / 8) < 1) {
        page = 1;
    };
    res.render("bots.ejs", {
        title: "Best Bots | Bots Land",
        user: req.user,
        req: req,
        db: db,
        bot: client,
        data: data,
        page: page
    });

});

module.exports = router;
