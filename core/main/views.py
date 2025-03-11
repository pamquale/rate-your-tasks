from django.shortcuts import render, redirect
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
from django.urls import reverse
from .models import PasswordReset

@login_required
def DiagramView(request):
    return render(request, 'Diagram/diagram.html')

@login_required
def AnalitycView(request):
    return render(request, 'Analytic/analytic.html')

@login_required
def ProfileView(request):
    return render(request, 'Profile/profile.html')

@login_required
def Home(request):

    features = [
        {"title": "Overloaded team members", "description": "Team overload leads to decreased productivity and burnout. Our system helps identify overloaded members by analyzing their work activity."},
        {"title": "Productivity charts", "description": "Productivity charts show the team's work dynamics and help identify areas for improvement. Our system helps make informed decisions to enhance work efficiency."},
        {"title": "Comparison of performance analysis at different stages", "description": "Compare team performance at different project stages to identify trends and areas for improvement. The analysis helps understand what works efficiently and what needs changes."},
    ]

    advantages = [
        {"icon": "show_chart", "title": "Automated analysis", "description": "The system evaluates team performance in real time with no extra effort."},
        {"icon": "cognition", "title": "Load optimization", "description": "Helps identify overloaded members and balance the workflow."},
        {"icon": "productivity", "title": "Data-driven decisions", "description": "Provides clear data to improve team efficiency and productivity."},
    ]

    team_members = [
        {"name": "1", "role": "Project manager"},
        {"name": "2", "role": "Backend developer"},
        {"name": "3", "role": "Backend developer"},
        {"name": "4", "role": "Frontend developer"},
        {"name": "5", "role": "Frontend developer"},
    ]

    return render(request, 'main/index.html', {'advantages': advantages, 'features': features, 'team_members': team_members})


def RegisterView(request):

    if request.method == "POST":
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')

        user_data_has_error = False

        if User.objects.filter(username=username).exists():
            user_data_has_error = True
            messages.error(request, "Username already exists")

        if User.objects.filter(email=email).exists():
            user_data_has_error = True
            messages.error(request, "Email already exists")

        if len(password) < 5:
            user_data_has_error = True
            messages.error(request, "Password must be at least 5 characters")

        if user_data_has_error:
            return redirect('register')
        else:
            new_user = User.objects.create_user(
                first_name=first_name,
                last_name=last_name,
                email=email,
                username=username,
                password=password
            )
            messages.success(request, "Account created. Login now")
            return redirect('login')

    return render(request, 'Authorization/register.html')

def LoginView(request):

    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        remember_me = request.POST.get("remember_me", False)

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            if remember_me:  # type: ignore
                # Используем стандартное время сессии
                request.session.set_expiry(settings.SESSION_COOKIE_AGE)
            else:
                # Закрытие сессии при закрытии браузера
                request.session.set_expiry(0)

            return redirect('home')

        else:
            messages.error(request, "Invalid login credentials")
            return redirect('login')

    return render(request, 'Authorization/login.html')


def LogoutView(request):

    logout(request)

    return redirect('login')


def ForgotPassword(request):

    if request.method == "POST":
        email = request.POST.get('email')

        try:
            user = User.objects.get(email=email)

            new_password_reset = PasswordReset(user=user)
            new_password_reset.save()

            password_reset_url = reverse(
                'reset-password', kwargs={'reset_id': new_password_reset.reset_id})

            full_password_reset_url = f'{request.scheme}://{request.get_host()}{password_reset_url}'

            email_body = f'Reset your password using the link below:\n\n\n{full_password_reset_url}'

            email_message = EmailMessage(
                'Reset your password',  # email subject
                email_body,
                settings.EMAIL_HOST_USER,  # email sender
                [email]  # email  receiver
            )

            email_message.fail_silently = True
            email_message.send()

            return redirect('password-reset-sent', reset_id=new_password_reset.reset_id)

        except User.DoesNotExist:
            messages.error(request, f"No user with email '{email}' found")
            return redirect('forgot-password')

    return render(request, 'Authorization/forgot_password.html')


def PasswordResetSent(request, reset_id):

    if PasswordReset.objects.filter(reset_id=reset_id).exists():
        return render(request, 'Authorization/password_reset_sent.html')
    else:
        # redirect to forgot password page if code does not exist
        messages.error(request, 'Invalid reset id')
        return redirect('forgot-password')


def ResetPassword(request, reset_id):

    try:
        password_reset_id = PasswordReset.objects.get(reset_id=reset_id)

        if request.method == "POST":
            password = request.POST.get('password')
            confirm_password = request.POST.get('confirm_password')

            passwords_have_error = False

            if password != confirm_password:
                passwords_have_error = True
                messages.error(request, 'Passwords do not match')

            if len(password) < 5:
                passwords_have_error = True
                messages.error(
                    request, 'Password must be at least 5 characters long')

            expiration_time = password_reset_id.created_when + \
                timezone.timedelta(minutes=10)

            if timezone.now() > expiration_time:
                passwords_have_error = True
                messages.error(request, 'Reset link has expired')

                password_reset_id.delete()

            if not passwords_have_error:
                user = password_reset_id.user
                user.set_password(password)
                user.save()

                password_reset_id.delete()

                messages.success(request, 'Password reset. Proceed to login')
                return redirect('login')
            else:
                # redirect back to password reset page and display errors
                return redirect('reset-password', reset_id=reset_id)

    except PasswordReset.DoesNotExist:

        # redirect to forgot password page if code does not exist
        messages.error(request, 'Invalid reset id')
        return redirect('forgot-password')

    return render(request, 'Authorization/reset_password.html')
