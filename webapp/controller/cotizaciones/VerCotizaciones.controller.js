sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast,Device) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.VerCotizaciones", {

            formatter: formatter,

            onInit: function () {
                console.log('on init  Invoice Upload component view');

                var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "cotizaciones");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "cotizacionesModel");

               setTimeout(() => {
                   this._getCotizaciones()
               }, 500);
                
   
            },

            
            onSearch: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                  
                    this.onRefresh();
                    return;
                }

                var sQuery = oEvent.getParameter("query");

                if (sQuery) {
                    //	this._oListFilterState.aSearch = [new Filter("CustomerName", FilterOperator.Contains, sQuery)];
                    this._searchASNById(sQuery);
                } else {
                    //	this._oListFilterState.aSearch = [];
                    this._getCotizaciones();
                }
                //	this._applyFilterSearch();

            },
            searchById: function(param){
                var poModel = this.getModel("cotizacionesModel");
                var listado = this.getModel("cotizacionesModel").getProperty('/listado');
                var data = []
                listado.forEach(element => {
                    if (element.usuario_procesador.includes(param)) {
                        data.push(element);
                    }
                });
                poModel.setProperty('/listado', data)
            },

            onRefresh: function () {
                this._getCotizaciones();
            },

           




            _getCotizaciones: function () {

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get Cotizaciones');
                var poModel = this.getModel("cotizacionesModel");
                poModel.setProperty('/busy', true);
                var me = this;
                var path = API.serviceList().GET_COTIZACIONES + `${userId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {
                            var listado = []

                           
                            if (respJson.data) {
                                respJson.data.forEach(element => {
                                   var item = element;
                                   item.estatus = item.items[0].estatus
                                   item.fecha_modificacion = item.items[0].fecha_modificacion 
                                   item.ruta_archivo = item.items[0].ruta_archivo 
                                   item.descripcion = item.items[0].descripcion 
                                   item.download = false;
                                   if (item.items[0].ruta_archivo) {
                                       item.download = true;
                                   }
                                   listado.push(item)
                                });
                                poModel.setProperty('/Count', respJson.data.length)
                                 

                            } else {
                                poModel.setProperty('/Count', 0)

                            }
                            poModel.setProperty('/listado', listado)
                            console.log(poModel)
                            poModel.refresh();
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },
            download: function (oEvent){
                 var ruta = oEvent.getSource().getBindingContext("cotizacionesModel").getProperty('ruta_archivo');
                 console.log(ruta);
                 var poModel = this.getModel("cotizacionesModel");
                 poModel.setProperty('/busy', true);
                var path = API.serviceList().GET_COTIZACIONES + `?rutaArchivo=${ruta}`;
                API.Get(path).then(
                    function (data, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (data.byteLength>0) {
       
                        this.visualizarArchivo(data, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')

                        }else {
                            MessageToast.show('Error')
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });

            },
            visualizarArchivo: function(data, tipo) {
                var file = new Blob([data], { type: tipo });
                var fileURL = URL.createObjectURL(file);

                var win = window.open();
                win.document.write('<iframe src="' + fileURL  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>')
            }

           
        });
    })