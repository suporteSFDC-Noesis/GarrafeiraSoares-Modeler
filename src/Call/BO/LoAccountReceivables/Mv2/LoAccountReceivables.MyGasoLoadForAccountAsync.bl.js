"use strict";

///////////////////////////////////////////////////////////////////////////////////////////////
//                 IMPORTANT - DO NOT MODIFY AUTO-GENERATED CODE OR COMMENTS                 //
//Parts of this file are auto-generated and modifications to those sections will be          //
//overwritten. You are allowed to modify:                                                    //
// - the tags in the jsDoc as described in the corresponding section                         //
// - the function name and its parameters                                                    //
// - the function body between the insertion ranges                                          //
//         "Add your customizing javaScript code below / above"                              //
//                                                                                           //
// NOTE:                                                                                     //
// - If you have created PRE and POST functions, they will be executed in the same order     //
//   as before.                                                                              //
// - If you have created a REPLACE to override core function, only the REPLACE function will //
//   be executed. PRE and POST functions will be executed in the same order as before.       //
//                                                                                           //
// - For new customizations, you can directly modify this file. There is no need to use the  //
//   PRE, POST, and REPLACE functions.                                                       //
//                                                                                           //
///////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Use the following jsDoc tags to describe the BL function. Setting these tags will
 * change the runtime behavior in the mobile app. The values specified in the tags determine
 * the name of the contract file. The filename format is “@this . @function .bl.js”.
 * For example, LoVisit.BeforeLoadAsync.bl.js
 * -> function: Name of the businessLogic function.
 * -> this: The LO, BO, or LU object that this function belongs to (and it is part of the filename).
 * -> kind: Type of object this function belongs to. Most common value is "businessobject".
 * -> async: If declared as async then the function should return a promise.
 * -> param: List of parameters the function accepts. Make sure the parameters match the function signature.
 * -> module: Use CORE or CUSTOM. If you are a Salesforce client or an implementation partner, always use CUSTOM to enable a seamless release upgrade.
 * -> maxRuntime: Maximum time this function is allowed to run, takes integer value in ms. If the max time is exceeded, error is logged.
 * -> returns: Type and variable name in which the return value is stored.
 * @function myGasoLoadForAccountAsync
 * @this LoAccountReceivables
 * @kind listobject
 * @async
 * @namespace CUSTOM
 * @param {String} customerPKey
 * @param {String} parentPKey
 * @param {LoAccountReceivables} parentList
 * @returns promise
 */
function myGasoLoadForAccountAsync(customerPKey, parentPKey, parentList){
    var me = this;
    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code below.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    var promise;
    // Branches also show the receivables of their client account (GASO_ParentClient__c) in parentList.
    var hasParent = Utils.isDefined(parentPKey) && !Utils.isEmptyString(parentPKey) &&
        parentPKey !== " " && parentPKey !== customerPKey;
    if (Utils.isDefined(parentList)) {
        parentList.removeAllItems();
        // Read by myGasoSummaryText to tell "no client account" apart from "nothing open".
        parentList.noParent = !hasParent;
    }
    if (!Utils.isDefined(customerPKey) || Utils.isEmptyString(customerPKey)) {
        me.removeAllItems();
        promise = when.resolve("");
    } else {
        promise = DeviceManager.isOnlineAsync()
        .then(function (isOnline) {
            if (!Utils.isTrue(isOnline)) {
                me.dataSource = "offline";
                return;
            }
            var request = new BatchNftRequest();
            request.addRequest("NFT_Account_Receivable", hasParent ? [customerPKey, parentPKey] : [customerPKey]);
            // Wait for the records to reach SQLite before querying the datasource.
            return Facade.requestBatchNftDataAndWait(request)
            .then(function () {
                me.dataSource = "online";
            })
            // Download failed: show the records from the last sync and flag it,
            // so the UI never presents an empty list as "no open documents".
            .catch(function () {
                me.dataSource = "fallback";
            });
        })
        .then(function () {
            if (hasParent && Utils.isDefined(parentList)) {
                return parentList.calculateAccountReceivablesForCard(parentPKey);
            }
        })
        .then(function () {
            return me.calculateAccountReceivablesForCard(customerPKey);
        })
        // Latest due date first (the datasource is shared with the visit card, so sort here).
        .then(function () {
            var byDueDateDesc = function (a, b) {
                var dueA = a.getDueDate() || "";
                var dueB = b.getDueDate() || "";
                if (dueA !== dueB) {
                    return dueA < dueB ? 1 : -1;
                }
                var receiptA = a.getReceiptDate() || "";
                var receiptB = b.getReceiptDate() || "";
                return receiptA === receiptB ? 0 : (receiptA < receiptB ? 1 : -1);
            };
            [me, parentList].forEach(function (list) {
                if (Utils.isDefined(list)) {
                    var sorted = list.getAllItems().slice().sort(byDueDateDesc);
                    list.removeAllItems();
                    list.addItems(sorted);
                }
            });
        })
        // Build the status line shown above the lists (returned to the process context).
        .then(function () {
            var items = me.getAllItems().concat(Utils.isDefined(parentList) ? parentList.getAllItems() : []);
            if (items.length === 0) {
                // Only "online" may state there is nothing to pay; the others are not up to date.
                return Localization.resolve({
                    online: "AccountReceivables_EmptyOnline",
                    offline: "AccountReceivables_EmptyOffline",
                    fallback: "AccountReceivables_EmptyFallback"
                }[me.dataSource]);
            }
            // Due-date alerts: red when overdue, yellow when due within the next 7 days.
            var today = Utils.createAnsiDateToday();
            var inSevenDays = Utils.addDays2AnsiDate(today, 7);
            items.forEach(function (item) {
                var dueDate = item.getDueDate();
                if (!Utils.isDefined(dueDate) || Utils.isEmptyString(dueDate) || dueDate === Utils.getMinDate()) {
                    item.setAccountReceivableIcon(" ");
                } else if (dueDate < today) {
                    item.setAccountReceivableIcon("WarningTriangle_IC");
                } else if (dueDate <= inSevenDays) {
                    item.setAccountReceivableIcon("WarningCircle_IC");
                } else {
                    item.setAccountReceivableIcon(" ");
                }
            });

            var lastSync = null;
            items.forEach(function (item) {
                var modified = item.getBusinessModified();
                if (Utils.isDefined(modified) && (lastSync === null || modified > lastSync)) {
                    lastSync = modified;
                }
            });
            var date = "";
            if (lastSync !== null) {
                // The status line must never break the tab: show the raw value if it cannot be formatted.
                try {
                    date = " " + Localization.localize(Utils.convertAnsiDateTime2AnsiDate(lastSync), "date") +
                        " " + Localization.localize(lastSync, "time");
                } catch (e) {
                    date = " " + lastSync;
                }
            }
            return Localization.resolve({
                online: "AccountReceivables_SyncOnline",
                offline: "AccountReceivables_SyncOffline",
                fallback: "AccountReceivables_SyncFallback"
            }[me.dataSource]) + date;
        })
        // Kept so a refresh tapped while another one runs can return the current status line.
        .then(function (syncInfo) {
            me.lastSyncInfo = syncInfo;
            return syncInfo;
        });
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    //                                                                                           //
    //               Add your customizing javaScript code above.                                 //
    //                                                                                           //
    ///////////////////////////////////////////////////////////////////////////////////////////////

    return promise;
}