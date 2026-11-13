<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\InboxNotification;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The signed-in person's notifications inbox, the same list in the app and
 * on the website. Newest first; the unread count travels in `meta`.
 */
class NotificationController extends Controller
{
    /** `GET /notifications?page=&per_page=` */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $page = InboxNotification::query()
            ->where('user_id', $userId)
            ->latest('id')
            ->paginate(min(max($request->integer('per_page', 30), 1), 50));

        $page->getCollection()->transform(fn (InboxNotification $n) => $this->present($n));

        return ApiResponse::success($page, 'OK', meta: ['unread' => $this->unreadCount($userId)]);
    }

    /** `GET /notifications/unread` */
    public function unread(Request $request): JsonResponse
    {
        return ApiResponse::success(['unread' => $this->unreadCount($request->user()->id)]);
    }

    /** `POST /notifications/{uuid}/read` */
    public function read(Request $request, string $uuid): JsonResponse
    {
        $notification = InboxNotification::query()
            ->where('user_id', $request->user()->id)
            ->where('uuid', $uuid)
            ->first();

        if ($notification === null) {
            return ApiResponse::notFound('That notification does not exist.');
        }

        if ($notification->read_at === null) {
            $notification->forceFill(['read_at' => now()])->save();
        }

        return ApiResponse::success(
            $this->present($notification),
            'OK',
            meta: ['unread' => $this->unreadCount($request->user()->id)]
        );
    }

    /** `POST /notifications/read-all` */
    public function readAll(Request $request): JsonResponse
    {
        InboxNotification::query()
            ->where('user_id', $request->user()->id)
            ->unread()
            ->update(['read_at' => now(), 'updated_at' => now()]);

        return ApiResponse::success(['unread' => 0], 'All marked as read.');
    }

    private function unreadCount(int $userId): int
    {
        return InboxNotification::query()->where('user_id', $userId)->unread()->count();
    }

    /** @return array<string, mixed> */
    private function present(InboxNotification $n): array
    {
        return [
            'id' => $n->uuid,
            'type' => $n->type,
            'title' => ['en' => $n->title_en, 'ur' => $n->title_ur],
            'body' => ['en' => $n->body_en, 'ur' => $n->body_ur],
            // `route` opens the app screen, `web_path` the same thing on the website.
            'route' => $n->route,
            'web_path' => InboxNotification::webPath($n->route),
            'read' => $n->read_at !== null,
            'created_at' => $n->created_at?->toIso8601String(),
        ];
    }
}
