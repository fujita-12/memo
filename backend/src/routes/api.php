<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\NotebookController;
use App\Http\Controllers\Api\NoteController;
use App\Http\Controllers\Api\PasswordListController;
use App\Http\Controllers\Api\PasswordItemController;
use App\Http\Controllers\Api\PasswordController;
use App\Http\Controllers\Api\PasswordEntryController;
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

    Route::get('/password-lists', [PasswordListController::class, 'index']);
    Route::post('/password-lists', [PasswordListController::class, 'store']);
    Route::delete('/password-lists/{list}', [PasswordListController::class, 'destroy']);

    Route::get('/password-lists/{list}/items', [PasswordItemController::class, 'index']);
    Route::post('/password-lists/{list}/items', [PasswordItemController::class, 'store']);

    Route::get('/password-items/{item}', [PasswordItemController::class, 'show']);
    Route::patch('/password-items/{item}', [PasswordItemController::class, 'update']);
    Route::delete('/password-items/{item}', [PasswordItemController::class, 'destroy']);

    Route::get('/password-items/{item}/entries', [PasswordEntryController::class, 'index']);
    Route::post('/password-items/{item}/entries', [PasswordEntryController::class, 'store']);
    Route::delete('/password-entries/{entry}', [PasswordEntryController::class, 'destroy']);

    Route::put('/password', [PasswordController::class, 'update']);
});

Route::middleware(['auth:sanctum'])->group(function () {
    Route::delete('/account', [AccountController::class, 'destroy']);
});

Route::get('/email/verify/{id}/{hash}', VerifyEmailController::class)
  ->middleware(['auth:sanctum', 'signed'])
  ->name('verification.verify_api');
