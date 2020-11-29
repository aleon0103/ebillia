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

        return BaseController.extend("ns.EBilliaApp.controller.DetailPO", {

            onInit: function () {
                console.log('on Detail PO component view');
                var motivosRechazo = [
                    {
                        nombreMotivo: ""
                    },
                    {
                        nombreMotivo: "Solicitud de modificación de cantidad de reparto"
                    },
                    {
                        nombreMotivo: "Solicitud de modificación de fecha de entrega"
                    },
                    {
                        nombreMotivo: "Material no trabajado por el proveedor"
                    },
                    {
                        nombreMotivo: "Otros"
                    }
                ]

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    orderId: '',
                    motivosRechazo:motivosRechazo
                });
                this.getView().setModel(oModel, "POdetailView");

                

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("POConfirmDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE DETAIL MATCH")
                var oArguments = oEvent.getParameter("arguments");
                this._sObjectId = oArguments.orderId;
                console.log(this._sObjectId);
                var oViewModel = this.getModel("poMain")
                var oInvoiceModel = this.getModel("invoiceUpload");

                if (oInvoiceModel && oInvoiceModel.getProperty("/orderSelected")) {
                    console.log("ORDER SELECTED");
                } else {
                    console.log("ORDER NO SELECTED ");

                    // this.getRouter().getTargets().display("detailObjectNotFound");
                }

                console.log(this.getModel("invoiceUpload"));

                oViewModel.setProperty("/orderId", this._sObjectId);
                // gets called for ...#/
                // gets called for ...#/products/
                // gets called for ...#/products/Product/<productId>
                // for example: ...#/products/Product/1 . 
                // or #/products/Product/123
                if (this._sObjectId) {
                    this._getOcPocisiones();

                }

            },




            _getOcPocisiones: function () {

                console.log('on get Goods Receips')



                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var selProveedor = userId; // modificar para tomar el id del proveedor seleccioando 

                var proveedorId = rol === 3 ? userId : selProveedor;



                var poModel = this.getModel("POdetailView");
                poModel.setProperty('/busy', true);
                var me = this;
                //https://arcade.flexi.com.mx:8762/portal_cloud_api/logistic-services/Proveedores-facturas/posicionesOC/20000001/4500376582/E/X
                var path = API.serviceList().PROVEEDORES_FACTURAS + `posicionesOC/${userId}/${this._sObjectId}/E/X`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/POPositions', respJson.data.matrixValues)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.matrixValues.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            console.log(poModel)

                        } else {

                            poModel.setProperty('/POPositions', [])
                            poModel.setProperty('/Count', 0)
                        }
                        poModel.refresh();
                        //  me._configureTable();
                        // me.byId("lineItemsList").removeSelections(true); 
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },
            enterFullScreen: function () {
                var oViewModel = this.getModel("poMain")
                oViewModel.setProperty('/layout', 'MidColumnFullScreen')

            },

            exitFullScreen: function () {
                var oViewModel = this.getModel("poMain")
                oViewModel.setProperty('/layout', 'TwoColumnsMidExpanded')


            }




        });
    })