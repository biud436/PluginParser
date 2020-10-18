const express = require("express")
const http = require("http");
const static = require("serve-static");
const bodyParser = require("body-parser");
const path = require('path');
const cors = require("cors");
const fs = require('fs');
const socketio = require("socket.io");
const stringify = require('json-stringify');
const {PluginParser} = require("./parser");

// 익스프레스 객체 생성
const app = express();

// 포트 설정
app.set("port", process.env.PORT || 9010);

// 미들웨어 등록
app.use(static(path.resolve("public")));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

const router = express.Router();

// AJAX 라우팅 설정
router.route("/parse/plugin").post((req, res) => {

    const query = req.body;

    if(query.name) {
        const argv = {
            "f": path.resolve(path.basename(query.name)),
        };

        const parser = new PluginParser(argv);
        parser.start(() => {
            const myData = fs.readFileSync(path.resolve("data", "RS_Window_KorNameEdit.json"), 'utf8');        
            req.app.io.sockets.emit("message", myData);
        });

    } else {
        res.redirect("/");
    }
});

// 라우터를 미들웨어로 등록
app.use("/", router);

// 서버 생성
const server = http.createServer(app).listen(app.get("port"), () => {
    console.log(`server start : %d`, app.get("port"));
});

// 간이 데이터베이스 객체 생성
const database = {
    init() {
        this._userTable = {};
    },

    new(address, id) {
        this._userTable[address] = id;
    },

    remove(address) {
        delete this._userTable[address];
    }
};

database.init();

// 웹소켓 통신 시작
const io = socketio.listen(server);
app.io = io;

io.sockets.on("connection", socket => {
    const id = socket.id;
    const {_peername} = socket.request.connection;
    const {address, port} = _peername;

    Object.assign(socket, {
        remoteAddress: address, 
        remotePort: port 
    });

    database.new(address, id);

    // 헬로 메시지 에코
    socket.on("hello", (message) => {
        socket.emit("message", `[${new Date().toUTCString()}] ${message}`);
    });

    // 접속이 끊겼을 때 데이터베이스에서 해당 멤버를 제거한다.
    socket.on("remove", (id) => {
        database.remove(address);
        socket.emit("message", `${address}와의 연결이 끊겼습니다.`);
    });

})