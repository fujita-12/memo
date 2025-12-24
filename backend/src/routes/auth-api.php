<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\Auth\EmailVerificationNotificationController;
use App\Http\Controllers\Auth\NewPasswordController;
use App\Http\Controllers\Auth\PasswordResetLinkController;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\Api\EmailChangeController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [RegisteredUserController::class, 'store'])->middleware('guest');
Route::post('/login', [AuthenticatedSessionController::class, 'store'])->middleware('guest');

Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->middleware('guest');
Route::post('/reset-password', [NewPasswordController::class, 'store'])->middleware('guest');

Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
  ->middleware(['auth:sanctum', 'throttle:6,1']);

Route::post('/logout', [AuthenticatedSessionController::class, 'destroy'])
  ->middleware('auth:sanctum');

/**
 * メールアドレス変更（堅牢版）
 * - request: ログイン必須 + 現在パスワード必須
 * - confirm: 新メールのリンクから（ゲストでもOK）
 */
Route::post('/email/change-request', [EmailChangeController::class, 'request'])
  ->middleware(['auth:sanctum', 'throttle:6,1']);

Route::post('/email/change-confirm', [EmailChangeController::class, 'confirm'])
  ->middleware(['throttle:10,1']);

Route::post('/email/change-cancel', [EmailChangeController::class, 'cancel'])
  ->middleware(['throttle:10,1']);

Route::post('/email/change-approve', [EmailChangeController::class, 'approve'])
  ->middleware(['throttle:10,1']);
