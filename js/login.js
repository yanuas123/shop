$("#login-form").submit(function() {
    var username = $("#username").val();
    var password = $("#password").val();
    if(!username || !password) {
        alert("Type login and password!");
        return false;
    }
    var obj = {
        "username": username,
        "password": password
    };
    $.post("/adminvalid", obj, function(data) {
        if(data !== true) {
            alert(data);
            return false;
        }
    });
    return true;
});