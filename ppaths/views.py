from django.shortcuts import get_object_or_404, render
from django.http import HttpResponseRedirect, JsonResponse
from django.urls import reverse
from django.views import generic
from django.utils import timezone


# from .models import Choice, Question

def index(request):
    return render(request, 'ppaths/index.html')

def get_data(request):
    
    json = {
        'you': 'civilian'
    }
    return JsonResponse(json)
