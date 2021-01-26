const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');

console.log("[Loading] : vote router loading...");


router.get("/tag/:tag", (req,res) => {
    let tag = req.params.tag;
    let page = req.query.page || 1;
    let data = Object.values(db.get("bots") || {}).filter(d => d.tags.includes(tag) && d.status > 0);
    if (!data.length) return res.redirect("/");
    if (tag.length < 1) return res.redirect("/");
    //if (page < 1 || (page != Math.ceil(data.length / 8) && data.length > 0)) return res.redirect(`/tag/${tag}?page=1`);
    if(page < 1) return res.redirect(`/tag/${tag}?page=1`);
    if(data.length <= 0) return res.redirect("/");
    if((page > Math.ceil(data.length / 8)))return res.redirect(`/tag/${tag}?page=1`);
    
    if (Math.ceil(data.length / 8) < 1) {
        page = 1;
    };
    res.render("tag.ejs", {
        title: tag + " Bots | Discord Bots",
        bot: client,
        tag: tag,
        page: page,
        user: req.user,
        req: req,
        data: data,
        db: db,
    })
})

router.get("/tags", (req,res) => {
    res.render("tags.ejs", {
        title: "Tags | Bots Land",
        bot: client,
        user: req.user,
        req: req,
        db: db,
    })
})

module.exports = router;