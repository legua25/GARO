# -*- coding: utf-8 -*-
from __future__ import annotations
from django.core.management.commands.runserver import Command as BaseCommand
from django.core.servers.basehttp import get_internal_wsgi_application
from argparse import ArgumentParser, Namespace, REMAINDER, SUPPRESS
from gunicorn.config import get_default_config_file
from gunicorn.app.wsgiapp import WSGIApplication
from django.core.management import CommandError
from django.test import RequestFactory
from typing import Sequence, Optional
from multiprocessing import cpu_count
from django.conf import settings
from datetime import datetime
import sys, os, errno


class WarmupError(Exception): pass
class Application(WSGIApplication):

    def __init__(self, args: Sequence[str], usage: str = None, prog: str = None):
        wsgi_app = ':'.join(settings.WSGI_APPLICATION.rsplit('.', 1))
        self._args = [ wsgi_app, *args ]

        super().__init__(usage = usage, prog = prog)

    def load_config(self):
        parser = self.cfg.parser()
        args = parser.parse_args(self._args)
        cfg = self.init(parser, args, args.args)
        self.chdir()

        if cfg:
            for k, v in cfg.items(): self.cfg.set(k.lower(), v)

        env_args = parser.parse_args(self.cfg.get_cmd_args_from_env())

        if args.config: self.load_config_from_file(args.config)
        elif env_args.config: self.load_config_from_file(env_args.config)
        else:
            default_config = get_default_config_file()
            if default_config is not None:
                self.load_config_from_file(default_config)

        for k, v in vars(env_args).items():
            if v is None: continue
            if k == "args": continue
            self.cfg.set(k.lower(), v)

        for k, v in vars(args).items():
            if v is None: continue
            if k == "args": continue
            self.cfg.set(k.lower(), v)
        self.chdir()

def wsgi_healthcheck(app, endpoint: str, status: int = 200):
    try:
        host = settings.ALLOWED_HOSTS[0]
        if host.startswith('.'): host = f'example{host}'
        elif host == '*': host = 'testserver'

        headers = { 'HTTP_HOST': host }
    except (AttributeError, IndexError): headers = {}

    warmup = app.get_response(RequestFactory().get(endpoint, **headers))
    if warmup.status_code != status:
        raise WarmupError(f"WSGI warmup using endpoint {endpoint} responded with {warmup.status_code}.")


class Command(BaseCommand):
    help = "Start application within a Gunicorn server"
    requires_system_checks = False

    default_addr = '0.0.0.0'
    default_addr_ipv6 = '::/0'

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument('addrport',
            nargs = '?',
            default = '8000',
            help = 'Optional port number, or ipaddr:port'
        )
        parser.add_argument('--ipv6', '-6',
            action = 'store_true',
            dest = 'use_ipv6',
            help = 'Tells Django to use an IPv6 address.',
        )
        parser.add_argument('--nothreading',
            action = 'store_false',
            dest = 'use_threading',
            help = 'Tells Django to NOT use threading.',
        )
        parser.add_argument('--noreload',
            action = 'store_false',
            dest = 'use_reloader',
            help = 'Tells Django to NOT use the auto-reloader.',
        )
        parser.add_argument('-w', '--warmup',
            action = 'store_true',
            default = True,
            help = "If enabled, application will be imported before starting server. This allows for zero-downtime deployments and faster load times."
        )
        parser.add_argument('--workers',
            action = 'store',
            default = cpu_count() * 2 + 1,
            type = int,
            help = "Amount of worker instances to crete when starting server. By default, it uses two times the amount of cores available plus one."
        )
        parser.add_argument('--health',
            action = 'store',
            help = "While warming up deployment, allows running a health check on the application before mounting. "
                   "If this health check fails with a status code other than 200, the application exits immediately "
                   "with an appropriate signal."
        )
        parser.add_argument('gunicorn_args',
            action = 'store',
            nargs = REMAINDER,
            help = SUPPRESS
        )
    def run(self, warmup: bool, health: Optional[str], gunicorn_args: Sequence[str], use_reloader: bool, workers: int, **options):
        # 'shutdown_message' is a stealth option.
        shutdown_message = options.get('shutdown_message', '')
        quit_command = 'CTRL-BREAK' if sys.platform == 'win32' else 'CONTROL-C'

        self.stdout.write("Performing system checks...\n\n")
        self.check(display_num_errors = True)
        self.check_migrations()

        bind_addr = '[%s]' % self.addr if self._raw_ipv6 else self.addr
        bind_port = self.port
        now = datetime.now().strftime('%B %d, %Y - %X')
        self.stdout.write(now)
        self.stdout.write(
            f"Django version {self.get_version()}, using settings {settings.SETTINGS_MODULE}\n"
            f"Starting Gunicorn application server at {self.protocol}://{bind_addr}:{bind_port}/\n"
            f"Quit the server with {quit_command}.\n\n"
        )

        try:
            wsgi_args = [ f'--bind={bind_addr}:{bind_port}', f'-w{workers}', *gunicorn_args ]
            if settings.DEBUG or use_reloader: wsgi_args.append('--reload')

            handler = Application(wsgi_args, usage = '%(prog)s [OPTIONS]')
            handler.run()
        except OSError as e:
            ERRORS = {
                errno.EACCES: "You don't have permission to access that port.",
                errno.EADDRINUSE: "That port is already in use.",
                errno.EADDRNOTAVAIL: "That IP address can't be assigned to.",
            }
            try: error_text = ERRORS[e.errno]
            except KeyError: error_text = e

            self.stderr.write(f"Error: {error_text}")
            os._exit(1)
        except KeyboardInterrupt:
            if shutdown_message: self.stdout.write(shutdown_message)
            sys.exit(0)
