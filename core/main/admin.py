from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import PasswordReset, User, Project, Task, TaskAnalytics, GanttChart

admin.site.register(PasswordReset)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(TaskAnalytics)

@admin.register(GanttChart)
class GanttChartAdmin(admin.ModelAdmin):
    list_display = ('task', 'start_date', 'end_date', 'progress', 'status')

class CustomUserAdmin(UserAdmin):
    model = User
    fieldsets = UserAdmin.fieldsets + (
        ("Additional Info", {
            "fields": (
                "position",
                "team_role",
                "company",
                "location",
                "work_experience",
                "key_technologies",
                "contacts",
            ),
        }),
    )

admin.site.register(User, CustomUserAdmin)
