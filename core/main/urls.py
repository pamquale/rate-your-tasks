from django.urls import path
from . import views

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
     path('diagram/', views.DiagramView, name="diagram"),
     path('api/save-project/', views.save_project, name="save_project"),
     path('api/projects/', views.get_projects, name="get_projects"),
     path('api/save-task/', views.save_task, name="save_task"),
     path('api/update-task/', views.update_task, name="update_task"),
     path('api/delete-task/', views.delete_task, name="delete_task"),
     path('analytic/', views.AnalitycView, name="analytic"),
     path('profile/', views.ProfileView, name="profile"),

]