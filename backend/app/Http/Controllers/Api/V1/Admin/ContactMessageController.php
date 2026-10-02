<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use App\Services\Audit\AuditLogger;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** The contact form inbox. */
class ContactMessageController extends Controller
{
    private const STATUSES = [
        ContactMessage::STATUS_NEW,
        ContactMessage::STATUS_IN_PROGRESS,
        ContactMessage::STATUS_HANDLED,
    ];

    public function index(Request $request): JsonResponse
    {
        $request->validate(['status' => ['nullable', Rule::in(self::STATUSES)]]);

        $messages = ContactMessage::query()
            ->with('handler:id,name')
            ->when($request->filled('status'), fn ($q) => $q->where('status', $request->string('status')))
            ->latest()
            ->paginate(25)
            ->through(fn (ContactMessage $message) => $this->present($message));

        return ApiResponse::success($messages, 'OK', 200, [
            'unhandled_count' => ContactMessage::unhandled()->count(),
        ]);
    }

    public function update(Request $request, AuditLogger $audit, string $uuid): JsonResponse
    {
        $message = ContactMessage::where('uuid', $uuid)->first();

        if (! $message) {
            return ApiResponse::notFound('That message does not exist.');
        }

        $data = $request->validate([
            'status' => ['sometimes', Rule::in(self::STATUSES)],
            'internal_note' => ['nullable', 'string', 'max:2000'],
        ]);

        $original = $message->getOriginal();

        if (($data['status'] ?? null) === ContactMessage::STATUS_HANDLED && $message->status !== ContactMessage::STATUS_HANDLED) {
            $data['handled_by_user_id'] = $request->user()->id;
            $data['handled_at'] = now();
        }

        $message->fill($data)->save();
        $audit->recordChanges('contact_message.updated', $message, $original);

        return ApiResponse::success($this->present($message->load('handler:id,name')), 'Message updated.');
    }

    private function present(ContactMessage $message): array
    {
        return [
            'id' => $message->uuid,
            'name' => $message->name,
            'email' => $message->email,
            'phone' => $message->phone,
            'topic' => $message->topic,
            'subject' => $message->subject,
            'message' => $message->message,
            'status' => $message->status,
            'internal_note' => $message->internal_note,
            'handled_by' => $message->relationLoaded('handler') ? $message->handler?->name : null,
            'handled_at' => $message->handled_at?->toIso8601String(),
            'created_at' => $message->created_at?->toIso8601String(),
        ];
    }
}
