sap.ui.define([
    './BaseController',
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/syncStyleClass',
    'sap/m/ActionSheet',
    'sap/m/Button',
    'sap/m/library'
],
    function (BaseController, Controller, syncStyleClass, ActionSheet, Button, mobileLibrary) {
        "use strict";

        // shortcut for sap.m.PlacementType
        var PlacementType = mobileLibrary.PlacementType;

        // shortcut for sap.m.VerticalPlacementType
        var VerticalPlacementType = mobileLibrary.VerticalPlacementType;

        // shortcut for sap.m.ButtonType
        var ButtonType = mobileLibrary.ButtonType;

        return BaseController.extend("ns.EBilliaApp.controller.Main", {
            _bExpanded: true,

            onInit: function () {
                console.log('on main component view init');
            },

            onSideNavButtonPress: function () {
                var oToolPage = this.byId("main");
                var bSideExpanded = oToolPage.getSideExpanded();
                // this._setToggleButtonTooltip(bSideExpanded);
                oToolPage.setSideExpanded(!oToolPage.getSideExpanded());
            },

            _setToggleButtonTooltip: function (bSideExpanded) {
                var oToggleButton = this.byId('sideNavigationToggleButton');
                this.getBundleText(bSideExpanded ? "expandMenuButtonText" : "collpaseMenuButtonText").then(function (sTooltipText) {
                    oToggleButton.setTooltip(sTooltipText);
                });
            },


            onUserNamePress: function (oEvent) {
                var me = this;
                var oSource = oEvent.getSource();
                console.log(this.getModel("i18n"));
                this.getModel("i18n").getResourceBundle().then(function (oBundle) {
                    // close message popover
                    var oMessagePopover = this.byId("errorMessagePopover");
                    if (oMessagePopover && oMessagePopover.isOpen()) {
                        oMessagePopover.destroy();
                    }
                    var fnHandleUserMenuItemPress = function (oEvent) {
                        this.getBundleText("clickHandlerMessage", [oEvent.getSource().getText()]).then(function (sClickHandlerMessage) {
                            MessageToast.show(sClickHandlerMessage);
                        });
                    }.bind(this);

                       var fnHandleUserLogoutPress = function () {
                console.log(this)
                this.getRouter().getTargets().display("TargetLogin");
            }.bind(this);





                    var oActionSheet = new ActionSheet(this.getView().createId("userMessageActionSheet"), {
                        title: oBundle.getText("userHeaderTitle"),
                        showCancelButton: false,
                        buttons: [
                            new Button({
                                text: '{i18n>userAccountUserSettings}',
                                type: ButtonType.Transparent,
                                press: fnHandleUserMenuItemPress
                            }),
                            new Button({
                                text: "{i18n>userAccountOnlineGuide}",
                                type: ButtonType.Transparent,
                                press: fnHandleUserMenuItemPress
                            }),
                
                            new Button({
                                text: '{i18n>userAccountHelp}',
                                type: ButtonType.Transparent,
                                press: fnHandleUserMenuItemPress
                            }),
                            new Button({
                                text: '{i18n>userAccountLogout}',
                                type: ButtonType.Transparent,
                                press: fnHandleUserLogoutPress
                            })
                        ],
                        afterClose: function () {
                            oActionSheet.destroy();
                        }
                    });
                    this.getView().addDependent(oActionSheet);
                    // forward compact/cozy style into dialog
                    syncStyleClass(this.getView().getController().getOwnerComponent().getContentDensityClass(), this.getView(), oActionSheet);
                    oActionSheet.openBy(oSource);
                }.bind(this));
            },


        

        	/**
		 * Returns a promises which resolves with the resource bundle value of the given key <code>sI18nKey</code>
		 *
		 * @public
		 * @param {string} sI18nKey The key
		 * @param {string[]} [aPlaceholderValues] The values which will repalce the placeholders in the i18n value
		 * @returns {Promise<string>} The promise
		 */
            getBundleText: function (sI18nKey, aPlaceholderValues) {
                return this.getBundleTextByModel(sI18nKey, this.getModel("i18n"), aPlaceholderValues);
            }


        });
    })