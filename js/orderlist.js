var orderapp = angular.module("orderapp", []);


orderapp.controller("orderCtrl", function($scope, $http) {



    loadOrders($scope, $scope.goods, $http); // load orders from server. function from lib.js


    $scope.confirm = function(item) { // confirm order
        var count_err = "";
        function counter(item) {
            var qt = item.count - +item.qt;
            return qt;
        }
        item.order.forEach(function(item2, i) { // check quantity availability & checked
            if(item2.qt < 1) {
                alert("Поле 'Кількість' товару " + item2.name + " не може містити значення менше 1!");
            }
            if(counter(item2) < 0 && item2.checked) {
                count_err += ("Невистачає на складі товару:\n" + item2.name + "\n");
            }
        });
        if(count_err !== "") {
            alert(count_err);
            return;
        }
        item.order.forEach(function(item2, i) { // change datas for sending
            if(!item2.checked) {
                item.order.splice(i, 1);
                return;
            }
            item.order[i].count = counter(item2);
        });
        $http.post("/conforder", item).then(function(data) {
            if(data.data.product_err) {
                $scope.loadData();
                alert(data.data);
                return;
            }
            $scope.loadData(function(data) {
                loadOrders($scope, data, $http);
            });
        });
    };

});