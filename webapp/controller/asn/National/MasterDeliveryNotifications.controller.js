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
        return BaseController.extend("ns.EBilliaApp.controller.MasterDeliveryNotifications", {

            formatter: formatter,

            onInit: function () {
                console.log('on init component view');

                var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "invoiceUpload");

                var oModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(oModel, "purchaseOrderModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("NotificacionEntregaNacional").attachPatternMatched(this._routePatternMatched, this);

   
            },

            onAfterRendering: function () {
                console.log('on Uoload Inv View After Render');
            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE MATCH")

                // gets called for ...#/
                // gets called for ...#/products/
                // gets called for ...#/products/Product/<productId>
                // for example: ...#/products/Product/1 . 
                // or #/products/Product/123

                //  this._initNotifications();
                this._getPurchaseOrders();

            },

            onSearch: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    // Search field's 'refresh' button has been pressed.
                    // This is visible if you select any master list item.
                    // In this case no new search is triggered, we only
                    // refresh the list binding.
                    this.onRefresh();
                    return;
                }

                var sQuery = oEvent.getParameter("query");

                if (sQuery) {
                    //	this._oListFilterState.aSearch = [new Filter("CustomerName", FilterOperator.Contains, sQuery)];
                    this._searchOrderById(sQuery);
                } else {
                    //	this._oListFilterState.aSearch = [];
                    this._getPurchaseOrders();
                }
                //	this._applyFilterSearch();

            },

            onRefresh: function () {
                this._getPurchaseOrders();
            },

            onSelectionChange: function (oEvent) {

                	var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");

			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}
            },



		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function (oItem) {
			var bReplace = !Device.system.phone;
			
			this.getRouter().navTo("NotificacionEntregaNacionalDetail", {
				orderId : oItem.getBindingContext("purchaseOrderModel").getProperty("idOrdenCompra")
			}, bReplace);
		},

            /**Method to get POrchaseOrder List */

            _getPurchaseOrders: function () {
                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);

                var me = this;
                var path = API.serviceList().GET_ORDENES_COMPRA_ASN + `${userId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/PurchaseOrders', respJson.data)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            console.log(poModel)
                            poModel.refresh();

                        
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },


            

        });
    })