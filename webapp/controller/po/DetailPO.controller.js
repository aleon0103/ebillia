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
    "sap/ui/model/resource/ResourceModel",
    "sap/m/MessageBox",
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, Dialog, DialogType, Button, ButtonType, Label, Text, TextArea, Core, ResourceModel, MessageBox) {
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
                var oInvoiceModel = this.getModel("POdetailView");

                if (oViewModel && oViewModel.getProperty("/orderSelected")) {
                    console.log("ORDER SELECTED");
                } else {
                    console.log("ORDER NO SELECTED ");

                    // this.getRouter().getTargets().display("detailObjectNotFound");
                }

                console.log(this.getModel("POdetailView"));

                oInvoiceModel.setProperty("/orderId", this._sObjectId);
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
            onCloseDetailPress: function () {
                var oViewModel = this.getModel("poMain");
                oViewModel.setProperty("/layout", "OneColumn");
                this.getRouter().navTo("POConfirm");

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
                this._validarOrden();



            },

            _validarOrden: function () {

                this.getView().getModel("i18n").getResourceBundle().then(function (oBundle) {
                    var isOrderValid = true;
                    var oList = this.byId("idProductsTable");
                    var itemArray = oList.getItems();
                    for (var item of itemArray) {
                        var rowData = item.getBindingContext("POdetailView").getObject()
                        if (!item.getSelected() == true) {

                            if (rowData.nombreMotivo == "Solicitud de modificación de fecha de entrega") {

                                item.getCells()[8].setValue('');

                                console.log('sol cambio fecha', rowData);
                                if (rowData.fecharPropuesta == '' || !rowData.fecharPropuesta) {

                                    item.setHighlight('Error');
                                    //item.setHighlightText('Need to select a reason')
                                    item.getCells()[10].setState('Error');
                                    item.getCells()[10].setText(oBundle.getText("emptySuggestedDate"));
                                    isOrderValid = false;
                                } else {
                                    item.setHighlight('None');
                                    item.getCells()[10].setState('None');
                                    item.getCells()[10].setText('');
                                }

                            } else if (rowData.nombreMotivo == "Solicitud de modificación de cantidad de reparto") {
                                item.getCells()[9].setValue('');
                                if (rowData.cantidadPropuesta == '' || !rowData.cantidadPropuesta) {
                                    item.setHighlight('Error');
                                    //item.setHighlightText('Need to select a reason')
                                    item.getCells()[10].setState('Error');
                                    item.getCells()[10].setText(oBundle.getText("emptySuggestedQuantity"));

                                    isOrderValid = false;

                                } else {
                                    item.setHighlight('None');
                                    item.getCells()[10].setState('None');
                                    item.getCells()[10].setText('');
                                }


                            } else if (!rowData.nombreMotivo || rowData.nombreMotivo == "") {

                                item.setHighlight('Error');
                                //item.setHighlightText('Need to select a reason')
                                item.getCells()[10].setState('Error');
                                item.getCells()[10].setText(oBundle.getText("emptyReasonState"));
                                isOrderValid = false;

                                //break;

                            } else {
                                item.setHighlight('None');
                                item.getCells()[10].setState('None');
                                item.getCells()[10].setText('');


                            }



                        } else {
                            item.setHighlight('None');
                            item.getCells()[10].setState('None');
                            item.getCells()[10].setText('');


                        }
                    }

                    //if order is valid 

                    if (isOrderValid) {
                        this.onApproveDialogPress();
                    } else {


                        //show dialog messaje 
                        MessageToast.show(oBundle.getText("POIssuesDetectedToast"));
                    }

                }.bind(this));

            },

            onApproveDialogPress: function () {
                var that = this;
                if (!this.oApproveDialog) {
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "{i18n>ConfirmOrderTitle}",
                        content: new Text({ text: "{i18n>ConfirmOrderDialogMessage}" }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "{i18n>ConfirmOrderTitle}",
                            press: function () {
                                // MessageToast.show("Submit pressed!");
                                that._approveOrder();
                                this.oApproveDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "{i18n>ConfirmOrderCalcel}",
                            press: function () {
                                this.oApproveDialog.close();
                            }.bind(this)
                        })
                    });
                    this.getView().addDependent(this.oApproveDialog);
                }

                //setear el modelo antes de abrirlo 

                this.oApproveDialog.open();
            },

            _approveOrder: function () {

                var oViewModel = this.getModel("poMain")
                var selectedOrder = oViewModel.getProperty("/orderSelected");

                var me = this;
                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var selProveedor = userId; // modificar para tomar el id del proveedor seleccioando 

                var oDate = new Date();
                var currentDate = sap.ui.core.format.DateFormat.getDateInstance({
                    pattern: "yyyy-MM-dd"
                }).format(oDate);
                var posiciones = [];

                var oList = this.byId("idProductsTable");
                var itemArray = oList.getItems();
                for (var item of itemArray) {

                     var rowData = item.getBindingContext("POdetailView").getObject()

                    let obj = {
                        "bwart": "",
                        "cantidad": rowData.cantidad,
                        "clase_cond": "",
                        "denominacion": "",
                        "doc_ref": "",
                        "ejerDocMatnr": "",
                        "estatus": "",
                        "fechaPrefEntrega": rowData.fechaEntregaPosicion,
                        "idMaterial": rowData.idMaterial,
                        "idOrdenDeCompra": rowData.num_doc_comp,
                        "importePosOC": rowData.precio_neto,
                        "indicadorIva": "",
                        "noPosicion": rowData.num_pos_doc_comp,
                        "posDocMatnr": "",
                        "poscicion_doc": rowData.num_pos_doc_comp,
                        "precioUnitario": rowData.precio_neto,
                        "referencia": "",
                        "texto_breve": rowData.descripcionMaterial,
                        "tipocambio": "",
                        "unidad": rowData.unidad,
                        "zaehk": "",
                        "motivo": rowData.nombreMotivo,
                        "vam": rowData.valorMatriz,
                        "confirmada": item.getSelected(),
                        "fechaEntrega": rowData.fechaPropuesta,
                        "cantidadPropuesta": rowData.cantidadPropuesta,
                        "noReparto": rowData.noReparto
                    }

                    posiciones.push(obj);




                }


                let body = {
                    "centro": selectedOrder.centro,
                    "clase_documento": selectedOrder.clase_documento,
                    "condPago": selectedOrder.condPago,
                    "dummy_nombre": selectedOrder.dummy_nombre,
                    "dummy_rfc": selectedOrder.dummy_rfc,
                    "estatus": selectedOrder.estatus,
                    "fechaConfirma": currentDate,
                    "fechaCreacion": currentDate,
                    "idOrdenCompra": selectedOrder.idOrdenCompra,
                    "idProveedor": selProveedor,
                    "importeFactura": selectedOrder.importeFactura,
                    "indicadorWebre": selectedOrder.indicadorWebre,
                    "moneda": selectedOrder.moneda,
                    "posiciones": posiciones,
                    "requisitor": selectedOrder.requisitor,
                    "sociedad": selectedOrder.sociedad,
                    "tipoDeImputacion": selectedOrder.tipoDeImputacion,
                    "tipo_op": selectedOrder.tipo_op,
                    "tipocambio": selectedOrder.tipocambio,
                    "totalOc": selectedOrder.totalOc,
                    "txt_breve": selectedOrder.txt_breve,
                    "wo_em": selectedOrder.wo_em
                }

                console.log(body);


                var me = this;
                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var selProveedor = userId; // modificar para tomar el id del proveedor seleccioando 


                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenesDeCompra/confirmacion/`
                API.Put(path, body
                ).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);

                        //handle response and redirecto to main list

                        /**
                         * {message: "La orden de compra ha sido rechazada", errorMessage: null, data: {ENTREGA: null, E_MENSAJES: {TYPE: "S", MENSAJE: "Correo enviado"}}}
                         */

                        MessageBox.success(respJson.message, {
                            onClose: function () {
                                var oViewModel = me.getModel("poMain")
                                oViewModel.setProperty("/layout", "OneColumn");

                                me.getRouter().navTo("POConfirm");


                            }
                        });




                    }, function (err) {
                        console.log("error in processing your request", err);
                        MessageBox.error(err.error.message)


                    });







            },


            onReject: function () {
                var that = this;
                this.getView().getModel("i18n").getResourceBundle().then(function (oBundleInstance) {

                    if (!that.oRejectDialog) {
                        that.oRejectDialog = new Dialog({
                            title: oBundleInstance.getText("rejectOrderTitle"),
                            type: DialogType.Message,
                            content: [
                                new Label({
                                    text: oBundleInstance.getText("rejectOrderLabel"),
                                    labelFor: "rejectionNote"
                                }),
                                new TextArea("rejectionNote", {
                                    width: "100%",
                                    placeholder: oBundleInstance.getText("rejectOrderPlaceHolder"),
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
                                    that._rejectOrder(sText);
                                    Core.byId("rejectionNote").setValue('');
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

            _rejectOrder: function (note) {
                console.log('RECHAZANDO ORDEN', note);

                var me = this;
                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var selProveedor = userId; // modificar para tomar el id del proveedor seleccioando 


                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenesDeCompra/rechazo/${this._sObjectId}/${userId}`
                API.Put(path, note
                ).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);

                        //handle response and redirecto to main list

                        /**
                         * {message: "La orden de compra ha sido rechazada", errorMessage: null, data: {ENTREGA: null, E_MENSAJES: {TYPE: "S", MENSAJE: "Correo enviado"}}}
                         */

                        MessageBox.success(respJson.message, {
                            onClose: function () {
                                var oViewModel = me.getModel("poMain")
                                oViewModel.setProperty("/layout", "OneColumn");

                                me.getRouter().navTo("POConfirm");


                            }
                        });




                    }, function (err) {
                        console.log("error in processing your request", err);
                        MessageBox.error(err.error.message)


                    });






            },
            getBundleText: function (sI18nKey, aPlaceholderValues) {
                return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
            },








        });
    })