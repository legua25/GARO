// "router.js"
(function () {
	'use strict';

	const { 'createTransport': Transport } = require ('nodemailer');
	const body_parse = require ('koa-body');
	const yaml = require ('js-yaml');
	const fs = require ('fs');

	// Project setup
	try {

		const project = {
			'language': 'es-mx', 
			'title': 'GARO Medios Publicitarios',
			'description': 'Somos una agencia con 20 años de experiencia especializada en la renta, producción y venta de anuncios espectaculares establecida en la ciudad de Querétaro.', 
			'social': {
				'title': 'GARO Medios Publicitarios', 
				'image': 'https://garoqro.com/static/images/social.png', 
				'url': 'https://garoqro.com/',
				'description': 'Somos una agencia con 20 años de experiencia especializada en la renta, producción y venta de anuncios espectaculares establecida en la ciudad de Querétaro.', 
				'admin': false
			},
			'ads': yaml.safeLoad(fs.readFileSync('/srv/ads.yml', 'utf-8'))['ads']
		};

		// Mailing setup
		const MailTransport = Transport({
			'host': 'mail.privateemail.com',
			'port': 465,
			'secure': true,
			'pool': true,
			'auth': { 'user': 'contacto@garoqro.com', 'pass': 'Ext2001' }
		});
		function compose(data) {

			// Create the email
			return {
				'from': '"Webmaster" <contacto@garoqro.com>',
				'to': [ 'contacto@garoqro.com' ],
				'subject': `GARO - Nuevo mensaje de "${data.email_address}"`,
				'text': `Nuevo mensaje de contacto
				${data.name} ha enviado un mensaje:
				
				${data.content}
				
				Correo electrónico: ${data.email_address}
				`,
				'html': `<div style="width: 100%">
					<p style="text-align: center; width: 100%">
						<img src="https://garoqro.com/static/images/Garo%20logotipo.svg" alt="Logotipo GARO" style="width: 128px" />
					</p>
					<h2>Nuevo mensaje de contacto</h2>
					<p style="width: 100%"><b>${data.name}</b> ha enviado un mensaje:</p>
					<p style="width: 100%"><blockquote style="width: 100%; padding-left: 5px; border-left: 4px solid #CDCDCD; margin-left: 15px">${data.content}</blockquote></p>
					<div style="width: 100%">
						<div style="width: 50%"><b>Correo electr&oacute;nico:</b> ${data.email_address}</div>
					</div>
				</div>`
			};
		}

		module.exports = function (router, render) {
			
			router.get('/', render('index', Object.assign({ 'ttl': 604800 }, project)));
			router.post('/contact/', body_parse(), async function (ctx) {

				// Prepare the JSON response from here
				ctx.response.type = 'application/json';
				ctx.response.charset = 'UTF-8';

				try {

					// Compose the email, then send
					let data = compose(ctx.request['body']);
					let result = await MailTransport.sendMail(data);

					ctx.body = JSON.stringify({ 'status': 201 });
					ctx.response.status = 201;
				}
				catch (e) {

					ctx.body = JSON.stringify({ 'status': 409, 'cause': e.toString() });
					ctx.response.status = 409;
				}
			});
			
			return router;
		};
	}
	catch (e) { console.log(e); process.exit(0); }
	
})();
