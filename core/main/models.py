from django.db import models
from django.conf import settings
import uuid

class User(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    position = models.CharField(max_length=100, null=True, blank=True)
    team_role = models.CharField(max_length=100, null=True, blank=True)
    company = models.CharField(max_length=255, null=True, blank=True)
    location = models.CharField(max_length=255, null=True, blank=True)
    work_experience = models.IntegerField(null=True, blank=True)
    key_technologies = models.TextField(
        null=True, blank=True)
    contacts = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.username


class Project(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    # description = models.TextField(null=True, blank=True)
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="projects")

    def __str__(self):
        return self.name


class Task(models.Model):
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High')
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    start_date = models.DateTimeField()
    deadline = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    members = models.ManyToManyField(User, related_name="tasks")
    priority = models.CharField(
        max_length=10, choices=PRIORITY_CHOICES, default='medium')
    difficulty = models.CharField(max_length=255)
    hours = models.IntegerField()
    project = models.ForeignKey(
        Project, on_delete=models.CASCADE, related_name="tasks")

    def __str__(self):
        return self.name


class TaskAnalytics(models.Model):
    task = models.OneToOneField(Task, on_delete=models.CASCADE)
    completed_on_time = models.BooleanField()
    workload = models.IntegerField()

class PasswordReset(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    reset_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    created_when = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Password reset for {self.user.username} at {self.created_when}"


class GanttChart(models.Model):
    task = models.ForeignKey(
        Task, on_delete=models.CASCADE, related_name='gantt_entries')
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    progress = models.FloatField(default=0)
    status = models.CharField(max_length=255)
