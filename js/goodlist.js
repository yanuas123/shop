var goodapp = angular.module("goodapp", []);



goodapp.controller("goodCtrl", function($scope, $rootScope, $http) {
    // $on-listening: from mainCtrl add-good
    // $on-listening: from mainCtrl new-category
    // $emit-listening: to mainCtrl create-category

    $scope.goodsonPage = []; // goods in active page
    $scope.objPage = null; // object of properties of page
    $scope.pageNumber = null; // current page for using after editing

    $scope.setPage = function(pageNumber, top) { // set pages for pagination
        pageNumber = pageNumber || $scope.pageNumber || 1;
        $scope.objPage = getPage($scope.goodsinCategory.length, pageNumber, 20); // function getPage() from lib.js
        if(pageNumber < 1 || pageNumber > $scope.objPage.totalPage)
            return;
        $scope.pageNumber = pageNumber;
        $scope.goodsonPage = $scope.goodsinCategory.slice($scope.objPage.startIndex, $scope.objPage.endIndex + 1);
        if(top) scrollTop("main");
    };
    $scope.setDirection = function() {
        $scope.goods.sort(function(a, b) { // set direction for unicode consistency in goods
            if(a.name > b.name) return 1;
            else return -1;
        });
        $scope._category.setCategory();
    };

    $scope._category = new Category($scope, $http, true, $scope.setPage); // constructor from lib.js
    $scope.$on("new-category", function(event, data) {
        $scope._category.addCategories(function() {
            $scope.$emit("create-category", $scope.category);
        }); // constructor from lib.js
    });


    loadData($scope, $http, true, function() {
        $scope.$emit("create-category", $scope.category);
    }); // from lib.js
    $scope.loadData = loadData.bind(null, $scope, $http, true);
    $scope.$on("add-good", function(event, item) { // run loadData after adding new product
        $scope.loadData();
    });




// goods items functions
    $scope.newCategorGood = []; // variable for save new changed category
    var oldItem_array = [];
    var active_index = null;
    var active_item = null;


    // function for click out active row
    $scope.leaveRow = function(item, index) {
        if(active_index !== null && active_index !== index) {
            $scope.returnData(active_item, active_index);
            $scope.returnQty(active_item, active_index);
        }
        var id = "it" + index;
        active_index = index;
        active_item = item;
        document.body.onclick = function(event) {
            var target = event.target;
            while(target.tagName != "BODY") {
                if(target.id == id)
                    return;
                target = target.parentElement;
            }
            $scope.returnData(item, index);
            $scope.returnQty(item, index);
            $scope.$apply();
            document.body.onclick = null;
            active_index = null;
        };
    };



    // properties for editing item-row
    $scope.editData = function(item, index) {
        if(oldItem_array[index] === undefined) oldItem_array[index] = {};
        for(var key in item) {
            if(key == "count" || key == "disableQty" || key == "titleButtonQty") continue;
            oldItem_array[index][key] = item[key];
        }
        item.disableInputs = false;
        item.titleButton = "Save";
        item.titleButtonTwo = "Return";
        $scope.newCategorGood[index] = item.category;
        $scope.leaveRow(item, index);
        if(!item.disableQty) $scope.returnQty(item, index);
    };

    $scope.saveData = function(item, index) {
        item.price = +item.price;
        var data = {};
        var changed = false;
        if(item.name === "") {
            alert("Заповніть поле Title!");
            return;
        }
        if(item.img === "") {
            alert("Заповніть поле Image`s url!");
            return;
        }
        if($scope.newCategorGood[index] === "") {
            alert("Заповніть поле Category!");
            return;
        }
        if(item.price === "") {
            alert("Заповніть поле Price!");
            return;
        }
        if(item.price <= 0) {
            alert("Поле не може містити значення нуль, або менше!");
            return;
        }
        if(item.name !== oldItem_array[index].name) {
            data.name = item.name;
            changed = true;
        }
        if(item.img !== oldItem_array[index].img) {
            data.img = item.img;
            changed = true;
        }
        if($scope.newCategorGood[index] !== oldItem_array[index].category) {
            data.category = $scope.newCategorGood[index];
            changed = true;
        }
        if(item.price !== oldItem_array[index].price) {
            data.price = item.price;
            changed = true;
        }
        if(!changed) {
            alert("Властивості позиції не змінено!\nРедагуйте властивості, або натисніть 'Return'!");
            return;
        }
        var obj = {
            _id: item._id,
            data: data
        };
        $http.post("/editgood", obj).then(function(data) {
            if(DB_error(data.data)) return;
            $scope.loadData();
        });
    };

    $scope.returnData = function(item, index) {
        if(item.disableInputs) return;
        for(var key in oldItem_array[index]) {
            if(oldItem_array[index][key] == "count") continue;
            item[key] = oldItem_array[index][key];
        }
    };



    // properties for editing item:count-value
    $scope.editQty = function(item, index) {
        if(oldItem_array[index] === undefined) oldItem_array[index] = {};
        oldItem_array[index].count = item.count;
        item.disableQty = false;
        item.titleButtonQty = "Save";
        $scope.leaveRow(item, index);
        if(!item.disableInputs) $scope.returnData(item, index);
    };

    $scope.saveQty = function(item, index) {
        if(item.count === "") {
            alert("Заповніть поле Qty!");
            return;
        }
        if(+item.count < 0) {
            alert("Поле Qty не може містити значення менше нуля!");
            return;
        }
        item.count = +item.count;
        if(item.count === oldItem_array[index].count) {
            alert("Поле Qty не змінено!\nРедагуйте поле Qty, або натисніть 'Return'!");
            return;
        }
        var obj = {
            _id: item._id,
            count: item.count
        };
        $http.post("/editgood", obj).then(function(data) {
            if(DB_error(data.data)) return;
            $scope.loadData();
        });
    };

    $scope.returnQty = function(item, index) {
        if(item.disableQty) return;
        item.count = oldItem_array[index].count;
        item.disableQty = true;
        item.titleButtonQty = "Change qty";
    };



    $scope.delProduct = function(item) {
        var obj = {
            _id: item._id
        };
        $http.post("/delgood", obj).then(function(data) {
            if(DB_error(data.data)) return;
            $scope.loadData();
        });
    };


});