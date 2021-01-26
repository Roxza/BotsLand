const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');

console.log("[Loading] : Report Bot router loading...");


router.get("/bot/:id/report", (req,res) => {
    if (!req.user) return res.redirect("/auth/login?returnURL=/bot/" + req.params.id + "/report");
    let id = req.params.id;
    let data = Object.values(db.get("bots")).filter(d => d.id === id)[0];
    if (!data) return res.redirect("/");
    if (!id) return res.redirect("/");
    res.render("report-bot.ejs", {
        title: data.username + " | Report",
        bot: client,
        user: req.user,
        req: req,
        bdata: data,
        data: data,
        db: db,
    })
})

module.exports = router;