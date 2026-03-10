from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Route, Bus, Driver, Semester, RouteAssignment


def _deactivate_assignments(**filter_kwargs):
    """Set is_active=False on all active RouteAssignments matching the filter."""
    RouteAssignment.objects.filter(is_active=True, **filter_kwargs).update(is_active=False)


@receiver(post_save, sender=Route)
def deactivate_on_route_inactive(sender, instance, **kwargs):
    if not instance.is_active:
        _deactivate_assignments(route=instance)


@receiver(post_save, sender=Bus)
def deactivate_on_bus_inactive(sender, instance, **kwargs):
    if not instance.is_active:
        _deactivate_assignments(bus=instance)


@receiver(post_save, sender=Driver)
def deactivate_on_driver_unavailable(sender, instance, **kwargs):
    if not instance.is_available:
        _deactivate_assignments(driver=instance)


@receiver(post_save, sender=Semester)
def deactivate_on_semester_inactive(sender, instance, **kwargs):
    if not instance.is_active:
        _deactivate_assignments(semester=instance)
