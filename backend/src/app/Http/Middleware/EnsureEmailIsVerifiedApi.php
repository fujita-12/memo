<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Contracts\Auth\MustVerifyEmail;

class EnsureEmailIsVerifiedApi
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();

        if ($user && $user instanceof MustVerifyEmail && ! $user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'メール認証が必要です。',
            ], 403);
        }

        return $next($request);
    }
}
