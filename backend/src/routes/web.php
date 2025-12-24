<?php

use App\Http\Controllers\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return ['Laravel' => app()->version()];
});

// 未ログインで verify を踏んだ時の逃げ先（GET /login が必要）
Route::get('/login', function () {
    return redirect(env('FRONTEND_URL', 'http://localhost:5173'));
})->name('login');

// メールのリンク（web）
Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
    ->middleware(['auth', 'signed', 'throttle:6,1'])
    ->name('verification.verify');
