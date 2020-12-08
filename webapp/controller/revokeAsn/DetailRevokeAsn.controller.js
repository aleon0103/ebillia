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
                    delay: 0,
                    orderId: ''
                });
                this.getView().setModel(oModel, "asnDetailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cancelarASNDetail").attachPatternMatched(this._routePatternMatched, this);

                 var oViewModel = this.getModel("asnDetailView");
                oViewModel.setProperty('/ASN', '');

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE DETAIL MATCH")

                var oArguments = oEvent.getParameter("arguments");  
                this._sObjectId = oArguments.orderId;

                
                var poModel = this.getModel("asnModel").oData; 

                if (poModel.ASN.length > 0) {
                    this.getView().byId("actionRevoke").setVisible(true);
                } else {
                    this.getView().byId("actionRevoke").setVisible(false);
                }
                
                for (let i = 0; i < poModel.ASN.length; i++) {
                    if (poModel.ASN[i].noAsn == this._sObjectId) {
                        this.asnObject = poModel.ASN[i];
                        break;
                    }
                }
                
                var detalle = this.asnObject.ldetalle;

                if (this.asnObject.estatus == 'CONFIRMADA' || this.asnObject.estatus == 'ANULADA') {
                   
                    this.getView().byId("actionRevoke").setEnabled(false);
                    
                } else { 
                   
                    this.getView().byId("actionRevoke").setEnabled(true);

                }
                
                var oViewModel = this.getModel("asnDetailView");
                oViewModel.setProperty('/ASN', this._sObjectId);
                oViewModel.setProperty('/ASNDetalle', this.asnObject.ldetalle);
                oViewModel.refresh();
            },

            anularASN: function () {

                var me = this;
                var path = API.serviceList().POST_ANULAR_ASN + `${this._sObjectId}`;
                API.Post(path).then(
                    function (respJson, paramw, param3) {
                       // poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {

                            let response = respJson.data;

                            if (response && response.E_MENSAJES && response.E_MENSAJES.TYPE == 'S') {
                            
                                
                            } else {
                            
                              
                            }

                             MessageToast.show(respJson.message, {duration: 5000, width: "200px"});

                            // poModel.setProperty('/ASN', [respJson.data])
                            // if (respJson.data) {
                            //     poModel.setProperty('/Count', 1)

                            // } else {
                            //     poModel.setProperty('/Count', 0)
                            // }

                            // console.log(poModel)
                            // poModel.refresh();

                        
                        }
                    }, function (err) {
                      //  poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            }

           

        });
    })