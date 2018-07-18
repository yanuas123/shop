var transport = {
    host: 'smtp.gmail.com',
    tls: {rejectUnauthorized: false},
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: 'januariyy@gmail.com',
        pass: 'xxxxxxxxxxxxxxxxxxxx'
    }
};
module.exports = transport;