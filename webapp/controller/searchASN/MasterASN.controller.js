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
        return BaseController.extend("ns.EBilliaApp.controller.MasterASN", {

            formatter: formatter,

            onInit: function () {
                console.log('on init  Invoice Upload component view');

                var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "asnSearch");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "asnModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("busquedaASN").attachPatternMatched(this._routePatternMatched, this);

   
            },

            onAfterRendering: function () {
                console.log('on Uoload Inv View After Render');
            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE MATCH")

              
                this._getASN();

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
                    this._getASN();
                }
                //	this._applyFilterSearch();

            },

            onRefresh: function () {
                this._getASN();
            },

            onSelectionChange: function (oEvent) {

                	var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");

			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}
            },



		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function (oItem) {
			var bReplace = !Device.system.phone;
			// set the layout property of FCL control to show two columns
		//	this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
			this.getRouter().navTo("ASNDetail", {
				id : oItem.getBindingContext("asnModel").getProperty("noAsn")
			}, bReplace);
		},

            /**Method to get POrchaseOrder List */

            _getASN: function () {

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get ASN');
                var poModel = this.getModel("asnModel");
                poModel.setProperty('/busy', true);
                var me = this;
                var path = API.serviceList().GET_ASN + `getAllAsn/${userId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/listado', respJson.data)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            console.log(poModel)
                            poModel.refresh();
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },


            _searchASNById: function (asn) {
                console.log('searchOrder.. ', asn);

                
                var poModel = this.getModel("asnModel");
                poModel.setProperty('/busy', true);
                var me = this;
                var path = API.serviceList().GET_ASN + `getAsn/${asn}/NA`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/listado', [respJson.data])
                            if (respJson.data) {
                                poModel.setProperty('/Count', 1)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            console.log(poModel)
                            poModel.refresh();
                        }else{
                             poModel.setProperty('/listado', [])
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                         poModel.setProperty('/listado', [])
                        console.log("error in processing your request", err);
                    });


            }


        });
    })