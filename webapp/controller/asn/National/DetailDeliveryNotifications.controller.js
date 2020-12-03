// @ts-ignore
sap.ui.define([
    "./../../BaseController",
    "./../../APIController",
    "../../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailDeliveryNotifications", {
        deliveryDate: null,
        ordenCompra: [],
        index: null,
        objLength: [],

            onInit: function () {
                console.log('on Detail Delivery Notifications component view')

                this.btnModel = new JSONModel();
                this.btnModel.setData({
                    badgeMin:			0,
                    badgeMax:			"",
                    badgeCurrent:		1,
                    buttonText: 		"Button with Badge",
                    buttonTooltip: 		"Badged Button",
                    buttonIcon: 		"sap-icon://cart",
                    buttonType: 		"Default",
                    buttonWithIcon:		true,
                    buttonWithText:		true,
                    buttonWithTooltip:	false
                });
                this.getView().setModel(this.btnModel);

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    orderId: ''
                });
                this.getView().setModel(oModel, "POdetailView");

                var pModel = new JSONModel({});
                this.getOwnerComponent().setModel(pModel, "positionsSelected");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("NotificacionEntregaNacionalDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE DETAIL MATCH")
                
                var oArguments = oEvent.getParameter("arguments");  
                console.log(oArguments.orderId);
                this._sObjectId = oArguments.orderId;
                var oViewModel = this.getModel("POdetailView")

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



                if (!this.ordenCompra[this.index].bandera) {
                    var poModel = this.getModel("POdetailView");
                    poModel.setProperty('/busy', true);
                    var me = this;
                    var path = API.serviceList().GET_POSICIONES_OC + `${userId}/${this._sObjectId}/E/X`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            poModel.setProperty('/busy', false);
                            if (respJson && respJson.data) {

                
                                for (let i = 0; i< respJson.data.matrixValues.length; i++) {
                                    respJson.data.matrixValues[i].idTmp = i;
                                     respJson.data.matrixValues[i].verificarIngreso = false;
                                }

                                console.log(me.ordenCompra, me.index);
                                me.ordenCompra[me.index].posicion = respJson.data.matrixValues;
                                me.ordenCompra[me.index].bandera = true;
                                for (let j = 0; j < me.ordenCompra[me.index].posicion.length; j++) {
                                    me.ordenCompra[me.index].posicion[j].selected = false;
                                }

                                console.log(me.ordenCompra);

                                poModel.setProperty('/GoodReceipts', respJson.data.matrixValues)
                                if (respJson.data) {
                                    poModel.setProperty('/Count', respJson.data.matrixValues.length)

                                } else {
                                    poModel.setProperty('/Count', 0)
                                }

                                console.log(poModel)
                                poModel.refresh();

                                var posiciones =  me.ordenCompra[me.index].posicion;

                                for (let i = 0; i <  posiciones.length; i++) { 
                                    if (posiciones[i].grupoMaterial === "001") {
                                        console.log('termino');
                                        me.getRouter().navTo("masterDeliveryNotificationsG1");
                                        break;
                                    }

                                    if (!posiciones[i].selected) {
                                        me.getView().byId("switchCompletar").setState(false);
                                        break;
                                    } else {
                                        me.getView().byId("switchCompletar").setState(true);
                                    }
                                    console.log('termino2');
                                }

                                console.log('termino3');
                            }else{

                                poModel.setProperty('/GoodReceipts', [])
                                poModel.setProperty('/Count', 0)
                            }
                        }, function (err) {
                            poModel.setProperty('/busy', false);

                            console.log("error in processing your request", err);
                        });
                } else {
                    var posiciones = this.ordenCompra[this.index].posicion;  
                    
                    for (let i = 0; i <  posiciones.length; i++) { 
                        if (!posiciones[i].selected) {
                            this.getView().byId("switchCompletar").setState(false);
                            break;
                        } else {
                            this.getView().byId("switchCompletar").setState(true);
                        }
                    }
                   
                    var modelPositions = this.getModel("POdetailView")
                    modelPositions.setProperty('/GoodReceipts', posiciones)
                        
                    modelPositions.refresh();
                    modelPositions.updateBindings();
                }
            },

            deliveryDateSelected: function (oEvent) {
                var date = oEvent.getSource();
                this.deliveryDate = date._lastValue;

                var poModel = this.getModel("POdetailView").oData;
            
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
                            dayF = '0'+day;
                        } else {
                            dayF = day
                        }
            
                        let monthF
                        if (month < 10) {
                            monthF = '0'+month;
                        } else {
                            monthF = month
                        }
            
                        let fechaInicial = year + '-' + monthF + '-' + dayF;
                        
                        let pos = poModel.GoodReceipts[i].idTmp + 1;
                        if (Date.parse(this.deliveryDate) < Date.parse(fechaInicial)) {
                            var msgError = 'Error en fecha de entrega '+ poModel.GoodReceipts[i].fechaEntregaPosicion+' en posición '+ pos + ' orden de compra '+ poModel.GoodReceipts[i].num_doc_comp + 
                            '. La fecha de entrega seleccionada no puede ser menor a 15 días de la fecha de entrega de la posición.';
                            MessageToast.show(msgError, {duration: 5000, width: "200px"});
                            break;
                        } else {
                            console.log('valido');
                        }
                    }
                }
                

            },

            switchConfirm: function (oControlEvent) {
                var confirmar = oControlEvent.getParameters().state;
                var poModel = this.getModel("POdetailView").oData;

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

                    } else {
                        posiciones[i].verificarIngreso = false;
                        posiciones[i].cantidadIngreso = 0; 
                        this.ordenCompra[this.index].posicion[i].selected = true;
                    }

                    this.selecciones(i);
                }
                
                var modelPositions = this.getModel("POdetailView")
                modelPositions.setProperty('/GoodReceipts', posiciones)
                  
                modelPositions.refresh();
                modelPositions.updateBindings();

                
            },

            selecciones: function (index) {
                if (this.ordenCompra[this.index].posicion[index].selected ) {
                    this.ordenCompra[this.index].posicion[index].selected = false;
                } else {
                    this.ordenCompra[this.index].posicion[index].selected = true;
                }
            
            
                this.objLength = [];
                for (let i = 0; i <  this.ordenCompra.length; i++) {
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
                pModel.setProperty('/positions', this.objLength);
                pModel.setProperty('/count', cantidadFacturas);
                pModel.refresh();
            },

            verificarEntrada: function (data) {
                console.log(data);
                this.selecciones(data);
            },

            onCheckIngreso: function (index, e) { 
                this.getView().byId("switchCompletar").setState(false);
                var poModel = this.getModel("POdetailView").oData;

                let posiciones = poModel.GoodReceipts;
               
            
                console.log(e);
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

                var modelPositions = this.getModel("POdetailView")
                modelPositions.setProperty('/GoodReceipts', posiciones)
                  
                modelPositions.refresh();
                modelPositions.updateBindings();
            },

            validarCompleta: function () {
                var poModel = this.getModel("POdetailView").oData;
                let posiciones = poModel.GoodReceipts;

                for (let i = 0; i <  posiciones.length; i++) { 
                    if (!posiciones[i].selected) {
                        this.getView().byId("switchCompletar").setState(false);
                        break;
                    } else {
                        this.getView().byId("switchCompletar").setState(true);
                    }
                }
            },

            changeIngreso: function (index, oEvent) {
                let newValue = oEvent.getParameter("newValue");

                var poModel = this.getModel("POdetailView").oData;
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

                var modelPositions = this.getModel("POdetailView")
                modelPositions.setProperty('/GoodReceipts', posiciones)
                  
                modelPositions.refresh();
                modelPositions.updateBindings();
            },

            reviewData: function () {
                var data = this.getModel("positionsSelected").oData; console.log(data);
                let posiciones = data.positions;
            }

        });
    })