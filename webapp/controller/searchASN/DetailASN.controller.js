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

        return BaseController.extend("ns.EBilliaApp.controller.DetailASN", {

            onInit: function () {
                console.log('on Detail InvoiceUpload component view')

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    orderId: ''
                });
                this.getView().setModel(oModel, "POdetailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cargaFacturaDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE DETAIL MATCH")
                var oArguments = oEvent.getParameter("arguments");
                this._sObjectId = oArguments.orderId;
                console.log(this._sObjectId);
                var oViewModel = this.getModel("POdetailView")

                console.log(this.getModel("invoiceUpload"));

                oViewModel.setProperty("/orderId", this._sObjectId);


                // gets called for ...#/
                // gets called for ...#/products/
                // gets called for ...#/products/Product/<productId>
                // for example: ...#/products/Product/1 . 
                // or #/products/Product/123


                if (this._sObjectId) {
                    this._getGoodsReceipts();

                }

            },


            _getGoodsReceipts: function () {

                console.log('on get Goods Receips')

                

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId =  oModel.getProperty('/id');
                var selProveedor = userId; // modificar para tomar el id del proveedor seleccioando 

                var proveedorId = rol === 3 ? userId : selProveedor;



                var poModel = this.getModel("POdetailView");
                poModel.setProperty('/busy', true);
                var me = this;
                //https://arcade.flexi.com.mx:8762/portal_cloud_api/logistic-services/Proveedores-facturas/EntradasDeMercancia/20000001/4500376391/E/%20
                var path = API.serviceList().PROVEEDORES_FACTURAS + `EntradasDeMercancia/${userId}/${this._sObjectId}/E/%20`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/GoodReceipts', respJson.data.positions)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.positions.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            console.log(poModel)
                            poModel.refresh();
                        }else{

                            poModel.setProperty('/GoodReceipts', [])
                             poModel.setProperty('/Count', 0)
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },


        });
    })