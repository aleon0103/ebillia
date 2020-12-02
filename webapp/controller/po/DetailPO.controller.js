// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/TextArea",
    "sap/ui/core/Core",
     "sap/ui/model/resource/ResourceModel"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, Dialog, DialogType, Button, ButtonType, Label, Text, TextArea, Core,ResourceModel) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailPO", {
            formatter: formatter,
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
                    motivosRechazo: motivosRechazo
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


            },

            onRowSelectionChange: function (oEvent) {
                console.log('on selection change');
                var selectedindex = oEvent.getParameter("rowIndex"); // selected Row Index
                // Set Selected Row Editable

                var oTable = this.byId("PODetailTable");

                var aItems = oTable.getRows();
                var aIndices = oTable.getSelectedIndices();

                for (var item of aIndices) {

                    console.log('set editable item', item)
                    aItems[item].getCells()[7].setEditable(false);
                    aItems[item].getCells()[8].setEditable(false);
                    aItems[item].getCells()[9].setEditable(false);


                }

            },


            onSelectionChange: function (oEvent) {

                console.log('On table selection change');

                var oList = oEvent.getSource();
                console.log('All items');
                var itemArray = oList.getItems();

                for (var item of itemArray) {
                    item.getCells()[7].setEditable(!item.getSelected());

                    if (item.getSelected() == true) {
                        console.log(item);
                        console.log(item.getBindingContext("POdetailView").getObject())
                        item.getCells()[7].setSelectedKey('');
                        item.getCells()[8].setEditable(!item.getSelected());
                        item.getCells()[8].resetProperty("value");
                        item.getCells()[9].setEditable(!item.getSelected());
                        item.getCells()[9].resetProperty("value");

                        console.log(item.getBindingContext("POdetailView").getObject())

                    } else {

                    }




                }





            },

            configureTable: function () {

            },
            onApproveSelect: function () {

               // this.onApproveDialogPress();



            },

            _validarOrden: function () {


                //ir order is valid 

                this.onApproveDialogPress();

            },

            onApproveDialogPress: function () {
                if (!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Confirm",
                        content: new Text({ text: "Do you want to submit this order?" }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Submit",
                            press: function () {
                                MessageToast.show("Submit pressed!");
                                this.oApproveDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this)
                        })
                    });
                }

                //setear el modelo antes de abrirlo 

                this.oApproveDialog.open();
            },


            onReject: function () {
                var that=this;
                 this.getView().getModel("i18n").getResourceBundle().then(function(oBundleInstance) {

                if (!that.oRejectDialog) {
                    that.oRejectDialog = new Dialog({
                        title: oBundleInstance.getText("rejectOrderTitle") ,
                        type: DialogType.Message,
                        content: [
                            new Label({
                                text: oBundleInstance.getText("rejectOrderLabel") ,
                                labelFor: "rejectionNote"
                            }),
                            new TextArea("rejectionNote", {
                                width: "100%",
                                placeholder: oBundleInstance.getText("rejectOrderPlaceHolder") ,
                                liveChange: function (oEvent) {
                                    var sText = oEvent.getParameter("value");
                                    that.oRejectDialog.getBeginButton().setEnabled(sText.length > 0);
                                }.bind(that)
                            })
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Reject",
                            enabled: false,
                            press: function () {
                                var sText = Core.byId("rejectionNote").getValue();
                               // MessageToast.show("Note is: " + sText);
                                that._rejectOrder();
                                that.oRejectDialog.close();
                            }.bind(that)
                        }),
                        endButton: new Button({
                            text: "Cancel",
                            press: function () {
                                that.oRejectDialog.close();
                            }.bind(that)
                        })
                    });
                }

                that.oRejectDialog.open();

    
});
               
            
           
                




            },

            _rejectOrder:function(){
                console.log('RECHAZANDO ORDEN');
            }








        });
    })