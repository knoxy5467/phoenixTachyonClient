import { Socket } from "phoenix";
import { TachyonAuthObject } from "./models/TachyonAuthObject";

/**
 * this is the Tachyon Client class, work in progress
 *
 * goal is to be able to communicate using the JSON based Tachyon protocol
 *
 * so far we have a constructor that takes an endpoint, user_email and user_password
 *
 */

export class TachyonClient {
    private  socket : Socket;
    /**
     *
     * @param endpoint takes the server url. e.g "https://server3.beyondallreason.info"
     * @param user_email takes the user email
     * @param user_password takes the user password
     */
    constructor(endpoint: string, user_email: string, user_password: string) {
        const tokenPromise : Promise<TachyonAuthObject> = this.getToken(endpoint,user_email, user_password);
        tokenPromise.then((authObj: TachyonAuthObject) => {
            if(authObj.result !== "success") {
                throw new Error(`Authentication failed with reason: ${authObj.reason}`);
            }
            else{
                this.socket = new Socket(`${endpoint}/tachyon/websocket/`, {
                    params: {
                        token: authObj.token_value,
                        client_hash: "1234567890",
                        client_name: "phoenixTachyonClient"
                }});
            }
        }).catch((error) => {
            if(error.message === "Authentication failed") {
                throw error;
            }
            else{
                throw new Error("Some other error occured");
            }
        });
        this.socket.connect();
    }
    /**
     *
     * @param endpoint takes the server url. e.g "https://server3.beyondallreason.info"
     * @param user_email takes the user email
     * @param user_password takes the user password
     * @returns
     */
    private getToken(endpoint:string,user_email: string, user_password): Promise<TachyonAuthObject>{
        return new Promise((resolve, reject) => {
            fetch(`${endpoint}/teiserver/api/request_token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_email: user_email,
                    user_password: user_password
                })
            })
            .then(response => response.json())
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
        });
    }
    public sendRequest(request: any) {
        this.socket.push()
    }
}
