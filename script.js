var app = angular.module("app", ["productApp", "cartApp"]);



app.controller("mainCtrl", function($scope, $http) {
    // $on-listening: from cartCtrl redirecttoProducts
    // $on-listening: from cartCtrl cart-length


    $scope.$on("cart-length", function(event, data) {
        $scope.cart = data;
    });

    // view properties
    $scope.current = {
        view: "view/products.html",
        header: "Товари",
        button: "Корзина"
    };
    $scope.showCart = function() {
        $scope.current = {
            view: "view/cart.html",
            header: "Корзина",
            button: "Товари"
        };
        $scope.showPage = $scope.showProducts;
    };
    $scope.showProducts = function() {
        $scope.current = {
            view: "view/products.html",
            header: "Товари",
            button: "Корзина"
        };
        $scope.showPage = $scope.showCart;
    };
    $scope.showPage = $scope.showCart;
    $scope.$on("redirecttoProducts", function(event, data) {
        $scope.showProducts();
    });

    $scope.newuser = {};
    $scope.addUser = function() { // add new user to database
        var user = $scope.newuser;
        delete user.password2;
        if(!user.address)
            delete user.address;
        $http.post("/adduser", user).then(function(data) {
            if(DB_error(data.data)) return;
            alert(data.data);
            if(data.data == "Ваш акаунт створений. Щоб скористатися акаунтом, увійдіть!") location.reload();
        });
    };
});



app.controller("personalizeCtrl", function($scope, $rootScope, $http) {
    // $broadcast-listening: to cartCtrl fvisible
    // $broadcast-listening: to cartCtrl fuser

    $scope.fvisible = false;
    $scope.fuser = null;
    $scope.f_getUser = function() {
        $http.get("/fgetuser").then(function(data) {
            if(data.data !== false) {
                $scope.fuser = data.data;
                $scope.fvisible = true;
                $rootScope.$broadcast("fuser", $scope.fuser);
                $rootScope.$broadcast("fvisible", $scope.fvisible);
            }
        });
    };
    $scope.f_getUser();
    $scope.logOutUser = function() {
        $http.get('/logout').then(function(data) {
            location.reload();
        });
    };

});