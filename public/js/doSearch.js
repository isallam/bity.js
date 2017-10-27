var DoSearch = {
    contextList: [],
    init: function ()
    {
        // TBD...
    },

    containerName: null,

    /**
     * execut()
     * @param container
     * @param doStatement
     */
    execute: function (containerName, doStatement)
    {

        this.containerName = containerName;

        // more sure to exit the demo mode.
        if (doStatement === null || doStatement === '')
        {
            writeToStatus("ERROR: Invalid query statement. " + doStatement);
            return;
        }

        var maxResults = 5; //getMaxResults();

        writeToStatus("Executing query: " + doStatement)
        writeToStatus("... using MaxResults: " + maxResults);

        //this.clearLocateLists()
        var msg = {"qType": "DOQuery",
            "qContext": this.containerName,
            "doStatement": doStatement,
            "maxResult": Number(maxResults),
            "verbose": 2};
        WebSocketHandler.sendMessage(msg, this)
        this.inQuery = true;

    },

    /***
     * allow us to do any post query stuff
     * @param context
     */
    executeCompleted: function (context) {

        //Start the ForceLink algorithm:
        //sigma.layouts.startForceLink();
        document.body.style.cursor = 'auto';

        this.inQuery = false;

    },
    /***
     * Process the results form the server.
     *
     * @param qResult
     */
    processResult: function (qResult)
    {
        //console.log(".... I'll handle your data:", qResult);
        //console.log(".... processsing for context:", qResult.context);
        if (qResult.context === 'person-datalist') {
            var dataList = document.getElementById(qResult.context);
            if (qResult.node != null) {
                var foundItem = false;
                var node = qResult.node;
                for (i = 0; i < dataList.options.length && !foundItem; i++)
                {
                    var option = dataList.options[i];
                    if (option.oid != null && node.id == option.oid)
                        foundItem = true;
                };
                if (!foundItem) {
                    var option = document.createElement("option");
                    option.value = node.data.firstName + " " + node.data.lastName;
                    option.oid = node.id;
                    dataList.appendChild(option);
                }
            }
        }
        else if (qResult.context === 'domain-datalist') {
            var dataList = document.getElementById(qResult.context);
            if (qResult.node != null) {
                var foundItem = false;
                var node = qResult.node;
                for (i = 0; i < dataList.options.length && !foundItem; i++)
                {
                    var option = dataList.options[i];
                    if (option.oid != null && node.id == option.oid)
                        foundItem = true;
                };
                if (!foundItem) {
                    var option = document.createElement("option");
                    option.value = node.data.domain;
                    option.oid = node.id;
                    dataList.appendChild(option);
                }
            }
        }

    }

}