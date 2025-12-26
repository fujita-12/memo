<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\URL;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Config;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontend = rtrim(config('app.frontend_url'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());

            return "{$frontend}/reset?token={$token}&email={$email}";
        });

        VerifyEmail::createUrlUsing(function ($notifiable) {
            $frontend = rtrim(config('app.frontend_url'), '/');

            $apiUrl = URL::temporarySignedRoute(
                'verification.verify_api',
                Carbon::now()->addMinutes(Config::get('auth.verification.expire', 60)),
                [
                    'id' => $notifiable->getKey(),
                    'hash' => sha1($notifiable->getEmailForVerification()),
                ]
            );

            // フロントへ（フロントが apiUrl を叩く）
            return "{$frontend}/verify-email?url=" . urlencode($apiUrl);
        });

        if (app()->environment('local')) {
            URL::forceRootUrl(config('app.url')); // = APP_URL を強制
        }
    }
}
