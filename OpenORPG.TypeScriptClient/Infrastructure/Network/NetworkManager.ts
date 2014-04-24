﻿module OpenORPG {
    export class NetworkManager {

        private static _instance: NetworkManager = null;

        private _host: string;
        private _port: number = 0;
        private _socket: WebSocket = null;

        // Connection callbacks for usage
        public onConnectionCallback: () => void;
        public onRecieveMessageCallback: () => void;
        public onConnectionErrorCallback: () => void;

        // Our internal packet callbacks
        private _packetCallbacks: any = [];

        constructor(host: string, port: number) {
            if (NetworkManager._instance) {
                throw new Error("Error: Instantiation failed: Use SingletonDemo.getInstance() instead of new.");
            }
            NetworkManager._instance = this;

            this._host = host;
            this._port = port;
        }

        public static getInstance(): NetworkManager {
            if (NetworkManager._instance === null) {
                NetworkManager._instance = new NetworkManager("localhost", 1234);
            }
            return NetworkManager._instance;
        }

        public sendPacket(packet: any) {
            var json = JSON.stringify(packet);
            this._socket.send(json);
        }

        public registerPacket(opCode: OpCode, callback: (packet: any) => void) {
            this._packetCallbacks[opCode] = callback;
        }

        public connect() {
            // Create our socket
            var url = "ws://" + this._host + ":" + this._port + "/";
            this._socket = new WebSocket(url);

            this._socket.onopen = (event: Event) => {
                this.onConnectionCallback();
            };

            this._socket.onerror = (event: Event) => {
                this.onConnectionErrorCallback();
            };

            this._socket.onmessage = (event: any) => {
                this.parseMessage(event);
            };

        }

        // Parses an incoming message accordingly
        private parseMessage(response: MessageEvent) {
            var packet: any = JSON.parse(response.data);
            if (this._packetCallbacks[packet.opCode] != undefined)
                this._packetCallbacks[packet.opCode](packet);
            else
                console.log("Packet with opCode " + packet.OpCode + " was recieved but not handled.");
        }


    }
}