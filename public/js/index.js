class App {
    constructor() {

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
            
                const newDiv = document.createElement("pre");
                newDiv.innerHTML = JSON.parse(data);
    
                document.querySelector(".middle").appendChild(newDiv);
    
            }).catch(err => {
                console.warn(err);
            })
        });

    }
}

const app = new App();
app.start();