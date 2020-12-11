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
        pronosticoObject: null,

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

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE DETAIL MATCH")

                var oArguments = oEvent.getParameter("arguments");  console.log(oArguments);
                this._sObjectId = oArguments.orderId;

                
                var proModel = this.getModel("pronosticoModel").oData; 
                var oViewModel = this.getModel("pronosticoDetailView");

                if (this._sObjectId !== "0") {
                    for (let i = 0; i < proModel.Pronosticos.length; i++) {
                        if (proModel.Pronosticos[i].idInbox == this._sObjectId) {
                            this.pronosticoObject = proModel.Pronosticos[i];
                            break;
                        }
                    }
                    console.log(proModel);
                    if (proModel.Pronosticos.length > 0) {
                        oViewModel.setProperty('/Pronostico', this.pronosticoObject.nombre_proveedor);
                        oViewModel.setProperty('/PronosticoDetalle', this.pronosticoObject.items);
                    } else {
                        oViewModel.setProperty('/Pronostico', '');
                        oViewModel.setProperty('/PronosticoDetalle', []);
                    }
                    
                    
                } else {
                    oViewModel.setProperty('/Pronostico', '');
                    oViewModel.setProperty('/PronosticoDetalle', []);
                }
               
                
                
                oViewModel.refresh();
                console.log(oViewModel);
            },

            downloadFile: function (oEvent) {
                console.log(oEvent);
                //console.log(oEvent.getSource().getText());
            },

            anularASN: function () {
                var oBusy = this.getModel("busyPage");
                oBusy.setProperty("/busy", true);

                var oViewModel = this.getModel("asnDetailView");
                var me = this;

                var path = API.serviceList().POST_ANULAR_ASN + `${this._sObjectId}`;
                API.PostService(path).then(
                    function (respJson, paramw, param3) {
                       // poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {

                            let response = respJson.data;
                            
                            if (response && response.E_MENSAJES && response.E_MENSAJES.TYPE == 'S') {
                                me.getView().byId("actionRevoke").setVisible(false);
                                oViewModel.setProperty('/ASN', '');
                                oViewModel.setProperty('/ASNDetalle', []);
                                
                            } else {
                            
                                console.log('Error revoke asn');
                              
                            }

                            MessageToast.show(respJson.message, {duration: 5000, width: "200px"});

                            oViewModel.refresh();
                            oBusy.setProperty("/busy", false);
                        }
                    }, function (err) {
                      
                        oBusy.setProperty("/busy", false);
                        MessageToast.show(err.error.message, {duration: 5000, width: "200px"});

                        console.log("error in processing your request", err);
                    });
            },


           

        });
    })