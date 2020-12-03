sap.ui.define([

], function () {
    "use strict";

    var jwt;
    var user;
    var URL = 'https://arcade.flexi.com.mx:8762';

    var endpoints = {
        GET_BADGE_PRONOSTICOS:'/portal_cloud_api/logistic-services/pronostico/getNotifications/',
        GET_BADGE_COTIZACIONES:'/portal_cloud_api/logistic-services/quotation/getNotifications/',
        PROVEEDORES_FACTURAS:'/portal_cloud_api/logistic-services/Proveedores-facturas/',
        GET_PROVEEDORES_CATALOG: '/portal_cloud_api/masterdata-services/catalog/obtener-proveedores',
        GET_REPORTE_ENTREGAS_PENDIENTES: '/portal_cloud_api/logistic-services/Proveedores-facturas/ReporteSaldos/',
        GET_ORDENES_COMPRA_ASN: '/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenesDeCompra/ASN/',
        GET_POSICIONES_OC: '/portal_cloud_api/logistic-services/Proveedores-facturas/posicionesOC/',
        GET_ORDENES_CONFIRMADAS_: '/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenDeCompraConfirmada/'
    };
    return {


        Login: function (path, data, callback) {

            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                contentType: "application/json",
                method: "POST",
                url: URL+path,

            })
        },
        signOut: function () {
            user = {};
            jwt = null;
        },

        getJwt: function () {
            return jwt;
        },

        serviceList: function (){
            return endpoints;

        },

        setJwt: function (token) {
            console.log(token);
            jwt = token
        },

        getCurrentUser: function () {
            return user;
        },

        Get: function (path, callback) {
            console.log(path);
            return $.ajax({
                method: "GET",
                headers: {
                    'Authorization': jwt
                },
                url: URL+path,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            })
        },

        Post: function (url, data, callback) {
            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                contentType: "application/json",
                method: "POST",
                url: url,
            })


        },

        Update: function () {



        },
        Delete: function () {



        },

    };

});