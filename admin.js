var app = angular.module("app", ["orderapp", "goodapp"]);


app.directive("getUrl", function() { // get image-url from hidden iframe
    return function(scope, element, attr) {
        element.on("load", function(e) {
            var path = e.target.contentDocument.body.innerHTML;
            scope.$apply(function() {
                scope.newgood.img = path;
            });
        });
    };
});



app.controller("mainCtrl", function($scope, $rootScope, $http) {
    // $broadcast-listening: to goodCtrl add-good
    // $broadcast-listening: to goodCtrl new-category
    // $on-listening: from goodCtrl create-category
    
    $scope.$on("create-category", function(event, data) {
        $scope.category = data;
    });


    // view properties
    $scope.current = {
        view: "view/goodlist.html",
        button: "Замовлення",
        buttons: true
    };
    $scope.showOrder = function() {
        $scope.current = {
            view: "view/orderlist.html",
            button: "Товари",
            buttons: false
        };
        $scope.showPage = $scope.showProducts;
    };
    $scope.showProducts = function() {
        $scope.current = {
            view: "view/goodlist.html",
            button: "Замовлення",
            buttons: true
        };
        $scope.showPage = $scope.showOrder;
    };
    $scope.showPage = $scope.showOrder;



    // modal new good settings
    $scope.file_field = "Вибрати файл";
    window.onload = function() {
        var input_file = document.getElementById("upl"); // input for downloading image-file
        input_file.onchange = function() {
            if(input_file.files[0].name) {
                $scope.file_field = input_file.files[0].name;
                $scope.$apply();
            }
        };
    };
    $scope.newgood = {};
    $scope.newProduct = function() { // save new good to database
        var obj = $scope.newgood;
        $http.post("/addgoods", obj).then(function(data) {
            if(DB_error(data.data)) return;
            alert(data.data);
            $scope.newgood = {};
            $rootScope.$broadcast("add-good", true);
        });
    };



    // save new category to database
    $scope.newCategory = function(newcategory) {
        var obj = {
            title: newcategory
        };
        $http.post("/addcategory", obj).then(function(data) {
            if(DB_error(data.data)) return;
            alert(data.data);
            $rootScope.$broadcast("new-category", true);
        });
    };



    // logout function
    $scope.logoutadmin = function() {
        $.get("/logout", function(data) {
            location.reload();
        });
    };

});