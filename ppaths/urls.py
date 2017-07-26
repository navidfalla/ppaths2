from django.conf.urls import url

from . import views

app_name = 'ppaths'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^get_data/?$', views.get_data, name='get_data')
]
