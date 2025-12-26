<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\EmailVerificationRequest;

class VerifyEmailController extends Controller
{
    public function __invoke(EmailVerificationRequest $request)
    {
        $request->fulfill();

        $frontend = rtrim(config('app.frontend_url'), '/');

        // 認証後はフロント（/memo）に戻す
        return redirect()->to($frontend . '/?verified=1');
        // もしログイン画面に戻したいならこっちでもOK:
        // return redirect()->to($frontend . '/login?verified=1');
    }
}
