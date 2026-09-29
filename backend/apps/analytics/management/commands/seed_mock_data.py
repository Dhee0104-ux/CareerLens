from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.accounts.models import UserProfile
from apps.analytics.services.seed_data import seed_user_demo_data

class Command(BaseCommand):
    help = "Seeds rich mock data for testing CareerLens (Resumes, Jobs, Analyses, Applications)"

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            type=str,
            default='demo_user',
            help='Username of the user to seed mock data for (creates user if not found)'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='TestPass123!',
            help='Password for the demo user if created'
        )
        parser.add_argument(
            '--no-clear',
            action='store_true',
            help='Do not clear existing data before seeding'
        )

    def handle(self, *args, **options):
        username = options['username']
        password = options['password']
        clear_existing = not options['no_clear']

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@example.com',
                'first_name': 'Alex',
                'last_name': 'Rivera',
                'is_active': True,
            }
        )

        if created:
            user.set_password(password)
            user.save()
            self.stdout.write(self.style.SUCCESS(f"Created demo user: {username} (password: {password})"))

        # Ensure user profile exists
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.headline = "Senior Full Stack Software Engineer"
        profile.target_role = "Senior Full Stack / Cloud Engineer"
        profile.primary_skills = ["TypeScript", "React", "Node.js", "Python", "Django", "PostgreSQL", "Docker", "AWS"]
        profile.save()

        summary = seed_user_demo_data(user, clear_existing=clear_existing)

        self.stdout.write(self.style.SUCCESS(f"Successfully seeded mock data for user '{username}':"))
        self.stdout.write(f"  • Resumes:      {summary['resumes_count']}")
        self.stdout.write(f"  • Job Postings: {summary['jobs_count']}")
        self.stdout.write(f"  • Analyses:     {summary['analyses_count']}")
        self.stdout.write(f"  • Applications: {summary['applications_count']}")
