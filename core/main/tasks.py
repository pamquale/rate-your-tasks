from celery import shared_task
import random
import time

@shared_task
def generate_random_numbers(count=5, min_value=1, max_value=100):
    """Generates a list of random numbers."""
    time.sleep(2)  
    random_numbers = [random.randint(min_value, max_value) for _ in range(count)]
    return random_numbers