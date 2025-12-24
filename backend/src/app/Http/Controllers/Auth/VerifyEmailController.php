<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use Illuminate\Http\RedirectResponse;

class VerifyEmailController extends Controller
{
    /**
     * Mark the authenticated user's email address as verified.
     */
    // public function __invoke(EmailVerificationRequest $request): RedirectResponse
    // {
    //     if ($request->user()->hasVerifiedEmail()) {
    //         return redirect()->intended(
    //             config('app.frontend_url').'/dashboard?verified=1'
    //         );
    //     }

    //     if ($request->user()->markEmailAsVerified()) {
    //         event(new Verified($request->user()));
    //     }

    //     return redirect()->intended(
    //         config('app.frontend_url').'/dashboard?verified=1'
    //     );
    // }

    public function __invoke(\Illuminate\Foundation\Auth\EmailVerificationRequest $request)
    {
        $request->fulfill();

        $frontend = env('FRONTEND_URL', 'http://localhost:5173');
        return redirect()->to($frontend.'/?verified=1');
    }
}
