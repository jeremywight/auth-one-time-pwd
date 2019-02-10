const admin = require('firebase-admin');


module.exports = function(req, res) {
    if (!req.body.phone || !req.body.code) {
        return res.status(422).send({ error: 'Phone and code must be provided'});
    }

    // Sanitize the phone and code input before passing
    const phone = String(req.body.phone).replace(/[^\d]/g, '');
    const code = parseInt(req.body.code);

    // Invalidate that users code when it's been used
    admin.auth().getUser(phone)
    .then(() => {
        const ref = admin.database().ref('users/' + phone);
        return ref.on('value', snapshot => {
            ref.off();
            const user = snapshot.val();

            if (user.code !== code || !user.codeValid) {
                return res.status(422).send({ error: 'Code not valid' });
            }

            ref.update({ codeValid: false });
            // eslint-disable-next-line promise/catch-or-return
            admin.auth().createCustomToken(phone)
                .then(token => res.send({ token: token }))
        });
    })
    .catch((err) => res.status(422).send({ error: err }))

}