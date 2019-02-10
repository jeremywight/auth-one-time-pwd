const admin = require('firebase-admin');
const twilio = require('./twilio.js');

module.exports = function(req, res) {
    if (!req.body.phone) {
        return res.status(422).send({ error: 'You must provide a valid phone number' });
    }

    const phone = String(req.body.phone).replace(/[^\d]/g, '');

    admin.auth().getUser(phone)
        .then(userRecord => {
            const code = Math.floor((Math.random() * 8999 + 1000));

            return twilio.messages.create({
                body: 'Your code is ' + code,
                to: phone,
                from: '+12083143458'
            }, (err) => {
                if (err) { return res.status(422).send( 'Phone numbner not found' + err); }
                
                admin.database().ref('users/' + phone)
                    .update({ code: code, codeValid: true }, () => {
                        res.send({ success: true });
                    });
            })
        })
        .catch((err) => {
            res.status(422).send({ error: 'User not found' + err });
        });
    }