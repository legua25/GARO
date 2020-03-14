# -*- coding: utf-8 -*-
from __future__ import annotations
from django.utils.translation import ugettext_lazy as _
from django.db.models import Model, TextChoices
from django.db.models.fields.related import *
from django.db.models.fields import *
from django.conf import settings
from textwrap import dedent
from decimal import Decimal
from typing import *

__all__ = [ 'Category', 'Advertisement', 'Gallery', 'Picture', 'create_ad', 'clear_ads' ]


class Category(TextChoices):
    A = 'category-a', _('A-class')
    AA = 'category-aa', _('AA-class')
    AAA = 'category-aaa', _('AAA-class')

class Advertisement(Model):
    id = AutoField(
        null = False,
        blank = True,
        primary_key = True,
        verbose_name = _('ID')
    )
    title = CharField(
        null = False,
        blank = False,
        max_length = 512,
        verbose_name = _('advertisement title')
    )
    category = CharField(
        null = False,
        blank = False,
        max_length = 16,
        choices = Category.choices,
        verbose_name = _('advertisement category')
    )
    thumbnail = URLField(
        null = False,
        blank = False,
        max_length = 256,
        verbose_name = _('advertisement thumbnail'),
        help_text = _('This should contain a URL to a thumbnail. URLs must be absolute; to access local resources, use full path.')
    )
    latitude = DecimalField(
        null = False,
        blank = False,
        decimal_places = 6,
        max_digits = 12,
        verbose_name = _('latitude'),
    )
    longitude = DecimalField(
        null = False,
        blank = False,
        decimal_places = 6,
        max_digits = 12,
        verbose_name = _('latitude'),
    )

    class Meta:
        verbose_name = _('advertisement')
        verbose_name_plural = _('advertisements')
class Gallery(Model):
    id = AutoField(
        null = False,
        blank = True,
        primary_key = True,
        verbose_name = _('ID')
    )
    advertisement = OneToOneField(Advertisement,
        on_delete = CASCADE,
        related_name = 'gallery',
        related_query_name = 'gallery',
        null = False,
        blank = False,
        verbose_name = _('advertisement')
    )
    description = CharField(
        null = False,
        blank = False,
        max_length = 1024,
        verbose_name = _('description')
    )
    interactive_map = URLField(
        null = False,
        blank = False,
        max_length = 256,
        verbose_name = _('interactive map URL'),
        help_text = _('Prefer shortened URLS for ease of maintenance.')
    )

    class Meta:
        verbose_name = _('gallery')
        verbose_name_plural = _('galleries')
class Picture(Model):
    id = AutoField(
        null = False,
        blank = True,
        primary_key = True,
        verbose_name = _('ID')
    )
    gallery = ForeignKey(Gallery,
        on_delete = CASCADE,
        related_name = 'pictures',
        related_query_name = 'pictures',
        null = False,
        blank = False,
        verbose_name = _('gallery')
    )
    front = URLField(
        null = False,
        blank = False,
        max_length = 256,
        verbose_name = _('picture asset (front)'),
        help_text = _('This should contain a URL to a picture asset. URLs must be absolute; to access local resources, use full path.')
    )
    cross = URLField(
        null = False,
        blank = False,
        max_length = 256,
        verbose_name = _('picture asset (cross)'),
        help_text = _('This should contain a URL to a picture asset. URLs must be absolute; to access local resources, use full path.')
    )

    class Meta:
        verbose_name = _('advertisement picture')
        verbose_name_plural = _('advertisement pictures')

PictureList = List[TypedDict('Picture', { 'front': str, 'cross': str })]
CategoryStr = Union[Literal['A'], Literal['AA'], Literal['AAA']]

def create_ad(title: str, category: CategoryStr, thumbnail: str, latitude: str, longitude: str,
              description: str, map: str, pictures: PictureList) -> Advertisement:

    ad = Advertisement.objects.create(
        title = title,
        category = Category[category],
        thumbnail = thumbnail.format(host = settings.HOST_DOMAIN),
        latitude = Decimal(latitude),
        longitude = Decimal(longitude)
    )
    gallery = Gallery.objects.create(
        description = dedent(description),
        interactive_map = map,
        advertisement = ad
    )

    for picture in pictures: Picture.objects.create(
        gallery = gallery,
        front = picture['front'].format(host = settings.HOST_DOMAIN),
        cross = picture['cross'].format(host = settings.HOST_DOMAIN)
    )
    return ad

def clear_ads():
    Picture.objects.all().delete()
    Gallery.objects.all().delete()
    Advertisement.objects.all().delete()
