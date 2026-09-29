from collections import Counter
from datetime import timedelta
from django.utils import timezone
from django.db.models import Count, Avg
from django.db.models.functions import TruncMonth, TruncWeek
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status

from apps.applications.models import JobApplication
from apps.resumes.models import Resume, SkillAnalysis
from apps.jobs.models import JobDescription

class AnalyticsOverviewView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        
        apps_qs = JobApplication.objects.filter(owner=user)
        total_apps = apps_qs.count()
        interviews = apps_qs.filter(status='interview').count()
        offers = apps_qs.filter(status='offer').count()
        rejected = apps_qs.filter(status='rejected').count()
        wishlist = apps_qs.filter(status='wishlist').count()
        applied = apps_qs.filter(status='applied').count()
        assessment = apps_qs.filter(status='assessment').count()

        total_resumes = Resume.objects.filter(owner=user).count()
        total_jobs = JobDescription.objects.filter(owner=user).count()
        analyses_qs = SkillAnalysis.objects.filter(owner=user)
        total_analyses = analyses_qs.count()

        avg_match = analyses_qs.exclude(match_score__isnull=True).aggregate(Avg('match_score'))['match_score__avg']
        avg_match_score = round(avg_match, 1) if avg_match is not None else None

        # Recent 5 applications
        recent_apps = list(apps_qs.order_by('-created_at')[:5].values(
            'id', 'company', 'role_title', 'status', 'applied_date', 'location'
        ))

        # Recent 5 analyses
        recent_analyses = list(analyses_qs.order_by('-created_at')[:5].values(
            'id', 'job_title', 'company_name', 'resume_title', 'match_score', 'text_similarity_score', 'created_at'
        ))

        return Response({
            'total_applications': total_apps,
            'interview_count': interviews,
            'offer_count': offers,
            'rejection_count': rejected,
            'wishlist_count': wishlist,
            'applied_count': applied,
            'assessment_count': assessment,
            'total_resumes': total_resumes,
            'total_jobs': total_jobs,
            'total_analyses': total_analyses,
            'average_match_score': avg_match_score,
            'recent_applications': recent_apps,
            'recent_analyses': recent_analyses,
        }, status=status.HTTP_200_OK)


class AnalyticsApplicationsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        apps_qs = JobApplication.objects.filter(owner=user)

        # Status distribution
        status_counts = apps_qs.values('status').annotate(count=Count('id'))
        status_map = {item['status']: item['count'] for item in status_counts}
        
        status_breakdown = [
            {'status': 'Wishlist', 'key': 'wishlist', 'count': status_map.get('wishlist', 0), 'color': '#94a3b8'},
            {'status': 'Applied', 'key': 'applied', 'count': status_map.get('applied', 0), 'color': '#3b82f6'},
            {'status': 'Assessment', 'key': 'assessment', 'count': status_map.get('assessment', 0), 'color': '#8b5cf6'},
            {'status': 'Interview', 'key': 'interview', 'count': status_map.get('interview', 0), 'color': '#f59e0b'},
            {'status': 'Offer', 'key': 'offer', 'count': status_map.get('offer', 0), 'color': '#10b981'},
            {'status': 'Rejected', 'key': 'rejected', 'count': status_map.get('rejected', 0), 'color': '#ef4444'},
            {'status': 'Withdrawn', 'key': 'withdrawn', 'count': status_map.get('withdrawn', 0), 'color': '#64748b'},
        ]

        # Applications timeline (Grouped by month for the past 6 months)
        timeline_data = []
        monthly_apps = (
            apps_qs.annotate(month=TruncMonth('applied_date'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )

        for item in monthly_apps:
            if item['month']:
                timeline_data.append({
                    'date': item['month'].strftime('%b %Y'),
                    'count': item['count']
                })

        # If empty, provide empty list rather than fake numbers
        return Response({
            'total_count': apps_qs.count(),
            'status_breakdown': status_breakdown,
            'timeline': timeline_data
        }, status=status.HTTP_200_OK)


class AnalyticsSkillsView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        analyses = SkillAnalysis.objects.filter(owner=user)

        missing_counter = Counter()
        matched_counter = Counter()

        for analysis in analyses:
            if isinstance(analysis.missing_skills, list):
                missing_counter.update(analysis.missing_skills)
            if isinstance(analysis.matched_skills, list):
                matched_counter.update(analysis.matched_skills)

        # Top 10 most frequently missing skills
        top_missing = [{'skill': skill, 'frequency': count} for skill, count in missing_counter.most_common(10)]
        
        # Top 10 most frequently matched skills
        top_matched = [{'skill': skill, 'frequency': count} for skill, count in matched_counter.most_common(10)]

        # Match score distribution (bucketed 0-25, 26-50, 51-75, 76-100)
        score_buckets = {
            '0-25%': 0,
            '26-50%': 0,
            '51-75%': 0,
            '76-100%': 0
        }
        for analysis in analyses:
            if analysis.match_score is not None:
                score = analysis.match_score
                if score <= 25:
                    score_buckets['0-25%'] += 1
                elif score <= 50:
                    score_buckets['26-50%'] += 1
                elif score <= 75:
                    score_buckets['51-75%'] += 1
                else:
                    score_buckets['76-100%'] += 1

        bucket_list = [{'range': k, 'count': v} for k, v in score_buckets.items()]

        return Response({
            'top_missing_skills': top_missing,
            'top_matched_skills': top_matched,
            'match_score_distribution': bucket_list,
            'total_analyses_evaluated': analyses.count()
        }, status=status.HTTP_200_OK)


class SeedDemoDataView(APIView):
    """
    Seeds comprehensive real-time demo/mock data for testing across the entire website.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        from apps.analytics.services.seed_data import seed_user_demo_data
        
        clear_existing = request.data.get('clear_existing', True)
        summary = seed_user_demo_data(request.user, clear_existing=clear_existing)
        
        return Response({
            'message': 'Real-time mock dataset successfully seeded!',
            'data': summary
        }, status=status.HTTP_201_CREATED)


class ClearDemoDataView(APIView):
    """
    Clears all mock and user data for fresh testing.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        SkillAnalysis.objects.filter(owner=user).delete()
        JobApplication.objects.filter(owner=user).delete()
        JobDescription.objects.filter(owner=user).delete()
        Resume.objects.filter(owner=user).delete()

        return Response({
            'message': 'All account testing data cleared cleanly.'
        }, status=status.HTTP_200_OK)


class LiveEventsFeedView(APIView):
    """
    Provides real-time simulated market trends, application status events, and applicant insights.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        events = [
            {
                'id': 'evt-1',
                'type': 'status_change',
                'title': 'Stripe Application Update',
                'message': 'Round 2 Technical Loop scheduled for Thursday 2:00 PM PST',
                'timestamp': 'Just now',
                'badge': 'Interviewing',
                'color': '#f59e0b',
                'company': 'Stripe'
            },
            {
                'id': 'evt-2',
                'type': 'market_trend',
                'title': 'Market Skill Surge ⚡',
                'message': 'TypeScript & Next.js demand in Full Stack roles jumped +18.4% this week',
                'timestamp': '2m ago',
                'badge': 'High Demand',
                'color': '#3b82f6',
                'skill': 'TypeScript'
            },
            {
                'id': 'evt-3',
                'type': 'match_alert',
                'title': 'High Match Alert (94%)',
                'message': 'New matching role: Staff React Engineer at Linear matches 94% of your Alex_Rivera resume',
                'timestamp': '5m ago',
                'badge': '94% Match',
                'color': '#10b981',
                'company': 'Linear'
            },
            {
                'id': 'evt-4',
                'type': 'recommendation',
                'title': 'Skill Roadmap Recommendation',
                'message': 'Mastering Kafka & Kubernetes will increase your Netflix match score from 70% to 95%',
                'timestamp': '12m ago',
                'badge': 'Growth Opportunity',
                'color': '#8b5cf6',
                'skill': 'Kubernetes'
            },
            {
                'id': 'evt-5',
                'type': 'offer_update',
                'title': 'Spotify Offer Letter',
                'message': 'Offer deadline in 10 days ($185k base + equity package)',
                'timestamp': '28m ago',
                'badge': 'Offer Active',
                'color': '#10b981',
                'company': 'Spotify'
            }
        ]
        return Response({'events': events, 'timestamp': timezone.now().isoformat()}, status=status.HTTP_200_OK)

