import { Socket } from "phoenix";
import { TachyonAuthObject } from "./models/TachyonAuthObject";
import { Response } from "node-fetch";
import fetch from "node-fetch";


/**
 * this is the Tachyon Client class, work in progress
 *
 * goal is to be able to communicate using the JSON based Tachyon protocol
 *
 * so far we have a constructor that takes an endpoint, user_email and user_password
 *
 */

export class TachyonClient {
    private  socket : Socket | undefined;
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
            console.error(error);
            if(error.message === "Authentication failed") {
                throw error;
            }
            else{
                throw new Error("Some other error occured");
            }
        });
    }
    /**
     *
     * @param endpoint takes the server url. e.g "https://server3.beyondallreason.info"
     * @param user_email takes the user email
     * @param user_password takes the user password
     * @returns
     */
    private getToken(endpoint:string,user_email: string, user_password:string): Promise<TachyonAuthObject>{
        return new Promise<TachyonAuthObject>((resolve, reject) => {
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
            .then(response  => (response.json() as Promise<TachyonAuthObject>))
            .then(response => {
                if(response.result === "success") {
                    resolve(response);
                }
                else{
                    reject(new Error("Authentication failed"));
                }
            })
        });
    }
    public connect(){
        if(this.socket === undefined){
            throw new Error("Socket is undefined");
        }
        this.socket.connect();
    }
    public disconnect(){
        if(this.socket === undefined){
            throw new Error("Socket is undefined");
        }
        this.socket.disconnect();
    }
    public isConnected() : boolean{
        if(this.socket === undefined){
            throw new Error("Socket is undefined");
        }
        return this.socket.isConnected();
    }
}
