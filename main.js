var express = require('express');
var app = express();
const Strategy = require("passport-discord").Strategy;
const session = require("express-session");
const path = require("path");
const db = require("quick.db");
const passport = require('passport');
const request = require('request');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const client = require('./bot')
const referrerPolicy = require('referrer-policy')
app.use(referrerPolicy({ policy: "strict-origin" }))
/*const minifyHTML = require('express-minify-html');
app.use(minifyHTML({
    override:      true,
    exception_url: false,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
})); */

const templateDir = path.resolve(`${process.cwd()}${path.sep}/views/`); 
app.use("/assets", express.static(path.resolve(`${templateDir}${path.sep}/assets`)));
app.use("/assets/css", express.static(path.resolve(`${templateDir}${path.sep}/assets/css`)));
app.use("/assets/img", express.static(path.resolve(`${templateDir}${path.sep}/assets/img`)));
app.use("/assets/js", express.static(path.resolve(`${templateDir}${path.sep}/assets/js`)));

const settings = {
    "clientID": "778960224001589309",
    "clientSecret": "knFvDDobrxdtecohd_sug1Sd2t7mRXbi",
    "callbackurl": "https://bots.land/auth/callback"
};

app.get("/robots.txt", function(req,res) {
    res.set('Content-Type', 'text/plain');
    res.send(`User-agent: *\nAllow: /\nSitemap: https://bots.land/sitemap.xml`);
});

