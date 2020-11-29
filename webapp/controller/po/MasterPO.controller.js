// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.MasterPO", {
            formatter: formatter,
            onInit: function () {
                console.log('on Master PO component view')

                var poModel = new JSONModel({ busy: true, tempItems: [], selectedCount: '0', layout: 'OneColumn' });
                this.getOwnerComponent().setModel(poModel, "poMain");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "purchaseOrderModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("POConfirm").attachPatternMatched(this._routePatternMatched, this);

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


            onRefresh: function () {
                this._getPurchaseOrders();
            },

            _getPurchaseOrders: function () {

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get purchase orders');
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);
                var me = this;
                //https://arcade.flexi.com.mx:8762/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenesDeCompra/20000001/1/100/%20/E/%20/%20
                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenesDeCompra/${userId}/1/100/%20/E/%20/%20`;
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
            _showDetail: function (oItem) {
                var poModel = this.getModel('poMain');
                console.log(oItem.getBindingContext("purchaseOrderModel").getObject());

                poModel.setProperty('/orderSelected', oItem.getBindingContext("purchaseOrderModel").getObject())

                var bReplace = !Device.system.phone;
                // set the layout property of FCL control to show two columns
                poModel.setProperty("/layout", "TwoColumnsMidExpanded");
                this.getRouter().navTo("POConfirmDetail", {
                    layout: "TwoColumnsMidExpanded",
                    orderId: oItem.getBindingContext("purchaseOrderModel").getProperty("idOrdenCompra")
                }, bReplace);
            },



        });
    })