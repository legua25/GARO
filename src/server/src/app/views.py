# -*- coding: utf-8 -*-
from __future__ import annotations
from django.template.response import TemplateResponse
from django.http import HttpRequest, HttpResponse
from app.serializers import ContactSerializer
from rest_framework.parsers import JSONParser
from django.middleware.csrf import get_token
from app.models import Advertisement
from django.conf import settings
from django.views import View
from io import BytesIO
import requests, json


class Index(View):

    def get(self, request: HttpRequest) -> HttpResponse:
        return TemplateResponse(request, template = 'index.html', context = {
            'token': get_token(request),
            'ads': Advertisement.objects.all(),
            'map_key': settings.MAPBOX_API_KEY,
        })
index = Index.as_view()

class Contact(View):
    _parser = JSONParser()

    def post(self, request: HttpRequest) -> HttpResponse:
        try: body = self._parser.parse(BytesIO(request.body))
        except: return HttpResponse(status = 400)
        else:

            # Clean up and validate the data
            serializer = ContactSerializer(data = body)
            if not serializer.is_valid(): return HttpResponse(status = 400)
            data = serializer.validated_data

            # Prepare and send the email template
            response = requests.post('https://api.sendinblue.com/v3/smtp/email',
                headers = { 'Content-Type': 'application/json', 'Accept': 'application/json', 'Api-Key': settings.SENDINBLUE_API_KEY },
                data = json.dumps({
                    'sender': { 'name': 'GARO Medios Publicitarios', 'email': 'no-reply@garoqro.com' },
                    'to': [ { 'name': name, 'email': email } for (name, email) in settings.ADMINS ],
                    'subject': 'Has recibido un mensaje',
                    'templateId': settings.SENDINBLUE_TEMPLATE,
                    'params': {
                        'NAME': data['name'],
                        'EMAILADDRESS': data['email_address'],
                        'CONTENT': data['content']
                    }
                })
            )
            return HttpResponse(status = response.status_code)
contact = Contact.as_view()
