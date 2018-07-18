function DB_error(d) {
    if(d == "database error") {
        alert("Server error!\nCould not connect to database.");
        return true;
    }
}

//------------------------------------------------------------------------------

var Category = function(parent, http, server, callback) { // set category - arg - scope, http-service, is server:bool, callback
    // create on parent properties:
    // category - list of category
    // categorySelected - selected category
    // goodsinCategory - list objects of goods matching to selected category
    // setCategory() - for sorting goods - arg - [object.category], number of active page
    // changeCategory() - for change category with setting pageNumber = 1
    // addCategories() - load categories from base - arg - callback
    // requires:
    // parent.goods
    // parent.pageNumber


    var category = ["Всі категорії"]; // list of category
    parent.category = category; // list of category
    parent.categorySelected = category[0]; // selected category
    parent.goodsinCategory = []; //list objects of goods matching to selected category

    this.setCategory = function(callback1) { // change $scope.goodsinCategory
        var items = parent.goods;
        function setCtgr() {
            var ctgr_tmp = [];
            for(var i = 0; i < items.length; i++) {
                if((ctgr_tmp.indexOf(items[i].category) < 0) && (category.indexOf(items[i].category) >= 0)) {
                    ctgr_tmp.push(items[i].category);
                }
            }
            category = ["Всі категорії"].concat(ctgr_tmp);
            parent.category = category;
        }
        if(!server) setCtgr();
        if(parent.categorySelected == "Всі категорії") {
            parent.goodsinCategory = items;
            if(callback1) callback1();
            if(callback) callback();
        } else {
            parent.goodsinCategory = items.filter(function(item) {
                return item.category == parent.categorySelected;
            });
            if(callback1) callback1();
            if(callback) callback();
        }
    };
    this.changeCategory = function(callback1) {
        parent.pageNumber = 1;
        this.setCategory();
        if(callback1) callback1();
    };
    this.addCategories = function(callback1) {
        var categoryBase = null;
        http.get("/loadcategory").then(function(data) {
            if(DB_error(data.data)) return;
            categoryBase = data.data;
            category = ["Всі категорії"];
            for(var i = 0; i < categoryBase.length; i++) {
                category.push(categoryBase[i].title);
            }
            parent.category = category;
            if(callback1) callback1(data.data);
        });
    };
    this.addCategories();
};

//------------------------------------------------------------------------------

var Direction = function(parent, callback) { // set direction for price - arg - scope, callback
    // create on parent properties:
    // direction - direction properties
    // directionSelected - default direction
    // setDirection() - sorting goods
    // changeDirection() - change direction
    // chang:
    // parent.goods
    // parent.pageNumber
    // requires:
    // parent.goods
    // parent.pageNumber


    var direction = [// direction properties
        {
            title: "По спаданню",
            val: true
        },
        {
            title: "По зростанню",
            val: false
        }
    ];
    parent.direction = direction;
    parent.directionSelected = direction[1]; // default direction
    this.setDirection = function(callback1) { // sort goods depending on directionSelected
        if(parent.directionSelected.val) {
            parent.goods.sort(function(a, b) {
                if(a.price < b.price)
                    return 1;
                else
                    return -1;
            });
        } else {
            parent.goods.sort(function(a, b) {
                if(a.price > b.price)
                    return 1;
                else
                    return -1;
            });
        }
        if(callback1) callback1();
        if(callback) callback();
    };
    this.changeDirection = function(callback1) { // change direction
        parent.pageNumber = 1;
        this.setDirection();
        if(callback1) callback1();
    };
    parent.changeDirection = this.changeDirection;
    parent.setDirection = this.setDirection;
};

//------------------------------------------------------------------------------

function loadData(parent, http, server, callback) { // loading list of objects of goods & set parent.goods
    // - args - scope,http-service,is server:bool,callback
    // create on parent properties:
    // goods - array of objects of goods
    // requires:
    // parent.setDirection()

    function afterFc(data) {
        if(DB_error(data.data)) return;
        parent.goods = data.data;
        parent.setDirection();
        if(callback) callback(data.data);
    }
    if(server) {
        http.get("/loaddataserver").then(function(data) {
            afterFc(data);
        });
    } else {
        http.get("/loaddata").then(function(data) {
            afterFc(data);
        });
    }
}

//------------------------------------------------------------------------------

function getPage(totalItems, currentPage, pageItemSize) { // constructing pagination object
    var totalItems = totalItems;
    var startIndex = null;
    var endIndex = null;
    var pageItemSize = pageItemSize || 12;
    var pages = [];
    var totalPage = Math.ceil(totalItems / pageItemSize);
    var startPage = null;
    var endPage = null;
    var currentPage = currentPage || 1;



    if(totalPage < 10) {
        startPage = 1;
        endPage = totalPage;
    } else {
        if(currentPage <= 6) {
            startPage = 1;
            endPage = 10;
        } else {
            if(currentPage + 4 > totalPage) {
                startPage = totalPage - 9;
                endPage = totalPage;
            } else {
                startPage = currentPage - 5;
                endPage = currentPage + 4;
            }
        }
    }
    for(var j = startPage; j <= endPage; j++)
        pages.push(j);
    startIndex = (currentPage - 1) * pageItemSize;
    endIndex = Math.min(startIndex + pageItemSize - 1, totalItems - 1);

    return {
        totalItems: totalItems,
        startIndex: startIndex,
        endIndex: endIndex,
        pageItemSize: pageItemSize,
        pages: pages,
        totalPage: totalPage,
        startPage: startPage,
        endPage: endPage,
        currentPage: currentPage
    };
}

//------------------------------------------------------------------------------

// loading order`s list
function loadOrders(scope, goods, http) {
    // - arg - scope,[object-goods],http-service
    // create on scope properties:
    // orders

    var orders = null;
    http.get("/loadorders").then(function(data) {
        if(DB_error(data.data)) return;
        orders = data.data;
        orders.forEach(function(item, i) {
            if(item.user_id) {
                var obj = {
                    id: item.user_id
                };
                http.post("/getoneuser", obj).then(function(data) { // get user info from server
                    if(DB_error(data.data)) return;
                    if(data.data.length === 0) {
                        alert("ERROR!\nUser no found. Please contact to database administrator.");
                        return;
                    }
                    var dat = data.data[0];
                    orders[i].name = dat.name;
                    orders[i].email = dat.email;
                    orders[i].address = dat.address;
                });
            }
            for(var j = 0; j < orders[i].order.length; j++) { // set info of good
                var id = orders[i].order[j].idprod;
                for(var k = 0; k < goods.length; k++) {
                    if(goods[k]._id == id) {
                        orders[i].order[j].count = goods[k].count;
                    }
                }
            }
        });
        scope.orders = orders;
    });
}

//------------------------------------------------------------------------------

// scrolling element to top of window
function scrollTop(id) {
    // - arg - string-id
    function getTop(elem) {
        var box = elem.getBoundingClientRect();
        var body = document.body;
        var docEl = document.documentElement;
        var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
        var clientTop = docEl.clientTop || body.clientTop || 0;
        var top = box.top + scrollTop - clientTop;
        return top;
    }
    var elem = document.getElementById(id);
    var top = getTop(elem);
    document.body.scrollTop = top;
    document.documentElement.scrollTop = top;
}

//------------------------------------------------------------------------------