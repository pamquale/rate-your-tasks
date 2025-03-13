from django.dispatch import receiver
from allauth.account.signals import user_signed_up
from django.db.models.signals import post_save, post_delete 
from django.utils.timezone import now
from .models import Task, TaskAnalytics


@receiver(user_signed_up)
def handle_user_signed_up(request, sociallogin, user, **kwargs):

    # grab the user's data
    new_user_data = sociallogin.account.extra_data

    print(new_user_data)


@receiver(post_save, sender=Task)
def update_task_analytics(sender, instance, created, **kwargs):
    """
    automatically updates analytics task
    """
    completed_on_time = instance.end_date and instance.deadline and instance.end_date <= instance.deadline
    workload = instance.hours  

    analytics, _ = TaskAnalytics.objects.update_or_create(
        task=instance,
        defaults={
            'completed_on_time': completed_on_time,
            'workload': workload
        }
    )

@receiver(post_delete, sender=Task)
def delete_task_analytics(sender, instance, **kwargs):
    """
    removes analytics if task is deleted
    """
    TaskAnalytics.objects.filter(task=instance).delete()
