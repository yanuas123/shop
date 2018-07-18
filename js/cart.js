var cartapp = angular.module("cartApp", ["ngCookies"]);


cartapp.controller("cartCtrl", function($scope, $rootScope, $http, $cookies) {
    // $on-listening: from personalizeCtrl fvisible
    // $on-listening: from personalizeCtrl fuser
    // $emit-listening: to mainCtrl redirecttoProducts
    // $emit-listening: to mainCtrl cart-length
    // $on-listening: from pruductCtrl add-order
    // $broadcast-listening: to productCtrl reload-data
    // $on-listening: from productCtrl get-goods

    $scope.$on("fvisible", function(event, data) {
        $scope.fvisible = data;
    });
    $scope.client = {}; // user datas
    $scope.$on("fuser", function(event, data) {
        $scope.fuser = data;
        $scope.client.name = $scope.fuser.name || null;
        $scope.client.email = $scope.fuser.email || null;
        $scope.client.address = $scope.fuser.address || null;
        $scope.client.user_id = $scope.fuser._id;
    });

    $scope.cart = []; // list of objects of orders
    $scope.$emit("cart-length", $scope.cart.length);

    $scope.cookies = $cookies.getObject("orders"); // get datas of orders from cookies
    if($scope.cookies)
        $scope.cart = $scope.cookies;
    $scope.$emit("cart-length", $scope.cart.length);
    function getDateUTC() {
        var date = (new Date);
        date.setDate(date.getDate() + 2);
        date = date.toUTCString();
        return date;
    }



    $scope.$on("add-order", function(event, item) { // adding good to cart
        var found = $scope.cart.indexOf(item);
        if(found == -1) {
            item.qt = 1;
            item.sum = item.price;
            $scope.cart.push(item);
            $scope.$emit("cart-length", $scope.cart.length);
            $cookies.putObject("orders", $scope.cart, {expires: getDateUTC()});
        } else {
            alert("Даний товар вже в корзині");
            return;
        }
        $scope.showPage();
    });


    $scope.changeQuantity = function(item, direction) { // change order`s quantity of good
        if(direction) {
            if((item.qt + 1) > item.count) {
                alert("Вибачте!\n Вказана кількість перевищує кількість товару\n наявного на складі.");
                return;
            } else
                item.qt++;
        } else {
            if((item.qt - 1) < 1)
                return;
            else
                item.qt--;
        }
        item.sum = item.qt * item.price;
        $cookies.putObject("orders", $scope.cart, {expires: getDateUTC()});
    };

    $scope.delGood = function(item) { // deleting of good
        var found = $scope.cart.indexOf(item);
        $scope.cart.splice(found, 1);
        $cookies.putObject("orders", $scope.cart, {expires: getDateUTC()});
        $scope.$emit("cart-length", $scope.cart.length);
    };

    $scope.showModal = function() { // show modal-form for input client datas
        if($scope.fvisible) {
            if($scope.fuser.name && $scope.fuser.email && $scope.fuser.address) {
                $scope.sendOrder();
            } else {
                var name = document.getElementById("cartModalName");
                var email = document.getElementById("cartModalEmail");
                name.disabled = true;
                email.disabled = true;
                $("#modalWindow").modal("show");
            }
        } else {
            $("#modalWindow").modal("show");
        }
    };

    var sender = null;
    $scope.$on("get-goods", function(event, data) { // getting refresh datas of goods
        sender(data);
    });
    $scope.sendOrder = function() { // sending order to the server
        if(!$scope.client.name) {
            alert("Заповніть, будь-ласка, поле 'First and Last name'!");
            return;
        }
        if(!$scope.client.email) {
            alert("Заповніть, будь-ласка, поле 'Email'!");
            return;
        }
        if(!$scope.client.address) {
            alert("Заповніть, будь-ласка, поле 'Address'!");
            return;
        }
        for(var i = 0; i < $scope.cart.length; i++) {
            $scope.cart[i].idprod = $scope.cart[i]._id; // set idprod value for save only id of good in database
        }
        $scope.client.order = $scope.cart; // adding orders to client object
        function hideModal() {
            $("#modalWindow").modal("hide");
            $("body").removeClass("modal-open");
            $(".modal-backdrop").remove();
            $scope.client.name = "";
            $scope.client.email = "";
            $scope.client.address = "";
        }

        function send(obj) {
            $rootScope.$broadcast("reload-data", true);
            sender = function(data) {
                var nochecked = false;
                var checklist = obj.order;
                var checkedcart = [];
                for(var j = 0; j < checklist.length; j++) {
                    checklist[j].count = false;
                }
                data.forEach(function(item) { // check items.count
                    for(var i = 0; i < obj.order.length; i++) {
                        if(item.name == obj.order[i].name) {
                            var x = obj.order[i].qt - item.count;
                            checklist[i].count = true;
                            if(x > 0) {
                                nochecked = true;
                                checklist[i].count = x;
                            }
                        }
                    }
                });
                var msg = "Вибачте, нижче вказані товари вже продані!\nВи можете надіслати замовлення без них, або вибрати інші товари.:\n";
                for(var k = 0; k < checklist.length; k++) { // change datas depending on checking
                    if(!checklist[k].count) {
                        nochecked = true;
                        msg = msg + "\n" + checklist[k].name + " - продано";
                    } else if(checklist[k].count === true) {
                        checkedcart.push(obj.order[k]);
                    } else {
                        msg = msg + "\n" + checklist[k].name + " - невистачає " + checklist[k].count + " шт.";
                        obj.order[k].qt = obj.order[k].qt - checklist[k].count;
                        checkedcart.push(obj.order[k]);
                    }
                }
                if(nochecked) {
                    alert(msg);
                    $scope.cart = checkedcart;
                    $cookies.putObject("orders", $scope.cart, {expires: getDateUTC()});
                    $scope.$emit("cart-length", $scope.cart.length);
                    return;
                }
                $http.post("/neworder", obj).then(function(data) { // sending order to the server
                    if(DB_error(data.data)) return;
                    alert(data.data);
                    hideModal();
                    $scope.cart = [];
                    $cookies.remove("orders");
                    $scope.$emit("cart-length", $scope.cart.length);
                    $scope.client.order = undefined;
                    $scope.$emit("redirecttoProducts", "true");
                });
            };
        }

        if($scope.fvisible) {
            var obj_order = {
                user_id: $scope.fuser._id,
                order: $scope.cart
            };
            var user = {};
            if(!$scope.fuser.name)
                user.name = $scope.client.name;
            if(!$scope.fuser.email)
                user.email = $scope.client.email;
            if(!$scope.fuser.address)
                user.address = $scope.client.address;
            var obj = {
                _id: $scope.fuser._id,
                data: user
            };
            if(!Object.keys(user).length) {
                send(obj_order);
                return;
            }

            $http.post("/updateuser", obj).then(function(data) { // update missing datas of user`s accaunt
                if(DB_error(data.data)) return;
                send(obj_order);
            });
        } else
            send($scope.client);
    };

});