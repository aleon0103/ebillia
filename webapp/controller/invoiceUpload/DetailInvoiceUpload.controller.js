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

        return BaseController.extend("ns.EBilliaApp.controller.DetailInvoiceUpload", {
            formatter: formatter,
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
                this.getRouter().getTargets().display("detailObjectNotFound");

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE DETAIL MATCH")
                var oArguments = oEvent.getParameter("arguments");
                this._sObjectId = oArguments.orderId;
                console.log(this._sObjectId);
                var oViewModel = this.getModel("POdetailView")
                var oInvoiceModel = this.getModel("invoiceUpload");

                if (oInvoiceModel && oInvoiceModel.getProperty("/orderSelected")) {
                    console.log("ORDER SELECTED");
                } else {
                    console.log("ORDER NO SELECTED ");

                    this.getRouter().getTargets().display("detailObjectNotFound");
                }

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
            onSelectionChange: function (oEvent) {

                var oList = oEvent.getSource();
                console.log('All items');
                var itemArray = oList.getItems();

                for (var item of itemArray) {



                    if (item.getSelected() == true) {
                        console.log("item selected");
                       // console.log(item.getBindingContext("POdetailView").getObject())
                        var item = item.getBindingContext("POdetailView").getObject();
                        this._updateTempModel(item, 'push');
                    } else {
                        console.log("item deselected");
                        var item = item.getBindingContext("POdetailView").getObject();
                        this._updateTempModel(item, 'delete');
                    }

                }





            },

            _updateTempModel: function (item, method) {
               // console.log(item);
                var oInvoiceModel = this.getModel("invoiceUpload");
                var originalItems = oInvoiceModel.getProperty('/tempItems');

                if (method == 'push') {
                       if (originalItems.filter(itemb=> itemb == item).length == 0){
                   originalItems.push(item);
        }
                    
                }else if(method == 'delete'){
                originalItems = originalItems.filter(x => x  !== item)

                }

                oInvoiceModel.setProperty('/tempItems', originalItems);
                 oInvoiceModel.setProperty('/selectedCount', originalItems.length);

                
                //console.log(oInvoiceModel);

            },

            _configureTable: function () {
                this.byId("lineItemsList").removeSelections(true);

            },


            _getGoodsReceipts: function () {

                console.log('on get Goods Receips')



                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
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

                        } else {

                            poModel.setProperty('/GoodReceipts', [])
                            poModel.setProperty('/Count', 0)
                        }
                        poModel.refresh();
                        me._configureTable();
                        // me.byId("lineItemsList").removeSelections(true); 
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },


        });
    })