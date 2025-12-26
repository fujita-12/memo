<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

class VerifyEmailController extends Controller
{
    public function __invoke(EmailVerificationRequest $request)
    {
        $request->fulfill();

        if ($request->wantsJson()) {
            return response()->json(['verified' => true]);
        }

        $frontend = rtrim(config('app.frontend_url'), '/');

        return redirect()->to($frontend . '/?verified=1');
    }
}
