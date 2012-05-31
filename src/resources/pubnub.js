function publish(channel, message, callback) {
    PUBNUB.publish({
        channel  : channel,
        message  : message,
        callback : function(info) {
            // info[0] == 1 for success
            // info[0] == 0 for failure

            // info[1] == "D" for "Demo Success" or
            // info[1] == "S" for "Success with Valid Key" or
            // info[1] == "Error..." with reason of failure.

            // if the respons is an error, do not re-publish.
            // the failed publish will not re-send.

            //console.log(info);
            if (callback) callback(info);
        }
    });
}

function subscribe(channel, callback, connect, disconnect, reconnect) {
    PUBNUB.subscribe({
        channel    : channel,               // CONNECT TO THIS CHANNEL
        restore    : false,                 // STAY CONNECTED, EVEN WHEN BROWSER IS CLOSED OR WHEN PAGE CHANGES
        callback   : function(message) {    // RECEIVED A MESSAGE
            //console.log(message);
            if (callback) callback(message);
        },
        connect    : function() {           // CONNECTION ESTABLISHED
            if (connect) connect();
        },
        disconnect : function() {           // LOST CONNECTION
            alert("Connection Lost. Will auto-reconnect when Online.");
            if (disconnect) disconnect();
        },
        reconnect  : function() {           // CONNECTION RESTORED
            alert("And we're Back!");
            if (reconnect) reconnect();
        }
    });
}

function unsubscribe(channel) {
    PUBNUB.unsubscribe({
        channel: channel
    });
}