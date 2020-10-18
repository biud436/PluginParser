const express = require("express")
const http = require("http");
const static = require("serve-static");
const bodyParser = require("body-parser");
const path = require('path');
const cors = require("cors");
const fs = require('fs');

const app = express();

app.set("port", process.env.PORT || 9010);

app.use(static(path.resolve("public")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

const router = express.Router();

const myData = fs.readFileSync(path.resolve("data", "RS_Window_KorNameEdit.json"), 'utf8');

router.route("/parse/plugin").post((req, res) => {

    const query = req.body;

    if(query.name) {
        res.send(JSON.stringify(myData, null, "\t"));
    } else {
        res.redirect("/");
    }
});

app.use("/", router);

http.createServer(app).listen(app.get("port"), () => {
    console.log(`server start : %d`, app.get("port"));
});

