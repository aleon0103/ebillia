// @ts-ignore
sap.ui.define([
    "./../../BaseController",
    "./../../APIController",
    "../../../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/Device",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/ui/core/Core",
    "sap/ui/core/Fragment",
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, Dialog, DialogType, Button,
        ButtonType, Core, Fragment) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailDeliveryNotifications", {
            deliveryDate: null,
            ordenCompra: [],
            index: null,
            objLength: [],
            _oDialog: null,
            oModelUser: null,
            idOrdenConcat: null,
            completadoConcat: null,

            onInit: function () {
                console.log('on Detail Delivery Notifications component view')

                this.btnModel = new JSONModel();
                this.btnModel.setData({
                    badgeMin: 0,
                    badgeMax: "",
                    badgeCurrent: 1,
                    buttonText: "Button with Badge",
                    buttonTooltip: "Badged Button",
                    buttonIcon: "sap-icon://cart",
                    buttonType: "Default",
                    buttonWithIcon: true,
                    buttonWithText: true,
                    buttonWithTooltip: false
                });
                this.getView().setModel(this.btnModel);

                // var oModel = new JSONModel({
                //     busy: false,
                //     delay: 0,
                //     orderId: ''
                // });
                // this.getView().setModel(oModel, "detailDeliveryN");

                var pModel = new JSONModel({
                    positions: null
                });
                this.getOwnerComponent().setModel(pModel, "positionsSelected");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("NotificacionEntregaNacionalDetail").attachPatternMatched(this._routePatternMatched, this);
                console.log(this.getView());
            },

            onAfterRendering: function () {
                this.oModelUser = this.getModel("user").getData();
            },

            _routePatternMatched: function (oEvent) {
                console.log("ROUTE U INVOICE DETAIL MATCH")
                

                var oArguments = oEvent.getParameter("arguments");
                console.log(oArguments.orderId);
                this._sObjectId = oArguments.orderId;
                var oViewModel = this.getModel("detailDeliveryN")

                console.log(this.getModel("invoiceUpload"));

                var poModel = this.getModel("purchaseOrderModel").oData;
                var oc = null;

                var poModel = this.getModel("purchaseOrderModel").oData;
                for (let i = 0; i < poModel.PurchaseOrders.length; i++) {
                    if (poModel.PurchaseOrders[i].idOrdenCompra == this._sObjectId) {
                        oc = poModel.PurchaseOrders[i];
                        this.index = i
                        break;
                    }
                }

                this.ordenCompra = poModel.PurchaseOrders;

                oViewModel.setProperty("/orderId", this._sObjectId);




                if (this._sObjectId) {
                    this._getGoodsReceipts();
                }



            },


            _getGoodsReceipts: function () {

                console.log('on get Goods Receips')



                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var selProveedor = userId; // modificar para tomar el id del proveedor seleccioando 

                var proveedorId = rol === 3 ? userId : selProveedor;
                var poModel = this.getModel("detailDeliveryN");


                if (!this.ordenCompra[this.index].bandera) {

                    poModel.setProperty('/busy', true);
                    var me = this;
                    var path = API.serviceList().GET_POSICIONES_OC + `${userId}/${this._sObjectId}/E/X`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            poModel.setProperty('/busy', false);
                            if (respJson && respJson.data) {


                                for (let i = 0; i < respJson.data.matrixValues.length; i++) {
                                    respJson.data.matrixValues[i].idTmp = i;
                                    respJson.data.matrixValues[i].verificarIngreso = false;
                                }

                                me.ordenCompra[me.index].posicion = respJson.data.matrixValues;
                                me.ordenCompra[me.index].bandera = true;
                                for (let j = 0; j < me.ordenCompra[me.index].posicion.length; j++) {
                                    me.ordenCompra[me.index].posicion[j].selected = false;
                                }

                                poModel.setProperty('/GoodReceipts', respJson.data.matrixValues)
                                if (respJson.data) {
                                    poModel.setProperty('/Count', respJson.data.matrixValues.length)

                                } else {
                                    poModel.setProperty('/Count', 0)
                                }

                                console.log(poModel)
                                poModel.refresh();

                                var posiciones = me.ordenCompra[me.index].posicion;

                                for (let i = 0; i < posiciones.length; i++) {
                                    if (posiciones[i].grupoMaterial === "001") {
                                        console.log('termino');
                                        me.getRouter().navTo("masterDeliveryNotificationsG1");
                                        break;
                                    }

                                    if (!posiciones[i].selected) {
                                        me.ordenCompra[me.index].isCompletada = false;
                                        me.getView().byId("switchCompletar").setState(false);
                                        break;
                                    } else {
                                        me.ordenCompra[me.index].isCompletada = true;
                                        me.getView().byId("switchCompletar").setState(true);
                                    }
                                    console.log('termino2');
                                }

                                console.log('termino3');
                            } else {

                                poModel.setProperty('/GoodReceipts', [])
                                poModel.setProperty('/Count', 0)
                            }
                        }, function (err) {
                            poModel.setProperty('/busy', false);

                            console.log("error in processing your request", err);
                        });
                } else {
                    var posiciones = this.ordenCompra[this.index].posicion;

                    for (let i = 0; i < posiciones.length; i++) {
                        if (!posiciones[i].selected) {
                            this.ordenCompra[this.index].isCompletada = false;
                            this.getView().byId("switchCompletar").setState(false);
                            break;
                        } else {
                            this.ordenCompra[this.index].isCompletada = true;
                            this.getView().byId("switchCompletar").setState(true);
                        }
                    }

                    var modelPositions = this.getModel("detailDeliveryN")
                    modelPositions.setProperty('/GoodReceipts', posiciones)

                    modelPositions.refresh();
                    modelPositions.updateBindings();
                    poModel.setProperty('/busy', false);
                }
            },

            deliveryDateSelected: function (oEvent) {
                var date = oEvent.getSource();
                this.deliveryDate = date._lastValue;
                var pModel = this.getModel("positionsSelected");

                var isValidDate = this.byId("deliveryDateDN").isValidValue();

                if (isValidDate && this.deliveryDate !== "") {
                    this.getModel("detailDeliveryN").setProperty('/fecha_entrega', this.deliveryDate);

                    var poModel = this.getModel("detailDeliveryN").oData;

                    if (poModel.GoodReceipts && poModel.GoodReceipts.length > 0) {
                        for (let i = 0; i < poModel.GoodReceipts.length; i++) {
                            let fechaPref = poModel.GoodReceipts[i].fechaEntregaPosicion;

                            let fecha = new Date(fechaPref);
                            let dosSemanas = 1000 * 60 * 60 * 24 * 13;
                            let fechaResta = fecha.getTime();

                            let resta = fechaResta - dosSemanas;
                            let date = new Date(resta);

                            let day = date.getDate();
                            let month = date.getMonth() + 1;
                            let year = date.getFullYear();

                            let dayF
                            if (day < 10) {
                                dayF = '0' + day;
                            } else {
                                dayF = day
                            }

                            let monthF
                            if (month < 10) {
                                monthF = '0' + month;
                            } else {
                                monthF = month
                            }

                            let fechaInicial = year + '-' + monthF + '-' + dayF;

                            let pos = poModel.GoodReceipts[i].idTmp + 1;
                            if (Date.parse(this.deliveryDate) < Date.parse(fechaInicial)) {
                                var msgError = 'Error en fecha de entrega ' + poModel.GoodReceipts[i].fechaEntregaPosicion + ' en posición ' + pos + ' orden de compra ' + poModel.GoodReceipts[i].num_doc_comp +
                                    '. La fecha de entrega seleccionada no puede ser menor a 15 días de la fecha de entrega de la posición.';
                                MessageToast.show(msgError, { duration: 5000, width: "200px" });
                                break;
                            } else {
                                console.log('valido');
                            }
                        }
                    }
                } else {
                    this.getModel("detailDeliveryN").setProperty('/fecha_entrega', null);
                }
            },

            switchConfirm: function (oControlEvent) {
                var confirmar = oControlEvent.getParameters().state;
                var poModel = this.getModel("detailDeliveryN").oData;

                let posiciones = poModel.GoodReceipts;
                for (let i = 0; i < posiciones.length; i++) {
                    if (confirmar) {
                        let cantidadIngresada;
                        if (posiciones[i].cantidadEntregaEfectivamente == NaN || posiciones[i].cantidadEntregaEfectivamente == "" || !posiciones[i].cantidadEntregaEfectivamente) {
                            cantidadIngresada = 0
                        } else {
                            cantidadIngresada = Number(posiciones[i].cantidadEntregaEfectivamente)
                        }

                        let operacion = posiciones[i].cantidad - cantidadIngresada;

                        if (operacion >= 0) {
                            posiciones[i].cantidadIngreso = operacion;
                        } else {
                            posiciones[i].cantidadIngreso = 0;
                        }

                        posiciones[i].verificarIngreso = true;
                        this.ordenCompra[this.index].posicion[i].selected = false;

                        this.ordenCompra[this.index].isCompletada = true;
                    } else {
                        posiciones[i].verificarIngreso = false;
                        posiciones[i].cantidadIngreso = 0;
                        this.ordenCompra[this.index].posicion[i].selected = true;
                        this.ordenCompra[this.index].isCompletada = false;
                    }

                    this.selecciones(i);
                }

                var modelPositions = this.getModel("detailDeliveryN")
                modelPositions.setProperty('/GoodReceipts', posiciones)

                modelPositions.refresh();
                modelPositions.updateBindings();


            },

            selecciones: function (index) {
                if (this.ordenCompra[this.index].posicion[index].selected) {
                    this.ordenCompra[this.index].posicion[index].selected = false;
                } else {
                    this.ordenCompra[this.index].posicion[index].selected = true;
                }


                this.objLength = [];
                for (let i = 0; i < this.ordenCompra.length; i++) {
                    if (this.ordenCompra[i].posicion && this.ordenCompra[i].posicion.length > 0) {
                        for (let j = 0; j < this.ordenCompra[i].posicion.length; j++) {
                            if (this.ordenCompra[i].posicion[j].selected) {
                                /* Agregar entradas de mercancia seleccionadas */
                                this.objLength.push(this.ordenCompra[i].posicion[j]);

                            }
                        }
                    }
                }

                var cantidadFacturas = this.objLength.length;

                var pModel = this.getModel("positionsSelected");
                var mDetail = this.getModel("detailDeliveryN");

                pModel.setProperty('/positions', this.objLength);
                mDetail.setProperty('/count', cantidadFacturas);
                pModel.refresh();
            },

            verificarEntrada: function (data) {
                console.log(data);
                this.selecciones(data);
            },

            onCheckIngreso: function (index, e) {
                this.getView().byId("switchCompletar").setState(false);
                var poModel = this.getModel("detailDeliveryN").oData;

                let posiciones = poModel.GoodReceipts;


                if (e) {
                    let cantidadIngresada;
                    if (posiciones[index].cantidadEntregaEfectivamente == NaN || posiciones[index].cantidadEntregaEfectivamente == "" || !posiciones[index].cantidadEntregaEfectivamente) {
                        cantidadIngresada = 0
                    } else {
                        cantidadIngresada = Number(posiciones[index].cantidadEntregaEfectivamente)
                    }


                    let operacion = posiciones[index].cantidad - cantidadIngresada;

                    if (operacion >= 0) {
                        posiciones[index].cantidadIngreso = operacion;
                    } else {
                        posiciones[index].cantidadIngreso = 0;
                    }

                    posiciones[index].verificarIngreso = true;
                } else {
                    posiciones[index].cantidadIngreso = 0;
                    posiciones[index].verificarIngreso = false;
                }

                var modelPositions = this.getModel("detailDeliveryN")
                modelPositions.setProperty('/GoodReceipts', posiciones)

                modelPositions.refresh();
                modelPositions.updateBindings();
            },

            validarCompleta: function () {
                var poModel = this.getModel("detailDeliveryN").oData;
                let posiciones = poModel.GoodReceipts;

                for (let i = 0; i < posiciones.length; i++) {
                    if (!posiciones[i].selected) {
                        this.ordenCompra[this.index].isCompletada = false;
                        this.getView().byId("switchCompletar").setState(false);
                        break;
                    } else {
                        this.ordenCompra[this.index].isCompletada = true;
                        this.getView().byId("switchCompletar").setState(true);
                    }
                }
            },

            changeIngreso: function (index, oEvent) {
                let newValue = oEvent.getParameter("newValue");

                var poModel = this.getModel("detailDeliveryN").oData;
                let posiciones = poModel.GoodReceipts;

                let valorIngreso
                if (newValue == NaN || newValue == "") {
                    valorIngreso = 0;
                } else {
                    valorIngreso = newValue;
                }

                var pos = posiciones[index];

                let c2;
                if (pos.cantidadEntregaEfectivamente == NaN || pos.cantidadEntregaEfectivamente == "" || !pos.cantidadEntregaEfectivamente) {
                    c2 = 0
                } else {
                    c2 = Number(pos.cantidadEntregaEfectivamente)
                }
                let valorRestante = pos.cantidad - c2;

                if (valorIngreso > valorRestante) {
                    pos.cantidadIngreso = valorRestante;

                } else {
                    pos.cantidadIngreso = valorIngreso;
                }

                var modelPositions = this.getModel("detailDeliveryN")
                modelPositions.setProperty('/GoodReceipts', posiciones)

                modelPositions.refresh();
                modelPositions.updateBindings();
            },

            reviewData: function () {
                var data = this.getModel("positionsSelected").oData; console.log(data);
                let posiciones = data.positions;
            },

            onConfirm: function (oEvent) {
                var pModel = this.getModel("positionsSelected");
                var positions = pModel.getProperty('/positions');
                var arrIdOC = [];
                var arrCompletado = [];

                for (let i = 0; i < positions.length; i++) {
                    const p = positions[i];
                    p.fecha_entrega = this.deliveryDate;
                    arrIdOC.push(p.num_doc_comp);
                }

                // @ts-ignore
                this.idOrdenConcat = [... new Set(arrIdOC)];

                for (let i = 0; i < this.idOrdenConcat.length; i++) {
                    const p = this.idOrdenConcat[i];
                    const oc = this.ordenCompra.find(e => e.idOrdenCompra == p);
                    arrCompletado.push(oc.isCompletada);
                }

                this.completadoConcat = arrCompletado;

                this.openDialog();
            },

            openDialog: function () {
                if (!this._oDialog) {
                    this._oDialog = sap.ui.xmlfragment("ns.EBilliaApp.view.asn.National.Dialog", this);
                    this.getView().addDependent(this._oDialog);
                }
                this._oDialog.open();
            },

            onCrearASN_Nacional: function () {
                var pModel = this.getModel("positionsSelected");
                var positions = pModel.getProperty('/positions');
                var arrMateriales = [];

                this._oDialog.setBusy(true);

                console.log(positions);
                for (let i = 0; i < positions.length; i++) {
                    const p = positions[i];
                    var oMaterial = {
                        "cantidadEntregadaEfectivamente": p.cantidadEntregaEfectivamente,
                        "cantidadEmbacada": 0,
                        "cantidadEntregada": p.cantidad,
                        "cantidadRecibida": p.cantidadIngreso,
                        "descripcion": p.descripcionMaterial,
                        "lote": "",
                        "material": p.idMaterial,
                        "numLados": "",
                        "posicion": p.num_pos_doc_comp,
                        "vam": p.valorMatriz,
                        "fecha_entrega": p.fecha_entrega,
                        "idOrdenCompra": p.num_doc_comp,
                        "centro_logistico": p.centro,
                        "almacen": p.almacen,
                        "noReparto": p.noReparto
                    };
                    arrMateriales.push(oMaterial);
                }

                var oEntry =
                {
                    "descripcion": "",
                    "estatus": "P",
                    "idOrdenCompra": this.idOrdenConcat.join(),
                    "ldetalle": arrMateriales,
                    "proveedor": this.oModelUser.id,
                    "tipo": "N",
                    "completado": this.completadoConcat.join()
                };

                console.log(oEntry);

                var that = this;
                var path = API.serviceList().CREAR_ASN_NACIONAL;
                API.Post(path, oEntry).then(
                    function (respJson, paramw, param3) {
                        that._oDialog.setBusy(false);
                        console.log(respJson);

                        if (respJson.message === "CREADO") {
                            MessageToast.show(respJson.message);
                            that._oDialog.close();
                            that.getRouter().navTo("NotificacionEntregaNacional", {
                                param: true
                            }, true);
                        } else {
                            MessageToast.show(respJson.message)
                        }

                    }, function (err) {
                        that._oDialog.setBusy(false);
                        console.log("error in processing your request", err);
                    });
            },

            onCloseDialog: function () {
                this._oDialog.close();
            },

            onAfterCloseDialog: function () {
                this._oDialog.destroyContent();
                this._oDialog = null;
            }

        });
    })