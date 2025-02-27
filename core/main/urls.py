from django.urls import path
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .auth_views import CustomTokenObtainPairView, register_api

urlpatterns = [
    path('', views.Home, name="home"),
    path('login/', views.LoginView, name="login"),
    path('register/', views.RegisterView, name="register"),
    path('logout/', views.LogoutView, name='logout'),
    path('forgot-password/', views.ForgotPassword, name='forgot-password'),
    path('password-reset-sent/<str:reset_id>/',
         views.PasswordResetSent, name='password-reset-sent'),
    path('reset-password/<str:reset_id>/',
         views.ResetPassword, name='reset-password'),
    path('api/token/', CustomTokenObtainPairView.as_view(),
         name='token_obtain_pair'),  # JWT-логин
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', register_api, name='register_api'),
]
