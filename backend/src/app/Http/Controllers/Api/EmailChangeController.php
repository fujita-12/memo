<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\ConfirmEmailChangeNotification;
use App\Notifications\EmailChangeRequestedNotification;
use Illuminate\Database\QueryException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EmailChangeController extends Controller
{
    private int $ttlMinutes = 60;

    private function isExpired($requestedAt): bool
    {
        return !$requestedAt || $requestedAt->lt(now()->subMinutes($this->ttlMinutes));
    }

    // 1) request（ログイン必須）
    public function request(Request $request)
    {
        $request->validate([
            'new_email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')],
            'current_password' => ['required', 'current_password'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $newEmail = $request->string('new_email')->toString();

        if ($newEmail === $user->email) {
            return response()->json([
                'message' => '入力内容を確認してください',
                'errors' => ['new_email' => ['現在のメールアドレスと同じです。']],
            ], 422);
        }

        $plainApproveToken = Str::random(64);
        $plainCancelToken  = Str::random(64);

        // ✅ confirmトークンは “まだ作らない”（approve後に作成して新メールへ送る）
        $user->forceFill([
            'pending_email' => $newEmail,

            'pending_email_token' => null, // confirm token（approve 後）
            'pending_email_cancel_token'  => hash('sha256', $plainCancelToken),
            'pending_email_approve_token' => hash('sha256', $plainApproveToken),

            'pending_email_requested_at' => now(),
            'pending_email_approved_at' => null,

            'pending_email_completed_at' => null,
            'pending_email_completion_status' => null,
        ])->save();

        // ✅ 旧メールへ：承認/拒否リンクを送る
        Notification::route('mail', $user->email)->notify(
            new EmailChangeRequestedNotification(
                approveToken: $plainApproveToken,
                cancelToken: $plainCancelToken,
                newEmail: $newEmail,
                ttlMinutes: $this->ttlMinutes,
            )
        );

        return response()->json(['status' => 'ok']);
    }

    // 2) approve（旧メールの承認リンク / guest可）
    public function approve(Request $request)
    {
        $request->validate(['token' => ['required', 'string']]);
        $tokenHash = hash('sha256', $request->string('token')->toString());

        $found = User::query()
            ->where('pending_email_approve_token', $tokenHash)
            ->first();

        if (!$found) {
            return response()->json(['status' => 'invalid_or_processed']);
        }

        return DB::transaction(function () use ($found) {
            /** @var User $user */
            $user = User::query()->whereKey($found->id)->lockForUpdate()->firstOrFail();

            if ($user->pending_email_completed_at) {
                return response()->json([
                    'status' => 'already_completed',
                    'completion_status' => $user->pending_email_completion_status,
                ]);
            }

            if ($this->isExpired($user->pending_email_requested_at)) {
                $user->forceFill([
                    'pending_email_completed_at' => now(),
                    'pending_email_completion_status' => 'expired',
                    'pending_email' => null,
                ])->save();

                return response()->json(['status' => 'expired']);
            }

            if ($user->pending_email_approved_at) {
                return response()->json(['status' => 'already_approved']);
            }

            if (!$user->pending_email) {
                return response()->json(['status' => 'invalid_or_processed']);
            }

            // ✅ approveした瞬間に confirm token を発行して新メールへ送信
            $plainConfirmToken = Str::random(64);

            $user->forceFill([
                'pending_email_token' => hash('sha256', $plainConfirmToken),
                'pending_email_approved_at' => now(),
            ])->save();

            Notification::route('mail', $user->pending_email)->notify(
                new ConfirmEmailChangeNotification(
                    token: $plainConfirmToken,
                    email: $user->pending_email,
                    ttlMinutes: $this->ttlMinutes,
                )
            );

            return response()->json(['status' => 'approved_and_sent']);
        });
    }

    // 3) confirm（新メールの確定リンク / guest可）
    public function confirm(Request $request)
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['nullable', 'email'], // フロント互換のため受けるだけ（検索には使わない）
        ]);

        $tokenHash = hash('sha256', $request->string('token')->toString());

        $found = User::query()
            ->where('pending_email_token', $tokenHash)
            ->first();

        if (!$found) {
            return response()->json(['status' => 'invalid_or_processed']);
        }

        try {
            return DB::transaction(function () use ($found) {
                /** @var User $user */
                $user = User::query()->whereKey($found->id)->lockForUpdate()->firstOrFail();

                if ($user->pending_email_completed_at) {
                    return response()->json([
                        'status' => 'already_completed',
                        'completion_status' => $user->pending_email_completion_status,
                    ]);
                }

                if ($this->isExpired($user->pending_email_requested_at)) {
                    $user->forceFill([
                        'pending_email_completed_at' => now(),
                        'pending_email_completion_status' => 'expired',
                        'pending_email' => null,
                    ])->save();

                    return response()->json(['status' => 'expired']);
                }

                if (!$user->pending_email_approved_at) {
                    return response()->json(['status' => 'not_approved_yet']);
                }

                if (!$user->pending_email) {
                    return response()->json(['status' => 'invalid_or_processed']);
                }

                $newEmail = $user->pending_email;

                $user->forceFill([
                    'email' => $newEmail,
                    'email_verified_at' => now(),

                    'pending_email' => null,

                    'pending_email_completed_at' => now(),
                    'pending_email_completion_status' => 'confirmed',

                    'remember_token' => Str::random(60),
                ])->save();

                return response()->json(['status' => 'confirmed']);
            });
        } catch (QueryException $e) {
            return response()->json([
                'status' => 'email_conflict',
                'message' => 'このメールアドレスは既に使用されています。',
            ], 422);
        }
    }

    // 4) cancel（旧メールの拒否リンク / guest可）
    public function cancel(Request $request)
    {
        $request->validate(['token' => ['required', 'string']]);
        $tokenHash = hash('sha256', $request->string('token')->toString());

        $found = User::query()
            ->where('pending_email_cancel_token', $tokenHash)
            ->first();

        if (!$found) {
            return response()->json(['status' => 'invalid_or_processed']);
        }

        return DB::transaction(function () use ($found) {
            /** @var User $user */
            $user = User::query()->whereKey($found->id)->lockForUpdate()->firstOrFail();

            if ($user->pending_email_completed_at) {
                return response()->json([
                    'status' => 'already_completed',
                    'completion_status' => $user->pending_email_completion_status,
                ]);
            }

            $user->forceFill([
                'pending_email' => null,
                'pending_email_token' => null,
                'pending_email_approved_at' => null,

                'pending_email_completed_at' => now(),
                'pending_email_completion_status' => 'canceled',
            ])->save();

            return response()->json(['status' => 'canceled']);
        });
    }
}
