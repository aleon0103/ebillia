sap.ui.define([
    "./../BaseController",
    "./../APIController",
    'sap/ui/core/Fragment',
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    'sap/m/MessageToast',
    "sap/ui/core/syncStyleClass"
], function (BaseController, API,Fragment, Controller, Filter, FilterOperator, JSONModel, MessageBox, MessageToast, syncStyleClass) {
	"use strict";

	return BaseController.extend("ns.EBilliaApp.controller.Currency", {

		onInit: function () {

             var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "currency");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "currencyModel");
                this.getMonedas()
                this.getHomologacion();
        },
        getMonedas: function(){
            var poModel = this.getModel("currencyModel");
                poModel.setProperty('/busy', true);
                poModel.setProperty('/okSend', false);
                const objModel = {
                    codigo:'',
                    identificador:''
                }
                poModel.setProperty('/monedaObj', objModel);
                poModel.setProperty('/form', false);
                poModel.setProperty('/noform', true);
            var path = API.serviceList().GET_MONEDAS;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        console.log(respJson);
                        
                        if (respJson.moneda) {
                            
                             poModel.setProperty("/monedas", respJson.moneda)
                              
                        }else{
                             poModel.setProperty("/monedas", [])
                        }

                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
                    console.log(this.getModel("currencyModel"));
                    

        },
        getHomologacion: function(){
            var poModel = this.getModel("currencyModel");
                poModel.setProperty('/busy', true);
                poModel.setProperty('/okSend', false);
                const objModelH = {
                    codigo:'',
                    identificador:''
                }
                poModel.setProperty('/monedaObjH', objModelH);
                poModel.setProperty('/formH', false);
                poModel.setProperty('/noformH', true);
               
            var path = API.serviceList().GET_HOMOLOGACION;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        console.log(respJson);
                        
                        if (respJson.homologacionMoneda) {
                            
                             poModel.setProperty("/homologacion", respJson.homologacionMoneda)
                              
                        }else{
                             poModel.setProperty("/homologacion", [])
                        }

                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
                    console.log(this.getModel("currencyModel"));
                    

        },
        handleDetailsPress : function(oEvent) {
            var moneda = oEvent.getSource().getBindingContext("currencyModel").getProperty('codigoMoneda');
            var id = oEvent.getSource().getBindingContext("currencyModel").getProperty('idMoneda');
            
            this.confirmDelete(moneda, id)
        },
        confirmDelete: function (moneda, id) {
			MessageBox.confirm("¿Seguro de borrar "+ moneda + "?", {
				actions: ["Aceptar", MessageBox.Action.CLOSE],
				emphasizedAction: "Aceptar",
				onClose: function (sAction) {
                    if (sAction == 'Aceptar') {
                        this.deleteItem(id)
                    }
					
				}
			});
		},
        deleteItem: function (id){

            var poModel = this.getModel("currencyModel");
            poModel.setProperty('/busy', true);

            var path = API.serviceList().DELETE_MONEDAS+`?idMoneda=${id}`;
                API.Put(path, null).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(respJson.result.message)
                        this.getMonedas()
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
        },
        handleDetailsPressH : function(oEvent) {
            var moneda = oEvent.getSource().getBindingContext("currencyModel").getProperty('hmoneda');
            var id = oEvent.getSource().getBindingContext("currencyModel").getProperty('idHomologacion');
            
            this.confirmDeleteH(moneda, id)
        },
        confirmDeleteH: function (moneda, id) {
			MessageBox.confirm("¿Seguro de borrar "+ moneda + "?", {
				actions: ["Aceptar", MessageBox.Action.CLOSE],
				emphasizedAction: "Aceptar",
				onClose: function (sAction) {
                    if (sAction == 'Aceptar') {
                        this.deleteItemH(id)
                    }
					
				}
			});
		},
        deleteItemH: function (id){

            var poModel = this.getModel("currencyModel");
            poModel.setProperty('/busy', true);

            var path = API.serviceList().DELETE_HOMOLOGACION+`?idHomologacion=${id}`;
                API.Put(path, null).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(respJson.result.message)
                        this.getHomologacion()
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
        },
        handleDialogCreatePress: function (oEvent) {
			var poModel = this.getModel("currencyModel");
            poModel.setProperty('/form', true);
            poModel.setProperty('/noform', false);
		},
        handleDialogCancelPress: function (oEvent) {
			var poModel = this.getModel("currencyModel");
            poModel.setProperty('/form', false);
            poModel.setProperty('/noform', true);
        },
        handleDialogSavePress: function(){
            var poModel = this.getModel("currencyModel");
            
            const modelo = poModel.getProperty('/monedaObj')
            if (modelo.codigo == '' || modelo.identificador == '') {
                MessageToast.show('Favor de completar todos los campos')
                return;
            }
            
            this._createCurrency(modelo)
            
        },
        _createCurrency: function (datos){
            const body = {
                'descripcionMoneda': datos.identificador,
                'codigoMoneda': datos.codigo,
                'modulo': 'P'
            } 

            var poModel = this.getModel("currencyModel");
            const objModel = {
                    codigo:'',
                    identificador:''
                }
            poModel.setProperty('/monedaObj', objModel);
            poModel.setProperty('/form', false);
            poModel.setProperty('/noform', true);
            var path = API.serviceList().CREATE_MONEDAS;
                API.PostData(path, body).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(respJson.result.mensaje)
                        this.getMonedas()
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
        },
        handleDialogCreatePressH: function (oEvent) {
			var poModel = this.getModel("currencyModel");
            poModel.setProperty('/formH', true);
            poModel.setProperty('/noformH', false);
		},
        handleDialogCancelPressH: function (oEvent) {
			var poModel = this.getModel("currencyModel");
            poModel.setProperty('/formH', false);
            poModel.setProperty('/noformH', true);
        },
        handleDialogSavePressH: function(){
            var poModel = this.getModel("currencyModel");
            
            const modelo = poModel.getProperty('/monedaObjH')
            if (modelo.codigo == '' || modelo.identificador == '') {
                MessageToast.show('Favor de completar todos los campos')
                return;
            }
            
            this._createCurrencyH(modelo)
            
        },
        _createCurrencyH: function (datos){
           
            var poModel = this.getModel("currencyModel");
            const objModelH = {
                    codigo:'',
                    identificador:''
                }
            poModel.setProperty('/monedaObjH', objModelH);
            poModel.setProperty('/formH', false);
            poModel.setProperty('/noformH', true);
            var path = API.serviceList().CREATE_HOMOLOGACION+ `?descripcionMoneda=${datos.identificador}&hMoneda=${datos.codigo}`;
                API.PostData(path, null).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(respJson.result.mensaje)
                        this.getHomologacion()
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
        }
		
		
	});
});