var productapp = angular.module("productApp", []);



productapp.controller("productCtrl", function($scope, $rootScope, $http) {
    // $broadcast-listening: to cartCtrl add-order
    // $on-listening: from cartCtrl reload-data
    // $broadcast-listening: to cartCtrl get-goods

    $scope.goodsonPage = []; // goods in active page
    $scope.objPage = null; // object of properties of page
    $scope.pageNumber = null; // current page for using after editing

    $scope.setPage = function(pageNumber, top) { // set pages for pagination
        pageNumber = pageNumber || $scope.pageNumber || 1;
        $scope.objPage = getPage($scope.goodsinCategory.length, pageNumber); // function getPage() from lib.js
        if(pageNumber < 1 || pageNumber > $scope.objPage.totalPage)
            return;
        $scope.pageNumber = pageNumber;
        $scope.goodsonPage = $scope.goodsinCategory.slice($scope.objPage.startIndex, $scope.objPage.endIndex + 1);
        if(top) scrollTop("main");
    };
    $scope.checkItem = function(data, item) { // check item quantity
        for(var i = 0; i < data.length; i++) {
            if(data[i].name == item.name) {
                if(data.count < (item.qt || item.count)) return false;
                else return true;
            }
        }
        return false;
    };

    $scope._category = new Category($scope, $http, false, $scope.setPage); // constructor from lib.js
    $scope._direction = new Direction($scope, $scope._category.setCategory); // constructor from lib.js

    
    loadData($scope, $http, false); // from lib.js
    

    $scope.buy = function(item) { // send order to cart
        function checkForBuy(goods, item) {
            if(!$scope.checkItem(goods, item)) {
                alert("Вибачте, даний товар вже проданий!");
                return;
            }
            $rootScope.$broadcast("add-order", item);
        }
        loadData($scope, $http, false, function(data) {
            checkForBuy(data, item);
        }); // from lib.js
    };
    $scope.$on("reload-data", function(event, data) {
        loadData($scope, $http, false, function(data) {
            $rootScope.$broadcast("get-goods", data);
        }); // from lib.js
    });
});