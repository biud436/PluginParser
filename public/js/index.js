class App {
    constructor() {
        this.initWithSocketIO();
    }

    initWithSocketIO() {
        this._socket = io();

        if(!this._socket) {
            this.write("소켓 생성에 실패하였습니다.");
        }

        this._socket.on("connect", () => {
            this.write("서버에 연결되었습니다.");
            this._socket.emit("hello", "client hello");
        });

        this._socket.on("disconnect", () => {
            this._socket.emit("remove", this._socket.id);
            this.write("서버와의 연결이 끊겼습니다.");
        });

        // 서버에 메시지를 보냅니다.
        this._socket.on("message", (message) => {
            this.write(message);
        });
    }

    write(message) {
        const newDiv = document.createElement("pre");
        newDiv.innerHTML = message;
        document.querySelector(".middle").appendChild(newDiv);        
    }

    load(url) {
        return new Promise((resolve, reject) => {
            /**
             * @type {HTMLInputElement}
             */
            const input = document.querySelector("#name");

            const xhr = new XMLHttpRequest();
            xhr.open("POST", url);

            xhr.setRequestHeader('Content-Type', "application/json");
            xhr.onload = () => {
                if(xhr.status === 200) {
                    resolve(xhr.responseText);
                } else {
                    reject(xhr.responseText);
                }
            }
            xhr.onerror = (err) => {
                reject(err);
            }
            xhr.send(JSON.stringify({
                name: input.value
            }));
        });
    }

    start() {

        document.querySelector("#submit").addEventListener("click", async () => {
            await this.load("http://127.0.0.1:9010/parse/plugin").then(data => {
                this.write(JSON.parse(data));
            }).catch(err => {
                console.warn(err);
            })
        });

    }
}

const app = new App();
app.start();