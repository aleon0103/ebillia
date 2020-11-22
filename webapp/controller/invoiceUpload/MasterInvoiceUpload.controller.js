// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel"
],
    function (BaseController, API, formatter, JSONModel) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.MasterInvoiceUpload", {

            formatter: formatter,

            onInit: function () {
                console.log('on init  Invoice Upload component view');

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "purchaseOrderModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cargaFactura").attachPatternMatched(this._routePatternMatched, this);


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

           	onSearch : function (oEvent) {
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
        
        onRefresh:function () {
            this._getPurchaseOrders();
        },

            onSelectionChange: function () {

            },

            /**Method to get POrchaseOrder List */

            _getPurchaseOrders: function () {

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get purchase orders');
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);
                var me = this;
                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenesDeCompra/CARGAFACTURA/${userId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        if (respJson && respJson.data) {
                            poModel.setProperty('/busy', false);

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


            _searchOrderById: function(orderId) {
                console.log('searchOrder.. ',orderId);

            }


        });
    })