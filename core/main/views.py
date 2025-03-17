from django.shortcuts import render, redirect
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone
from django.urls import reverse
from .models import PasswordReset
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Task, GanttChart, TaskAnalytics, Project
from datetime import datetime

User = get_user_model()

@csrf_exempt
@login_required
def update_task(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task_id = data.get("task_id")

            # Перевірка чи існує задача з таким ID
            task = Task.objects.filter(id=task_id).first()
            if not task:
                return JsonResponse({"error": "Task not found."}, status=404)

            # Оновлення даних задачі
            Task.objects.filter(id=task_id).update(
                name=data.get("name", task.name),
                start_date=data.get("start", task.start_date),
                deadline=data.get("deadline", task.deadline),
                end_date=data.get("completion", task.end_date),
                priority=data.get("priority", task.priority),
                hours=data.get("hours", task.hours),
                difficulty=data.get("difficulty", task.difficulty)
            )

            # Оновлення учасників
            task.members.set(User.objects.filter(username__in=data.get("members", "").split(",")))

            return JsonResponse({"message": "Task updated successfully!"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
@login_required
def delete_task(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task_id = data.get("task_id")

            task = Task.objects.get(id=task_id)
            task.delete()

            return JsonResponse({"message": "Task deleted successfully!"})

        except Task.DoesNotExist:
            return JsonResponse({"error": "Task not found."}, status=404)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt
@login_required
def save_project(request):
    """Збереження нового проєкту в БД через AJAX"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            title = data.get("title")
            start_date_str = data.get("start_date")  # Отримуємо дату у вигляді рядка

            if not title or not start_date_str:
                return JsonResponse({"error": "Project title and start date are required."}, status=400)

            # Перетворюємо рядок у datetime
            start_date = datetime.strptime(start_date_str, "%Y-%m-%d")

            # Створюємо новий проєкт у базі
            project = Project.objects.create(
                title=title,
                start_date=start_date,
                owner=request.user
            )

            return JsonResponse({
                "message": "Project saved successfully!",
                "project": {
                    "id": str(project.id),
                    "title": project.title,
                    "start_date": project.start_date.strftime("%Y-%m-%d"),  # Тепер працює
                }
            })
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)


@login_required
def get_projects(request):
    """ Отримати список проєктів із завданнями """
    projects = Project.objects.filter(owner=request.user).prefetch_related("tasks")
    projects_data = [
        {
            "id": str(project.id),
            "title": project.title,
            "start_date": project.start_date.strftime("%Y-%m-%d"),
            "tasks": [
                {
                    "id": str(task.id),
                    "name": task.name,
                    "start": task.start_date.strftime("%Y-%m-%d"),
                    "deadline": task.deadline.strftime("%Y-%m-%d"),
                    "completion": task.end_date.strftime("%Y-%m-%d") if task.end_date else None,
                    "priority": task.priority,
                    "hours": task.hours,
                    "difficulty": task.difficulty,
                    "members": ", ".join([member.username for member in task.members.all()])
                }
                for task in project.tasks.all()
            ],
        }
        for project in projects
    ]
    return JsonResponse({"projects": projects_data})

@csrf_exempt
@login_required
def save_task(request):
    """ Додавання нового завдання через AJAX """
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            project_id = data.get("project_id")
            name = data.get("name")
            start_date = data.get("start")
            deadline = data.get("deadline")
            completion = data.get("completion")
            priority = data.get("priority")
            hours = data.get("hours")
            difficulty = data.get("difficulty")
            members = data.get("members")

            project = Project.objects.get(id=project_id, owner=request.user)
            task = Task.objects.create(
                project=project,
                name=name,
                start_date=start_date,
                deadline=deadline,
                end_date=completion,
                priority=priority,
                hours=hours,
                difficulty=difficulty
            )

            # Додаємо учасників завдання
            task.members.set(User.objects.filter(username__in=members.split(",")))

            return JsonResponse({"message": "Task saved successfully!", "task_id": str(task.id)})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    return JsonResponse({"error": "Invalid request"}, status=400)

def get_analytics_data(request):
    analytics = TaskAnalytics.objects.all().values("task__name", "completed_on_time", "workload")
    return JsonResponse(list(analytics), safe=False)

@csrf_exempt
def save_analytics_data(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task_id = data.get("task_id")
            completed_on_time = data.get("completed_on_time")
            workload = data.get("workload")

            task = Task.objects.get(id=task_id)
            analytics, created = TaskAnalytics.objects.update_or_create(
                task=task,
                defaults={"completed_on_time": completed_on_time, "workload": workload}
            )

            return JsonResponse({"message": "Data saved successfully!", "created": created})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def save_gantt_chart(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            task_id = data.get("task_id")
            start_date = data.get("start_date")
            end_date = data.get("end_date")
            progress = data.get("progress")
            status = data.get("status")

            task = Task.objects.get(id=task_id)
            gantt_entry, created = GanttChart.objects.update_or_create(
                task=task,
                defaults={"start_date": start_date, "end_date": end_date, "progress": progress, "status": status}
            )

            return JsonResponse({"message": "Data saved successfully!", "created": created})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

@login_required
def DiagramView(request):
    return render(request, 'Diagram/diagram.html')

@login_required
def AnalitycView(request):
    return render(request, 'Analytic/analytic.html')

@login_required
def ProfileView(request):
    user = request.user
    return render(request, 'Profile/profile.html', {'user': user})


@login_required
def Home(request):

    features = [
        {
            "title": "Overloaded team members", 
            "description": "Team overload leads to decreased productivity and burnout. Our system helps identify overloaded members by analyzing their work activity.",
            "image": "main/media/features1.webp"
        },
        {
            "title": "Productivity charts", 
            "description": "Productivity charts show the team's work dynamics and help identify areas for improvement. Our system helps make informed decisions to enhance work efficiency.",
            "image": "main/media/features2.png"
        },
        {
            "title": "Comparison of performance analysis at different stages", 
            "description": "Compare team performance at different project stages to identify trends and areas for improvement. The analysis helps understand what works efficiently and what needs changes.",
            "image": "main/media/features3.png"
        },
    ]

    advantages = [
        {
            "icon": "show_chart", 
            "title": "Automated analysis", 
            "description": "The system evaluates team performance in real time with no extra effort."
        },
        {
            "icon": "cognition", 
            "title": "Load optimization", 
            "description": "Helps identify overloaded members and balance the workflow."
        },
        {
            "icon": "productivity", 
            "title": "Data-driven decisions", 
            "description": "Provides clear data to improve team efficiency and productivity."
        },
    ]

    team_members = [
        {
            "name": "1", 
            "role": "Project manager"
        },
        {
            "name": "2", 
            "role": "Backend developer"
        },
        {
            "name": "3", 
            "role": "Backend developer"
        },
        {
            "name": "4", 
            "role": "Frontend developer"
        },
        {
            "name": "5", 
            "role": "Frontend developer"
        },
    ]

    return render(request, 'main/index.html', {'advantages': advantages, 'features': features, 'team_members': team_members})


def RegisterView(request):
    if request.method == "POST":
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        position = request.POST.get('position')
        team_role = request.POST.get('team_role')
        company = request.POST.get('company')
        location = request.POST.get('location')

        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists")
            return redirect('register')

        if User.objects.filter(email=email).exists():
            messages.error(request, "Email already exists")
            return redirect('register')

        if len(password) < 5:
            messages.error(request, "Password must be at least 5 characters")
            return redirect('register')

        new_user = User.objects.create_user(
            first_name=first_name,
            last_name=last_name,
            email=email,
            username=username,
            password=password,
            position=position,
            team_role=team_role,
            company=company,
            location=location
        )
        new_user.save()

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
            if remember_me:  
                request.session.set_expiry(settings.SESSION_COOKIE_AGE)
            else:
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