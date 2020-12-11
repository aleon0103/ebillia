// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device",
    "sap/ui/core/Fragment"

],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, Fragment) {
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
                    if (originalItems.filter(itemb => JSON.stringify(itemb) === JSON.stringify(item)).length == 0) {
                        originalItems.push(item);
                    }

                } else if (method == 'delete') {
                    originalItems = originalItems.filter(x => JSON.stringify(x) !== JSON.stringify(item))

                }

                oInvoiceModel.setProperty('/tempItems', originalItems);
                oInvoiceModel.setProperty('/selectedCount', originalItems.length);


                //console.log(oInvoiceModel);

            },

            _configureTable: function () {
                console.log('configurando tabla');
                this.byId("lineItemsList").removeSelections(true);
                var oInvoiceModel = this.getModel("invoiceUpload");
                var tempItems = oInvoiceModel.getProperty('/tempItems');
                var itemArray = this.byId("lineItemsList").getItems();

                console.log(tempItems, itemArray);

                for (var item of itemArray) {
                    var itemObj = item.getBindingContext("POdetailView").getObject();
                    console.log(itemObj)

                    if (tempItems.filter(itemb => JSON.stringify(itemb) === JSON.stringify(itemObj)).length == 0) {
                        // se encontro item marcar
                        console.log('Item no encontrado');
                        //marcar check

                    } else {
                        console.log('item  encontrado');
                        item.setSelected(true);
                    }
                }




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
            onCountPress: function () {
                this.getRouter().getTargets().display("detailObjectNotFound");
                console.log(this.getRouter());
                console.log('on count press');


            },
            onShowResumeTable: function () {

                if (!this._oEMHelpDialog) {
                    Fragment.load({
                        name: "ns.EBilliaApp.view.invoice.uploadInvoiceDialog",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        this._oEMHelpDialog = oValueHelpDialog;
                        this.getView().addDependent(this._oEMHelpDialog);
                        //this._configValueHelpDialog();
                        this._oEMHelpDialog.open();
                    }.bind(this));
                } else {
                    //this._configValueHelpDialog();
                    this._oEMHelpDialog.open();
                }
            },

            onChangeFileUpload: function (oEvent) {

                var aItems = oEvent.getSource().getItems();
                var newItem = oEvent.getParameter("files");
                console.log(oEvent.getParameter("files"));
                var sUploadedFileName = oEvent.getParameter("files")[0].name;
                var fileExtesion = this.getFileExtension3(sUploadedFileName);
                console.log(sUploadedFileName);
                for (var item of aItems) {
                    var currentFile = item.getFileName()
                    if (this.getFileExtension3(currentFile) === fileExtesion) {
                        oEvent.getSource().removeItem(item);
                    }
                }


            },

            getFileExtension3: function (filename) {
                return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
            },

            handleDeleteDialog: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("listItem");

                var oContext = oSelectedItem.getBindingContext("invoiceUpload");



                var oTable = oEvent.getSource();

                var oModel2 = this.getModel("invoiceUpload");
                var aRows = oModel2.getProperty("/tempItems");


                console.log(aRows);



                var oThisObj = oContext.getObject();

                var index = $.map(aRows, function (obj, index) {

                    if (obj === oThisObj) {

                        return index;

                    }

                })

                console.log(index)
                aRows.splice(index, 1);







                oModel2.setProperty(

                    '/tempItems', aRows

                );
                oModel2.setProperty('/selectedCount', aRows.length);

                oTable.removeSelections();
                oModel2.refresh(true);




                this._configureTable();



            }




        });
    })