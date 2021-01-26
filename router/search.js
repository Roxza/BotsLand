const router = require('express').Router();
const db = require('quick.db');
const ms = require('ms');
const client = require('../bot');

console.log("[Loading] : Search router loading...");

/* Search Start */

router.get("/search", (req,res) =>{
    let key = req.query.q;
    let page = req.query.page || 1;

    if (!key || key.length <= 0) return res.redirect("/");
    let data = Object.values(db.get("bots") || {}).filter(d => d.status >= 1 && (d.username.toLowerCase().includes(key.toLowerCase()) || d.shortDescription.toLowerCase().includes(key.toLowerCase()))).sort(function (a,b) { return b - a.votes; });
    //if (page < 1 || (page != Math.ceil(data.length / 8) && data.length > 0)) return res.redirect(`/search?q=${key}&page=1`);
    if(page < 1) return res.redirect(`/search?q=${key}&page=1`);
    if(data.length <= 0) return res.redirect("/");
    if((page > Math.ceil(data.length / 8)))return res.redirect(`/search?q=${key}&page=1`);

    if (Math.ceil(data.length / 8) < 1) {
        page = 1;
    };
    res.render("search.ejs", {
        title: "Search Results | Bots Land",
        user: req.user,
        db: db,
        req: req,
        bot: client,
        data: data,
        page: page,
        q: key
    });

});

module.exports = router;
