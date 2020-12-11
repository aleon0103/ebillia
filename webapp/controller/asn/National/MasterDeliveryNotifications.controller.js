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

                var oModel = new JSONModel({ 
                    busy: true,
                    Count: 0
                });
                this.getOwnerComponent().setModel(oModel, "purchaseOrderModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("NotificacionEntregaNacional").attachPatternMatched(this._routePatternMatched, this);

   
            },

            onAfterRendering: function () {
                console.log('on Uoload Inv View After Render');
            },

            _routePatternMatched: function (oEvent) {
                var oArguments = oEvent.getParameter("arguments");
                var param = JSON.parse(oArguments.param);

                if (param) {
                    this.onRefresh();
                }
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
                var mDetail = this.getModel("detailDeliveryN");
                var oDateDetail = sap.ui.getCore().byId("__xmlview3--deliveryDateDN");
                var oSwitchDetail = sap.ui.getCore().byId("__xmlview3--switchCompletar");
                // @ts-ignore
                oDateDetail.setValue("");
                // @ts-ignore
                oSwitchDetail.setState(false);
                
                mDetail.setProperty("/orderId", "");
                mDetail.setProperty("/GoodReceipts", []);
                mDetail.setProperty("/count", 0);
                mDetail.setProperty("/fecha_entrega", null);

                this._getPurchaseOrders();

                var oList = this.byId("list");
                oList.removeSelections(true);
                var oBinding = oList.getBinding("items");
                oBinding.refresh(true);
                this.getRouter().navTo("NotificacionEntregaNacional", {
                    param : false
                }, true);
            },

            onSelectionChange: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oContext = oSelectedItem.getBindingContext("purchaseOrderModel");
                var objectSolicitud = oContext.oModel.getProperty(oContext.sPath);
                var idOrdenCompra = objectSolicitud.idOrdenCompra;

                console.log(idOrdenCompra);

                this.getRouter().navTo("NotificacionEntregaNacionalDetail", {
                    orderId : idOrdenCompra
                }, true);
            },

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