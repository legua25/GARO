# -*- coding: utf-8 -*-
from __future__ import annotations
from django.core.management.base import BaseCommand, CommandError
from app.models import create_ad, clear_ads
from django.db.transaction import atomic
from typing import Optional, List, Any
from argparse import ArgumentParser
from pathlib import Path
import yaml


__all__ = [ 'Command' ]


def path(input: str) -> Path:
    return Path(input).expanduser().resolve()


class Command(BaseCommand):
    help = 'Updates installed advertisements from supplied *.yaml file'
    requires_migrations_checks = True

    def add_arguments(self, parser: ArgumentParser):
        parser.add_argument('path',
            type = path,
            action = 'store',
            nargs = '?',
            default = None,
            help = '*.yaml file to load advertisements from.'
        )
    def handle(self, path: Optional[Path], *args, verbosity: int = 0, **kwargs):
        # Read advertisement list: if no file was provided, use stdin
        if path is not None: filename = f'file "{path}"'; file = path.open(encoding = 'utf8')
        else: filename = 'command line'; file = open(0, encoding = 'utf8')

        with file as f:
            if verbosity >= 1: self.stdout.write(f'Parsing contents of {filename}...')
            ads = list(yaml.safe_load_all(f))
            if verbosity >= 2: self.stdout.write(f'{len(ads)} advertisement entries found.')

        with atomic():
            if verbosity >= 2: self.stdout.write('Removing prior advertisements for fresh start...')
            clear_ads()

            # Add each entry one at a time, creating all required sub-objects; abort on failure
            for id, ad in enumerate(ads):
                if 'title' not in ad: raise CommandError('Malformed YAML file encountered.')
                title = ad['title']
                if verbosity >= 2: self.stdout.write(f'Processing entry #{id}: {title}')

                try:
                    result = create_ad(**ad)
                    if verbosity >= 1: self.stdout.write(f'Successfully processed entry #{id}: {result.title}')
                except BaseException as e: raise CommandError(f'Failed to process entry #{id}: {e}') from e

        self.stdout.write(f'{len(ads)} entries successfully processed.')
