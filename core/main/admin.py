from django.contrib import admin
from .models import PasswordReset, User, Project, Task, TaskAnalytics, GanttChart

admin.site.register(PasswordReset)
admin.site.register(User)
admin.site.register(Project)
admin.site.register(Task)
admin.site.register(TaskAnalytics)

@admin.register(GanttChart)
class GanttChartAdmin(admin.ModelAdmin):
    list_display = ('task', 'start_date', 'end_date', 'progress', 'status')


