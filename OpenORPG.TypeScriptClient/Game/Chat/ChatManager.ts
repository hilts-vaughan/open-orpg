﻿module OpenORPG {
    // This manager is used for maintaing and hooking into chat related functionality in the game
    // If it has to do with talking in the game world, you'll find it here.
    export class ChatManager {

        private _chatChannels: Array<ChatChannel> = new Array<ChatChannel>();
        private _chatLogElement: string = "chatlog";
        private channelColorMap: Array<string> = new Array<string>();

        constructor() {
            // Hook into the DOM
            $("#chatmessage").on('keypress', (event: JQueryEventObject) => {
                if (event.which == 13) {

                    var packet = PacketFactory.createChatPacket(0, $("#chatmessage").val());
                    NetworkManager.getInstance().sendPacket(packet);
                    $("#chatmessage").val("");
                }
            });

            $.getJSON("assets/config/chat_color_map.json", data => {
                var i = 0;
                for (var key in data) {
                    var value = data[key];
                    this.channelColorMap[i] = value;
                    i++;
                }
            });

            this.setupNetworkHandlers();
        }

        setupNetworkHandlers() {
            var network = NetworkManager.getInstance();

            // Init
            LocaleManager.getInstance();

            // Handle channel registration
            network.registerPacket(OpCode.SMSG_JOIN_CHANNEL, (packet) => {
                var channel: ChatChannel = new ChatChannel(packet.channelId, packet.channelName, packet.channelType);
                this._chatChannels[channel.channelId] = channel;
            });

            network.registerPacket(OpCode.SMSG_LEAVE_CHAT_CHANNEL, (packet) => {
                delete this._chatChannels[packet.channelId];
            });

            network.registerPacket(OpCode.SMSG_CHAT_MESSAGE, (packet) => {
                var message = packet.message;
                var id = packet.channelId;
                var sender = packet.sender;

                this.processIncomingMessage(sender, message, id);
            });

            network.registerPacket(OpCode.SMSG_SEND_GAMEMESSAGE, (packet) => {
                var messageType = packet.messageType;
                var args = packet.arguments;

                var message: string = LocaleManager.getInstance().getString(messageType);
                this.addMessage(message, "", ChannelType.System);
            });

        }

        processIncomingMessage(sender: string, message: string, id: number) {
            var chatChannel = this._chatChannels[id];

            if (chatChannel != null) {
                this.addMessage(message, sender + ": ", id);
            }
        }

        addMessage(message: string, user: string = "", channel: number = ChannelType.System) {


            $.get("assets/hud/chat/chat_message_line.html", html => {
                var data =
                    {
                        playerName: user,
                        message: message
                    }

                var chatLineHtml = _.template(html, data);
                var chatElement = $(chatLineHtml);
                $(chatElement).css("color", this.channelColorMap[channel]);
                $("#chatlog").append(chatElement);

                // Scroll down
                $("#chatlog").animate({ scrollTop: $("#chatlog")[0].scrollHeight }, 1000);
            });



        }
    }
} 
