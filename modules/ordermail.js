var ordermail = function(datas, args) {
    var nodemailer = require("nodemailer"); // connect module for sending emails
    var transport = require("./nodemailer"); // module properties
    var transporter = nodemailer.createTransport(transport);



    function prepareProperties() {
        properties.subject = datas.subject || properties.subject;
        properties.seller = datas.seller || properties.seller;
        properties.seller_email = datas.seller_email || properties.seller_email;
        properties.email = datas.email;
        properties.address = datas.address;
    }
    var text = "";
    var html = "";
    function prepareContent() {
        var sum = 0;

        text += ("Замовлення відправлено за адресою: " + properties.address + ".");
        html += ("<h2>" + properties.seller + "</h2>");
        html += ("<h3>Замовлення відправлено</h3>");
        html += ("<p>Товар, який Ви замовляли у нашому інтернет-магазині <strong>" + properties.seller + "</strong>, відправлено за адресою:<br>" + properties.address + "</p>");

        for(var i = 0; i < datas.order.length; i++) {
            var item = (datas.order[i].category + " " + datas.order[i].name +
                    "    " + datas.order[i].price + " грн.     " + datas.order[i].qt + " шт.");

            text += item;
            html += ("<p>" + item + "</p>");
            sum += (datas.order[i].price * datas.order[i].qt);
        }

        html += ("<p>Сума замовлення: " + sum + " грн.</p>");
    }
    var properties = {// properties for send in mail
        subject: "Замовлення AngularShop",
        seller: "AngularShop",
        seller_email: "'AngularShop' <januariyy@gmail.com>",
        email: null,
        address: null
    };




    prepareProperties();
    prepareContent();
    var mailOptions = {
        from: properties.seller_email, // sender address
        to: properties.email, // list of receivers
        subject: properties.subject, // Subject line
        text: text, // plain text body
        html: html // html body
    };

    transporter.sendMail(mailOptions, function(err, info) {
        if(err) {
            console.log(err);
            args.res.send("mail sending error");
            return;
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        args.res.send((args.info || "Succed!"));
    });
};
module.exports = ordermail;
