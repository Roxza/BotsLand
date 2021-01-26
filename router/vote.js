const router = require('express').Router();
const db = require('quick.db');
const client = require('../bot');

console.log("[Loading] : vote router loading...");


router.get("/bot/:id/vote", (req,res) => {
    let id = req.params.id;
    let data = Object.values(db.get("bots")).filter(d => d.id === id)[0];
    if (!data) return res.redirect("/");
    if (!id) return res.redirect("/");

    if (data.status == 0) return res.redirect("/");
    res.render("vote.ejs", {
        title: data.username + " | vote",
        bot: client,
        user: req.user,
        data: data,
        req: req,
        db: db,
    })
})

module.exports = router;