app.get("/sitemap.xml", function(req,res) {
    let link = "<url><loc>https://bots.land/</loc></url>";
    Object.values(db.get("bots")).forEach(bot => {
        link += "\n<url><loc>https://bots.land/bot/"+bot.id+"</loc></url>";
    })
    res.set('Content-Type', 'text/xml');
    res.send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="https://www.google.com/schemas/sitemap-image/1.1">${link}</urlset>`);
});


app.post("/bot/:id/description", async (req,res) => {
    var xssFilter = require('xssfilter');
    var xssfilter = new xssFilter({
        matchStyleTag: false
    });
    let botdataDesc = db.get(`bots.${req.params.id}`);
    if (!botdataDesc) return;
    var md = require('markdown-it')({
        html: true,
        linkify: true,
        breaks: true,
        typographer: true
      });
    res.set('Content-Type', 'text/plain');
    if (req.query) {
        if (req.query.preview) {
            res.send(md.render(xssfilter.filter(Object.values(db.get("previews")).filter(d => d.id === req.params.id)[0].detailedDesc)));
            return;
        }
        if (req.query.markdown) {
            res.send(md.render(xssfilter.filter(botdataDesc.detailedDesc)).replaceAll(/<script/gi, "").replaceAll(/ajax/gi, "").replaceAll(/onprogress/gi, "").replaceAll(/$.post/gi, "").replaceAll(/api/gi, "API"));
        } else {
            res.send(xssfilter.filter(botdataDesc.detailedDesc));
        }
    } else {
        res.send(xssfilter.filter(botdataDesc.detailedDesc));
    }
});

app.get("/discord", function (req,res) {
    res.redirect("https://discord.gg/aMEfpbRebn");
});

app.use(bodyParser.urlencoded({extended: false}));
passport.serializeUser((user, done) => {
    done(null, user);
 });
 
 passport.deserializeUser((obj, done) => {
    done(null, obj)
 });
 
  
   app.use(session ({
     secret: "eeee",
     resave: false,
     saveUninitialized: false
   }))
   .use(passport.initialize())
   .use(passport.session())
   
   app.use(passport.initialize());
   app.use(passport.session());
   app.locals.domain = settings.domain;
   app.use(cookieParser())
 
   app.engine("html", require("ejs").renderFile);
   app.set("view engine", "html");
   app.set("view engine", "ejs");
 
   app.set("views", "views");
 
   app.use(bodyParser.json());
   app.use(bodyParser.urlencoded({
    extended: true
   }));
   var url = require('url');
   app.get("/auth/login", async (req,res) => {
    res.render("login.ejs", {
        req:req,
        user: req.user,
        title: "Login"
    });

   });
   app.get("/login", async (req, res, next) => {
       let scopes = ["identify","guilds.join"];
        if (req.query.joinServer == "true") {
            req.cookies.join = true;
        } else if (req.query.joinServer != "true") {
            scopes = ["identify"];
        }       
        if (req.query.returnURL) {
            req.session.returnURL = req.query.returnURL;
        }
        passport.use(new Strategy({
        clientID: settings.clientID,
        clientSecret: settings.clientSecret,
        callbackURL: settings.callbackurl,
        scope: scopes
       },
       (accessToken, refreshToken, profile, done) => {
          process.nextTick(() => done(null, profile));
        }));

        if (req.headers.referer) {
            const parsed = url.parse(req.headers.referer);
            req.session.backURL = parsed.path;
            if (req.query.returnURL) {
                req.session.returnURL = req.query.returnURL;
            }
        } else {
          req.session.backURL = "/";
        }
    next();
    },
    
    passport.authenticate("discord"));
    app.get('/auth/', passport.authenticate('discord'));
    app.get('/auth/callback', passport.authenticate('discord', {
        failureRedirect: '/'
    }), async (req, res) => {
    request({
        url: `https://discordapp.com/api/v8/guilds/785468934844973056/members/${req.user.id}`,
        method: "PUT",
        json: {
            access_token: req.user.accessToken
        },
        headers: {
            "Authorization": `Bot ${client.token}`
        },
    });
    if (db.get(`users.${req.user.id}.ban`) === true) return res.json({login: false, message: "Oops!! You are banned from Bots Land."});
    if (!db.get(`users.${req.user.id}`)) {
        let userData = {
            id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar,
            premium_type: req.user.premium_type || null,
            bio: null,
            discriminator: req.user.discriminator,
            lastLogin: new Date().getFullYear() + "/" + (Number(new Date().getMonth()) + Number(1)) + "/" + new Date().getDate()
        };
        db.set(`users.${req.user.id}`, userData);
    } else {
        let userData = {
            id: req.user.id,
            username: req.user.username,
            avatar: req.user.avatar,
            premium_type: req.user.premium_type || null,
            bio: db.get(`users.${req.user.id}`).bio,
            links: { 
            instagram: db.get(`users.${req.user.id}.links.instagram`),
            twitter: db.get(`users.${req.user.id}.links.twitter`),
            website:  db.get(`users.${req.user.id}.links.website`),
            github:   db.get(`users.${req.user.id}.links.github`),
            },
            premium: db.get(`users.${req.user.id}.premium`),
            discriminator: req.user.discriminator,
            ban: false,
            lastLogin: new Date().getFullYear() + "/" + (Number(new Date().getMonth()) + Number(1)) + "/" + new Date().getDate()
        };
        db.set(`users.${req.user.id}`, userData);
    }
    if (req.session.returnURL) {
        await res.redirect(req.session.returnURL);
        await req.session.destroy.returnURL;
    } else {
    if (req.session.backURL) {
        res.redirect(req.session.backURL)
    } else { res.redirect("/"); }
    }
    });
        
    app.get("/auth/logout", function(req, res) {
        req.session.destroy(() => {
            req.logout();
            res.redirect("/")
        });
    });

    
    // let server =  app.listen(80);

    const http = require('http').createServer(app);
    const io = require('socket.io')(http);
    app.get("/api/get-online", (req,res) => {
        res.json({status: true, count: io.engine.clientsCount})
    })
    http.listen(80);
    
      
  
    let indexRouter = require('./router/index');
    app.use("/", indexRouter);   
    
    let submitBotRouter = require('./router/submitBot');
    app.use("/", submitBotRouter);   

    let botRouter = require('./router/bot');
    app.use("/", botRouter);

    let voteRouter = require('./router/vote');
    app.use("/", voteRouter);

    let apiRouter = require('./router/api');
    app.use("/", apiRouter);

    let api_v1_Router = require('./router/api-v1');
    app.use("/", api_v1_Router);

    let searchRouter = require('./router/search');
    app.use("/", searchRouter);

    let botEditRouter = require('./router/bot-edit');
    app.use("/", botEditRouter);

    let userRouter = require('./router/user');
    app.use("/", userRouter);

    let statsRouter = require('./router/stats');
    app.use("/", statsRouter);

    let inviteRouter = require('./router/invite');
    app.use("/", inviteRouter);

    let adminRouter = require('./router/admin/index');
    app.use("/admin", adminRouter);

    let reportRouter = require('./router/report-bot');
    app.use("/", reportRouter);

    let botsRouter = require('./router/bots');
    app.use("/", botsRouter);

    let partnerRouter = require('./router/partner');
    app.use("/", partnerRouter);

    let teamRouter = require('./router/team');
    app.use("/", teamRouter);

    let previewRouter = require('./router/preview');
    app.use("/", previewRouter);

    let tagRouter = require('./router/tag');
    app.use("/", tagRouter);

    let verifierRouter = require('./router/verifier');
    app.use("/", verifierRouter);

    let docsRouter = require('./router/docs');
    app.use("/", docsRouter);

    let applicationsRouter = require('./router/applications');
    app.use("/", applicationsRouter);


    console.log("Bots Land is opening...");

    app.use((req, res) => {
        res.status(404).redirect("/")
    });