
var WebSocketHandler = {
    resultHandler: null,
    sendMessage: function (msg, resultHandler)
    {
        if (window.wsReady === true)
        {
            // send request to socket...
            window.ws.send(JSON.stringify(msg));
        } else {
            this.ensureSocketOpen();
            setTimeout(function () {
                //console.log("... waiting for connection.")
                writeToStatus("... waiting for connection.");
                if (window.ws != null && window.ws.readyState == WebSocket.OPEN)
                    //console.log("wsReady is: " + wsReady)
                    writeToStatus("... socket connnection is ready.");
                // send request to socket...
                window.ws.send(JSON.stringify(msg));
//					this.resultHandler = handler
            }, 1000);
        }
        if (resultHandler)
        {
            this.resultHandler = resultHandler;
            window.ws.resultHandler = resultHandler;
        }
    },
    setupSocket: function ()
    {
        var host = location.origin.replace(/^http/, 'ws');
        //console.log("HOST: " + host);
        var webSocket = new WebSocket(host + "/query");
        webSocket.onopen = function () {
            window.wsReady = true;
            // Web Socket is connected, send data using send()
            //console.log("webSocket is open...");
        };
        webSocket.onerror = function () {
            //console.log("webSocket error..." + error);
            writeToStatus("WebSocket error: " + error);
            // just in there were some problems with conenction...
            content.html($('<p>', {text: 'Sorry, but there\'s some problem with your '
                        + 'connection or the server is down.'}));
        };
        webSocket.onclose = function () {
            // websocket is closed.
            //content.html($('<p>', { text: 'Connection closed by the server...' } ));
            //console.log("Connection is closed...");
            writeToStatus("Connection is closed...");
            window.ws = null;
            window.wsReady = false;
        };
        webSocket.onmessage = this.OnMessage;

        window.ws = webSocket;
    },
    OnMessage: function (message)
    {
        //console.log("Message is received...");
        var received_msg = message.data;
        try {
            var json = JSON.parse(received_msg);
        } catch (e) {
            //console.log('This doesn\'t look like a valid JSON: ', received_msg);
            writeToStatus('Error in received JSON (invalid): ' + received_msg);
            return;
        }
        if (json.type === "EndOfResults") {
            //console.log("DONE:   received_msg = <" + received_msg + ">");
            writeToStatus('Query Completed... ');
            if (this.resultHandler !== null)
                this.resultHandler.executeCompleted(json.context);
        } else {
            // console.log('json.type: ' + json.type);
            if (json.type === 'message') { // it's a single message
                // console.log("GOT: ", json.data);
                var qResult = JSON.parse(json.data);
                //console.log("GotData: ", qResult);
                if (this.resultHandler !== null)
                    this.resultHandler.processResult(qResult);

            } else {
                console.log('Hmm..., I\'ve never seen JSON like this: ', json);
            }
        }
        //msg_section.append($('<li>').text(received_msg));
    },
    ensureSocketOpen: function () {
        if (window.ws == null ||
                window.ws.readyState === WebSocket.CLOSING ||
                window.ws.readyState === WebSocket.CLOSED)
        {
            this.setupSocket();
        }
        setTimeout(function () {
            //console.log("... waiting for connection.")
            writeToStatus("... waiting for connection.")
            if (window.ws != null && window.ws.readyState !== WebSocket.OPEN)
                this.ensureSocketOpen()
        }, 1000);
    }

};
