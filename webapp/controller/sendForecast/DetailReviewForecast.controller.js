// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/FormatterREP",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, FormatterREP, JSONModel, MessageToast, Device) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailReviewForecast", {
        index: null,
        formatter: FormatterREP,
        rutaArchivo: "",
        rol: null,
        nombre: "",

            onInit: function () {
                console.log('on Detail Review Forecast component view')

                var oModel = new JSONModel({
                    busy: false,
                    ASN: ''
                });
                this.getOwnerComponent().setModel(oModel, "pronosticoDetailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("RevisionPronosticosDemandaDetail").attachPatternMatched(this._routePatternMatched, this);

                this.busy = new JSONModel({
                    busy: false
                });
                this.setModel(this.busy, "busyPage");

                

                this.onBeforeRouteMatched();

            },


            onBeforeRouteMatched: function(oEvent) {
                var oModel = this.getOwnerComponent().getModel("user");
                this.rol = oModel.getProperty('/rol/id');
                this.nombre = oModel.getProperty('/nombre');
                
                var oViewModel = this.getOwnerComponent().getModel("pronosticoDetailView");
                if (this.rol === 3) {
                    oViewModel.setProperty('/Pronostico', this.nombre);
                } else {
                    oViewModel.setProperty('/Pronostico', "");
                }
                
            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE DETAIL MATCH")
               
                var oArguments = oEvent.getParameter("arguments");  
                this._sObjectId = oArguments.orderId;
                
                var proModel = this.getModel("pronosticoModel").oData; 
                var oViewModel = this.getModel("pronosticoDetailView");

                var nombreProveedor;
                if (this.rol === 3) {
                    nombreProveedor = this.nombre;
                } else {
                    nombreProveedor = "";
                }
                
                if (this._sObjectId !== "0") {
                    for (let i = 0; i < proModel.Pronosticos.length; i++) {
                        if (proModel.Pronosticos[i].idInbox == this._sObjectId) {
                            this.pronosticoObject = proModel.Pronosticos[i];
                            break;
                        }
                    }
                    
                    if (proModel.Pronosticos.length > 0) {
                        oViewModel.setProperty('/Pronostico', this.pronosticoObject.nombre_proveedor);
                        oViewModel.setProperty('/PronosticoDetalle', this.pronosticoObject.items);
                    } else {
                        oViewModel.setProperty('/Pronostico', nombreProveedor);
                        oViewModel.setProperty('/PronosticoDetalle', []);
                    }
                    
                    
                } else {
                    oViewModel.setProperty('/Pronostico', nombreProveedor);
                    oViewModel.setProperty('/PronosticoDetalle', []);
                }
               
                
                
                oViewModel.refresh();
               
            },

            downloadFile: function (oEvent) {
                var row = oEvent.getSource().getBindingContext("pronosticoDetailView").getObject();
              
                
                if (row.ruta_archivo && row.ruta_archivo !== "") {
                    this.rutaArchivo = row.ruta_archivo;
                    this.getFilePronostico();
                } else {
                    console.log('No file.')
                }

            },

            getFilePronostico: function () {
                var oBusy = this.getModel("busyPage");
                oBusy.setProperty("/busy", true);

                var me = this;

                var path = API.serviceList().GET_PRONOSTICO_FILE + `?rutaArchivo=${this.rutaArchivo}`;
                API.GetFiles(path, function (responseText, status) {
                    // console.log(responseText, status);
                    if (status === 200) {
                        var parts = me.rutaArchivo.split('/');
                        var name = parts[parts.length - 1];

                        let blob = new Blob([responseText], {type: 'application/json'});
                
                        var downloadURL = window.URL.createObjectURL(blob);
                        var link = document.createElement('a');
                        link.href = downloadURL;
                        link.download = name + ".xlsx";
                        link.click();

                    } else {
                        MessageToast.show('Error');
                    }

                     oBusy.setProperty("/busy", false);
                });
            
            },
 

           

        });
    })
