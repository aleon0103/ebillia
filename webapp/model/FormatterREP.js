sap.ui.define(function() {
	"use strict";

	var FormatterREP = {

		weightState :  function (fValue) {

			try {
				fValue = parseFloat(fValue);
				if (fValue < 0) {
					return "None";
				} else if (fValue < 1000) {
					return "Success";
				} else if (fValue < 2000) {
					return "Warning";
				} else {
					return "Error";
				}
			} catch (err) {
				return "None";
			}
		},

		round2DP : function (nNumber) {
			return (Math.round(nNumber * 100) / 100).toFixed(2);
		},

		// Only display dimensions that are available
		dimensions : function (iWidth, iDepth, iHeight, sDimUnit) {
			var sDimDisplay = [iWidth, iDepth, iHeight].filter(function (element) {
				return element;
			}).join(" x ");
			if (sDimDisplay) {
				sDimDisplay += " " + sDimUnit;
			}
			return sDimDisplay;
		},

		// A formatter-helper that returns a list of
		// products that have been selected
		listProductsSelected : function (oContext) {
			var mOrder = oContext.getModel("Order").getData();
			var oModel = oContext.getModel();
			return Object.keys(mOrder.products)
				.filter(function(sKey) { return mOrder.products[sKey]; })
				.map(function(sKey) { return oModel.getProperty(sKey); });
		},

		// Returns whether a given product has been selected
		isProductSelected : function (sProductId) {
			var aProductsSelected = FormatterREP.listProductsSelected(this);
			return aProductsSelected.map(function(mProduct) {
				return mProduct.ORDEN_COMPRA;
			}).indexOf(sProductId) != -1;
		},

		// Returns whether there are any products selected at all
		isAnyProductSelected : function () {
			return FormatterREP.listProductsSelected(this).length > 0;
		},

		// Returns a list item type depending on whether we're on
		// a branch or a leaf node of the hierarchy. We determine
		// that we're on a leaf if there's a ProductId
		listItemType : function (sProductId) {
			return sProductId ? "Inactive" : "Navigation";
        },
        
        ForecastState: function (estatus) {
			if (estatus === 'LEIDO') {
				return "Success";
            }

            else	if (estatus === 'PENDIENTE' ) {
				return "None";
            }

        },

        ForecastItemState: function (estatus) {
            if (estatus === 'ACTUALIZADO') {
                return "Success";
            } else if (estatus === 'PENDIENTE') {
                return "None";
            } else {
                return "Warning"
            }
        },

        PagoState: function (pago) { 
            if (pago == 'X') {
                return "Success";
            } else if (pago == 'Y') {
                return "Warning";
            } else if (pago == '' || pago == null) {
                return "None";
            } else if (pago == 'C') {
                return "Error";
            }
        }
	};

	return FormatterREP;

}, /* bExport= */ true);
