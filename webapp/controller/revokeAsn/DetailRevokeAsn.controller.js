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

        return BaseController.extend("ns.EBilliaApp.controller.DetailRevokeAsn", {
        index: null,
        asnObject: null,

            onInit: function () {
                console.log('on Detail Revoke asn component view')

                this.getView().byId("actionRevoke").setVisible(false);

                var oModel = new JSONModel({
                    busy: false,
                    ASN: ''
                });
                this.getOwnerComponent().setModel(oModel, "asnDetailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cancelarASNDetail").attachPatternMatched(this._routePatternMatched, this);

                this.busy = new JSONModel({
                    busy: false
                });
                this.setModel(this.busy, "busyPage");

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE DETAIL MATCH")

                var oArguments = oEvent.getParameter("arguments");  console.log(oArguments);
                this._sObjectId = oArguments.orderId;

                
                var poModel = this.getModel("asnModel").oData; 
                var oViewModel = this.getModel("asnDetailView");

                if (this._sObjectId !== "0") {
                    for (let i = 0; i < poModel.ASN.length; i++) {
                        if (poModel.ASN[i].noAsn == this._sObjectId) {
                            this.asnObject = poModel.ASN[i];
                            break;
                        }
                    }
                    
                    if (poModel.ASN.length > 0) {
                        this.getView().byId("actionRevoke").setVisible(true);
                        oViewModel.setProperty('/ASN', this._sObjectId);
                        oViewModel.setProperty('/ASNDetalle', this.asnObject.ldetalle);
                    } else {
                        this.getView().byId("actionRevoke").setVisible(false);
                        oViewModel.setProperty('/ASN', '');
                        oViewModel.setProperty('/ASNDetalle', []);

                        
                    }
                    
                    var detalle = this.asnObject.ldetalle;
                    if (this.asnObject.estatus == 'CONFIRMADA' || this.asnObject.estatus == 'ANULADA') {
                    
                        this.getView().byId("actionRevoke").setEnabled(false);
                        
                    } else { 
                    
                        this.getView().byId("actionRevoke").setEnabled(true);

                    }
                } else {
                    this.getView().byId("actionRevoke").setVisible(false);
                    oViewModel.setProperty('/ASN', '');
                    oViewModel.setProperty('/ASNDetalle', []);
                }
               
                
                
                oViewModel.refresh();
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

            prueba: function() {
                console.log('metodo detaillll');
            }

           

        });
    })