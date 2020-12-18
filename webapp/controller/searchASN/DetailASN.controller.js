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

        return BaseController.extend("ns.EBilliaApp.controller.DetailASN", {

            onInit: function () {
                console.log('on Detail InvoiceUpload component view')

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    orderId: '',
                    download: false
                });
                this.getView().setModel(oModel, "ASNdetailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("ASNDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U ASN DETAIL MATCH")
                var oArguments = oEvent.getParameter("arguments");
                this._sObjectId = oArguments.id;
                console.log(this._sObjectId);
                var oViewModel = this.getModel("ASNdetailView")

                console.log(this.getModel("asnSearch"));

                oViewModel.setProperty("/asn", this._sObjectId);




                if (this._sObjectId) {
                    this._getASN();

                }

            },


            _getASN: function () {

                console.log('on get ASN')

                




                var poModel = this.getModel("ASNdetailView");
                poModel.setProperty('/busy', true);
                var me = this;
                var path = API.serviceList().GET_ASN + `getAsn/${this._sObjectId}/NA`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/ASN', respJson.data)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.ldetalle.length)
                                poModel.setProperty('/download', true)

                            } else {
                                poModel.setProperty('/Count', 0)
                                poModel.setProperty('/download', false)
                            }

                            console.log(poModel)
                            poModel.refresh();
                        }else{

                             poModel.setProperty('/Count', 0)
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        poModel.setProperty('/download', false)
                        console.log("error in processing your request", err);
                    });
            },
            downloadExcel: function() {
                var poModel = this.getModel("ASNdetailView");
                poModel.setProperty('/busy', true);

                var me = this;
                var path = API.serviceList().GET_EXCEL_ASN + `${this._sObjectId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                    poModel.setProperty('/busy', false);
                    let blob = new Blob([respJson], {type: 'application/json'});

                    var downloadURL = window.URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = downloadURL;
                    link.download = this._sObjectId+".xlsx";
                    link.click();

                },
                function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                });
            },

            downloadPDF() {
                 var poModel = this.getModel("ASNdetailView");
                poModel.setProperty('/busy', true);

                var me = this;
                var path = API.serviceList().GET_PDF_ASN + `${this._sObjectId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                    poModel.setProperty('/busy', false);
                    let blob = new Blob([respJson], {type: 'application/json'});

                    var downloadURL = window.URL.createObjectURL(blob);
                    var link = document.createElement('a');
                    link.href = downloadURL;
                    link.download = this._sObjectId+".xlsx";
                    link.click();

                },
                function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                });
            }


        });
    })