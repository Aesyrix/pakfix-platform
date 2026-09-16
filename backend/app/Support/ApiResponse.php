<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Contracts\Support\Arrayable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\AbstractPaginator;
use Symfony\Component\HttpFoundation\Response;

/**
 * Every API response in PakFix has the same shape, because the Android and
 * iOS clients will parse it with one generic decoder:
 *
 *   { "success": true,  "message": "...", "data": {...} }
 *   { "success": false, "message": "...", "errors": {...} }
 *
 * Pagination is lifted into a sibling `meta` key rather than being nested
 * inside `data`, so `data` is always the payload itself and never a wrapper.
 */
final class ApiResponse
{
    public static function success(
        mixed $data = null,
        string $message = 'OK',
        int $status = Response::HTTP_OK,
        array $meta = []
    ): JsonResponse {
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => self::normalise($data),
        ];

        if ($paginationMeta = self::paginationMeta($data)) {
            $meta = array_merge($paginationMeta, $meta);
        }

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status);
    }

    public static function created(mixed $data = null, string $message = 'Created successfully.'): JsonResponse
    {
        return self::success($data, $message, Response::HTTP_CREATED);
    }

    /** A 204 carries no body at all, which is what the clients expect. */
    public static function noContent(): JsonResponse
    {
        return response()->json(null, Response::HTTP_NO_CONTENT);
    }

    public static function error(
        string $message,
        int $status = Response::HTTP_BAD_REQUEST,
        array $errors = []
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== []) {
            $payload['errors'] = $errors;
        }

        return response()->json($payload, $status);
    }

    public static function validationFailed(array $errors, string $message = 'Validation failed.'): JsonResponse
    {
        return self::error($message, Response::HTTP_UNPROCESSABLE_ENTITY, $errors);
    }

    public static function unauthorized(string $message = 'Authentication required.'): JsonResponse
    {
        return self::error($message, Response::HTTP_UNAUTHORIZED);
    }

    public static function forbidden(string $message = 'You are not allowed to do that.'): JsonResponse
    {
        return self::error($message, Response::HTTP_FORBIDDEN);
    }

    public static function notFound(string $message = 'Not found.'): JsonResponse
    {
        return self::error($message, Response::HTTP_NOT_FOUND);
    }

    public static function tooManyRequests(string $message = 'Too many requests. Please slow down.'): JsonResponse
    {
        return self::error($message, Response::HTTP_TOO_MANY_REQUESTS);
    }

    public static function serverError(string $message = 'Something went wrong on our side.'): JsonResponse
    {
        return self::error($message, Response::HTTP_INTERNAL_SERVER_ERROR);
    }

    /**
     * Unwraps resources and paginators down to plain arrays.
     *
     * Always resolve() rather than toArray(): toArray() returns the raw array
     * still containing MissingValue and MergeValue markers, and it is resolve()
     * that filters them. Calling toArray() directly makes every when(),
     * whenLoaded() and mergeWhen() in a resource silently do nothing.
     */
    private static function normalise(mixed $data): mixed
    {
        $request = request();

        if ($data instanceof ResourceCollection) {
            return $data->collection->map(
                fn (JsonResource $item) => $item->resolve($request)
            )->all();
        }

        if ($data instanceof JsonResource) {
            return $data->resolve($request);
        }

        if ($data instanceof AbstractPaginator) {
            return collect($data->items())->map(
                fn ($item) => $item instanceof JsonResource ? $item->resolve($request) : $item
            )->all();
        }

        if ($data instanceof Arrayable) {
            return $data->toArray();
        }

        return $data;
    }

    private static function paginationMeta(mixed $data): array
    {
        $paginator = match (true) {
            $data instanceof AbstractPaginator => $data,
            $data instanceof ResourceCollection && $data->resource instanceof AbstractPaginator => $data->resource,
            default => null,
        };

        if (! $paginator) {
            return [];
        }

        return [
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => method_exists($paginator, 'total') ? $paginator->total() : null,
                'last_page' => method_exists($paginator, 'lastPage') ? $paginator->lastPage() : null,
                'has_more' => $paginator->hasMorePages(),
            ],
        ];
    }
}
