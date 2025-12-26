<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotebookController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\AccountController;
use App\Http\Controllers\Auth\VerifyEmailController;

Route::middleware(['auth:sanctum'])->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/hello', function () {
    return response()->json(['message' => 'Hello from Laravel API']);
});

// 認証系（API）
require __DIR__.'/auth-api.php';

// メール認証済みのみ許可したいAPI
Route::middleware(['auth:sanctum', 'verified.api'])->group(function () {
    Route::apiResource('notebooks', NotebookController::class);

    Route::get('notebooks/{notebook}/notes', [NoteController::class, 'index']);
    Route::post('notebooks/{notebook}/notes', [NoteController::class, 'store']);

    Route::get('notes/{note}', [NoteController::class, 'show']);
    Route::patch('notes/{note}', [NoteController::class, 'update']);
    Route::delete('notes/{note}', [NoteController::class, 'destroy']);

    Route::put('/password', [PasswordController::class, 'update']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::delete('/account', [AccountController::class, 'destroy']);
});

Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
  ->middleware(['auth:sanctum', 'signed'])
  ->name('verification.verify_api');
