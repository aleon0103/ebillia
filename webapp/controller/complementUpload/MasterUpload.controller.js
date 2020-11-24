// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, JSONModel, MessageToast, Device) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.MasterUpload", {

            onInit: function () {
                console.log('on init MasterUpload');

                var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "invoiceUpload");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "purchaseOrderModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("CargarComplementos").attachPatternMatched(this._routePatternMatched, this);


            },

            _routePatternMatched: function (oEvent) {
                var dateObjToday = new Date();

                /* Fecha 15 dias antes */
                var dieciseisDias = 1000 * 60 * 60 * 24 * 15;
                var resta = dateObjToday.getTime() - dieciseisDias;
                var fechaAtras = new Date(resta);

                // @ts-ignore
                var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyy-MM-dd"
                });

                var dateFormattedToday = dateFormat.format(dateObjToday, false);
                var dateFormattedFinish = dateFormat.format(fechaAtras, false);

                console.log(dateFormattedToday);
                console.log(dateFormattedFinish);
                // dateFormattedFinish = "2020-01-01";
                this._getFacturasPendientes(dateFormattedFinish, dateFormattedToday);
            },

            _getFacturasPendientes: function (fechaAtras, fechaHoy) {
                var oModelUser = this.getModel("user").getData();
                var userId = oModelUser.id;
                
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);

                var path = API.serviceList().FACTURAS_PENDIENTES + `facturas-pendientes?proveedor=${userId}&fechai=${fechaAtras}&fechaf=${fechaHoy}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);

                        console.log(respJson);

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

                        console.log("error in processing your request", err);
                    });
            },

            onSearch: function (oEvent) {

                if (oEvent.getParameters().refreshButtonPressed) {
                    this.onRefresh();
                    return;
                }

                var sQuery = oEvent.getParameter("query");

                if (sQuery) {
                    this._searchOrderById(sQuery);
                } else {
                    this._getPurchaseOrders();
                }
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

            _showDetail: function (oItem) {
                var bReplace = !Device.system.phone;
                this.getRouter().navTo("CargarComplementos", {}, bReplace);
            },


            _searchOrderById: function (orderId) {
                console.log('searchOrder.. ', orderId);

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get purchase order by id');
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);
                var me = this;
                //https://arcade.flexi.com.mx:8762/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenDeCompraConfirmada/4500376391
                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenDeCompraConfirmada/${orderId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {
                            poModel.setProperty('/busy', false);
                            var result = [];
                            result[0] = respJson.data;
                            poModel.setProperty('/PurchaseOrders', result)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                                poModel.setProperty('/PurchaseOrders', [])
                            }

                            console.log(poModel)
                            poModel.refresh();
                        } else {
                            MessageToast.show(respJson.message);
                            poModel.setProperty('/Count', 0)
                            poModel.setProperty('/PurchaseOrders', [])

                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(err.error.message);
                        poModel.setProperty('/Count', 0)
                        poModel.setProperty('/PurchaseOrders', [])

                        console.log("error in processing your request", err);
                    });
            }
        });
    })