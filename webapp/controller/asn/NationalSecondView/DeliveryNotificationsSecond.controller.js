// @ts-ignore
sap.ui.define([
    "./../../BaseController",
    "./../../APIController",
    "../../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast,Device) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.DeliveryNotificationsSecond", {

            formatter: formatter,

            onInit: function () {
                console.log('on init component view');


                this._oRouter = this.getRouter();
                this._oRouter.getRoute("NotificacionEntregaNacional").attachPatternMatched(this._routePatternMatched, this);

   
            },

            onAfterRendering: function () {
                console.log('on View After Render');
            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE MATCH")


            },


            onRefresh: function () {

            },


		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		

            

        });
    })