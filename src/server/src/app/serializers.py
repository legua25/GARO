# -*- coding: utf-8 -*-
from __future__ import annotations
from rest_framework.serializers import Serializer
from rest_framework.fields import *


class ContactSerializer(Serializer):

    name = CharField(
        allow_null = False,
        allow_blank = False,
        required = True,
        trim_whitespace = True,
        min_length = 1
    )
    email_address = EmailField(
        allow_null = False,
        allow_blank = True,
        required = True,
        trim_whitespace = True
    )
    content = CharField(
        allow_null = False,
        allow_blank = False,
        required = True,
        min_length = 1
    )
