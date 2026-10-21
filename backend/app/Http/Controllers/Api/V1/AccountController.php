<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\Account\AccountDeletion;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Deleting your own account from the app or the website.
 */
class AccountController extends Controller
{
    public function __construct(private readonly AccountDeletion $deletion) {}

    /** `GET /account/deletion` — whether the account can be deleted right now. */
    public function deletionCheck(Request $request): JsonResponse
    {
        $active = $this->deletion->activeBookingsCount($request->user());

        return ApiResponse::success(['can_delete' => $active === 0, 'active_bookings' => $active]);
    }

    /** `DELETE /account` — `{ password, reason? }` */
    public function destroy(Request $request): JsonResponse
    {
        $data = $request->validate([
            'password' => ['required', 'string'],
            'reason' => ['nullable', 'string', 'max:500'],
        ], ['password.required' => 'Enter your password to confirm.']);

        $this->deletion->delete($request->user(), $data['password'], $data['reason'] ?? null);

        return ApiResponse::success(null, 'Your account has been deleted.');
    }
}
