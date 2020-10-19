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

    copyText() {
        const copyButton = document.querySelector("#copy-text");
        if(copyButton instanceof HTMLButtonElement) {
            copyButton.addEventListener("click", () => {

                const options = document.querySelector("select").options;
                const texts = (options.selectedIndex === 1) ? document.querySelector("#output-data").textContent : document.querySelector(".middle").textContent;
                navigator.clipboard.writeText(texts).then(() => {
                    alert("클립보드에 복사가 완료되었습니다.");
                })                                    
            });
        }
    }

    write(message) {
        const newDiv = document.createElement("pre");
        newDiv.innerHTML = message;

        const lines = message.split(/[\r\n]+/);        
        if(lines.length === 1) {
            newDiv.id = "output-data";
        }

        document.querySelector(".middle").appendChild(newDiv);        
    }

    clear() {
        document.querySelector(".middle").innerHTML = "";
    }

    load(url) {
        return new Promise((resolve, reject) => {
            /**
             * @type {HTMLInputElement}
             */
            const formData = new FormData();
            formData.append("name", document.querySelector("input[type='file']").files[0]);

            const xhr = new XMLHttpRequest();
            xhr.open("POST", url);

            // xhr.setRequestHeader('Content-Type', "application/json");
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
            xhr.send(formData);

        });
    }

    start() {

        document.querySelector("#submit").addEventListener("click", async () => {
            this.clear();
            
            await this.load("http://127.0.0.1:9010/parse/plugin").then(data => {
                this.write(JSON.parse(data));
            }).catch(err => {
                console.warn(err);
            })
        });

        window.addEventListener("load", () => {
            this.copyText();
        });

    }
}

const app = new App();
app.start();