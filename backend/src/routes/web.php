<?php

use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// 未ログインで verify を踏んだ時の逃げ先（GET /login が必要）
Route::get('/login', function () {
    return redirect(rtrim(config('app.frontend_url'), '/') . '/login');
})->name('login');

// メールのリンク（web）旧互換
// Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
//     ->middleware(['auth', 'signed', 'throttle:6,1'])
//     ->name('verification.verify');
