<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\BlogPost;
use App\Models\CmsPage;
use App\Models\ContactMessage;
use App\Models\Faq;
use App\Models\ServiceCategory;
use App\Models\TechnicianProfile;
use App\Models\Testimonial;
use App\Models\User;
use App\Services\Marketplace\CoverageMap;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The admin landing page for the content phase: what exists, what needs
 * attention, and who changed what recently. The full operations dashboard
 * (bookings, revenue, disputes) is Phase 9.
 */
class OverviewController extends Controller
{
    public function __invoke(Request $request, CoverageMap $coverage): JsonResponse
    {
        $user = $request->user();

        return ApiResponse::success([
            'content' => [
                'published_posts' => BlogPost::published()->count(),
                'draft_posts' => BlogPost::where('status', BlogPost::STATUS_DRAFT)->count(),
                'pages' => CmsPage::count(),
                'faqs' => Faq::count(),
                'testimonials' => Testimonial::count(),
                'active_categories' => ServiceCategory::active()->count(),
                'local_pages' => $coverage->localPages()->count(),
            ],
            'marketplace' => [
                'customers' => User::role('customer')->count(),
                'verified_professionals' => TechnicianProfile::publiclyVisible()->count(),
                'pending_professionals' => TechnicianProfile::where('verification_status', VerificationStatus::Pending->value)->count(),
            ],
            'inbox' => [
                'unhandled_contact_messages' => ContactMessage::unhandled()->count(),
            ],
            // Only people who can read the audit log see who did what.
            'recent_activity' => $user->can('audit.view')
                ? AuditLog::with('actor:id,name')
                    ->latest('created_at')
                    ->limit(10)
                    ->get()
                    ->map(fn (AuditLog $log) => [
                        'action' => $log->action,
                        'description' => $log->description,
                        'actor' => $log->actor?->name,
                        'created_at' => $log->created_at?->toIso8601String(),
                    ])
                    ->all()
                : [],
            'permissions' => [
                'content' => $user->can('content.manage'),
                'blog' => $user->can('blog.manage'),
                'services' => $user->can('services.manage'),
                'settings' => $user->can('settings.manage'),
                'inbox' => $user->can('support.tickets.view.any'),
            ],
        ]);
    }
}
