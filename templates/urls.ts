// "urls.ts"
import { createTransport } from 'nodemailer';
import { template } from './templates';
import * as Router from 'koa-router';
import parse = require ('koa-body');
import * as yaml from 'js-yaml';
import { Context } from 'koa';
import * as fs from 'fs';


const Transport = createTransport({
	'host': 'mail.privateemail.com',
    'port': 465,
    'secure': true,
    'pool': true,
    'auth': {
        'user': 'admin@garoqro.com',
        'pass': '6h52w4a9g23a'
    }
} as any);

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

export default function urls(router: Router): Router {

	router.get('/', template('site/index', project, 1.26e6));
	router.post('/contact/', parse(), async function (ctx: Context) {

		let body = ctx.request['body'] as any;
		let data = {
			'from': '"Webmaster" <admin@garoqro.com>',
			'to': [ 'dgaona@garoqro.com' ],
			'subject': `GARO - Nuevo mensaje de "${body.email_address}"`,
			'text': `Nuevo mensaje de contacto
			${body.name} ha enviado un mensaje:
			
			${body.content}
			
			Teléfono: ${body.phone}
			Correo electrónico: ${body.email_address}
			`,
			'html': `<div style="width: 100%">
				<p style="text-align: center; width: 100%">
					<img src="https://garoqro.com/static/images/logo.svg" alt="Logotipo Asora" style="width: 128px" />
				</p>
				<h2>Nuevo mensaje de contacto</h2>
				<p style="width: 100%"><b>${body.name}</b> ha enviado un mensaje:</p>
				<p style="width: 100%"><blockquote style="width: 100%; padding-left: 5px; border-left: 4px solid #CDCDCD; margin-left: 15px">${body.content}</blockquote></p>
				<div style="width: 100%">
					<div style="width: 50%"><b>Tel&eacute;fono:</b> ${body.phone}</div>
					<div style="width: 50%"><b>Correo electr&oacute;nico:</b> ${body.email_address}</div>
				</div>
			</div>`
		};

		// Parse content and send mail to "dgaona@garoqro.com", return if this succeeded
		ctx.response.type = 'application/json';
		ctx.response.charset = 'UTF-8';

		try {

			let result = await Transport.sendMail(data);

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
