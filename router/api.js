const router = require('express').Router();
const db = require('quick.db');
const request = require('request-json');
var client2 = request.createClient('https://localhost:8888/');
const ms = require('ms');
const client = require('../bot');

console.log("[Loading] : API router loading...");

/* Vote API */

router.post("/api/bots/vote", (req,res) => {
    let botId = req.body.id;
    if (!req.user) return res.json({status: false, message: "You have to be logged in to vote a bot.", code: "VOTE-1"});
    let userId = req.user.id;

    let getVoteData = db.get(`votes.${botId}.${userId}`);

    if (Object.values(db.get("bots")).filter(d => d.id === botId)[0].length < 1) return res.json({status: false, message: "The specified bot has not been added or approved on our website.", code: "VOTE-3"});
    
    if (Object.values(db.get(`votes.${botId}.${userId}`) || {})[0]) {
        if (getVoteData.time < Date.now()) {
            let voteDbData = {
                bot: botId,
                user: userId,
                time: Date.now() + ms("12h")
            };
            let statsVotesData = {
                date: Date.now(),
                id: botId,
                user: userId
            }

            if (!db.get(`stats.${botId}.votes`)) db.set(`stats.${botId}.votes`, [])
            db.push(`stats.${botId}.votes`, statsVotesData);
        
            db.add(`bots.${botId}.votes`, 1);
            db.add(`bots.${botId}.earning`, 0.5);
            db.set(`votes.${botId}.${userId}`, voteDbData);
            res.json({status: true, message: "You have successfully voted this bot!", code: "VOTE-200-OK"});
        } else {
            res.json({status: false, message: "You have already voted this bot in 12 hours.", code: "VOTE-2"});
        }
    } else {
        let voteDbData = {
            bot: botId,
            user: userId,
            time: Date.now() + ms("12h")
        };
        let statsVotesData = {
            date: Date.now(),
            id: botId,
            user: userId
        }
        if (!db.get(`stats.${botId}.votes`)) db.set(`stats.${botId}.votes`, [])
            db.push(`stats.${botId}.votes`, statsVotesData);
            db.add(`bots.${botId}.earning`, 0.5);
        db.add(`bots.${botId}.votes`, 1);
        db.set(`votes.${botId}.${userId}`, voteDbData);
        res.json({status: true, message: "You have successfully voted this bot.", code: "VOTE-200-OK"});
    }


});

/* Vote END */


/* Search Start */

router.post("/api/search", (req,res) =>{
    let key = req.body.key;
    if (key.length <=0) return res.json({status: true, data: []});
    let data = Object.values(db.get("bots"), {}).filter(d => d.status >= 1 && d.username.toLowerCase().includes(key.toLowerCase())).sort(function (a,b) { return b - a.votes; });
    res.json({status: true, data: data});

})

/* Report Submit (BOT) */

router.post("/api/submit-report", async (req,res) => {
    let data = req.body;
    if (!req.user) return res.json({status: false, message: "Please login to your account to continue."});
    if (data.message.length < 80) return res.json({status: false, message: "Please enter your reason with more details! (Minimum 80 characters)"});
    
    if(Object.values(db.get("reports") ||  {}).filter(b => b.user == req.user.id && b.id == req.query.id).length > 0) return res.json({status: false,  message: "You've already submited report about this bot. Please be patient."});

  
    if (req.cookies.report_rateLimit) return res.json({status: false, message: "Rate limit! Please wait 10 minutes and try again."});
    res.cookie('report_rateLimit', Date.now() + ms("10m"), { maxAge: ms("10m"), httpOnly: true });
    function randomCode(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
     }
    let code = randomCode(8);
    db.set(`reports.${code}`, {code: code, id: req.query.id, reason: data.reason, message: data.message, user: req.user.id});
    res.json({status: true});
})


/* User Edit */
router.post("/api/user-edit", (req,res)=>{
    let data = req.body;
    if (!data) return;
    if (!data.id)return;
    if (!req.user) return;
    if (req.user.id !== data.id) return;

    if (data.data.length < 1) return res.json({status: false, message: "Please enter a message."});;

    let badWords = require('./badwords.json');
    if (badWords.some(word => String(data.data).toLocaleLowerCase().includes(word))){
        return res.json({status: false, message: "You can't write bad words in your bio!"});;
    }

    res.json({status: true, message: "Your profile-bio has been successfully edited!"});
    db.set(`users.${data.id}.bio`, data.data);
})
/* User Edit Links */
router.post("/api/user-editlinks", (req,res)=>{
    let datalinks = req.body;
    if (!datalinks.id)return;
    if (!req.user) return;
    if (req.user.id != datalinks.id) return;

    //if (datalinks.length < 1) return res.json({status: false, message: "Please enter a message."});;

    let badWords = require('./badwords.json');
    if (badWords.some(word => String(datalinks.data).toLocaleLowerCase().includes(word))){
        return res.json({status: false, message: "You can't write bad words in your links!"});;

    } 
    res.json({status: true, message: "Your profile links has been successfully edited!"});
    let linksdata = {
        instagram: datalinks.instagramweb, //write names
        twitter: datalinks.twitterweb,
        github: datalinks.githubweb,
        website: datalinks.personalweb
    }
    db.set(`users.${req.user.id}.links`, linksdata);
})

/* User Delete Links */
router.post("/api/user-removeLinks", (req,res)=>{
    let datalinks2 = req.body;
    if (!datalinks2.id)return;
    if (!req.user) return;
    if (req.user.id != datalinks2.id) return;
    res.json({status: true, message: "Your profile links has been successfully removed!"});
    db.delete(`users.${req.user.id}.links`);
})


router.post("/api/bot/:id/preview", (req,res)=>{
    let id = req.params.id;
    let previewdata = req.body;
    if (req.user) {
    }
    let dbdataPREVIEW = {
        id: id,
        shortDescription: previewdata.shortDescription,
        detailedDesc: previewdata.detailedDescription,
        tags: previewdata.tags,
        prefix: previewdata.prefix,
        website: previewdata.website,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
        supportServer: previewdata.supportServer,
        inviteLink: previewdata.inviteLink,
        owner: req.user.id,
        owners: previewdata.owners,
    };
    db.set(`previews.${id}`,dbdataPREVIEW)
})

module.exports = router;
