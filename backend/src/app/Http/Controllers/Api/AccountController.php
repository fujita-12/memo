<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class AccountController extends Controller
{
    public function destroy(Request $request)
    {
        $request->validate([
            // guardを明示（cookieログイン想定）
            'current_password' => ['required', 'current_password:web'],
        ]);

        $user = $request->user();
        $userId = $user->id;

        DB::transaction(function () use ($user, $userId) {
            // 紐づくデータを削除
            $user->notebooks()->each(function ($nb) {
                $nb->notes()->delete();
                $nb->delete();
            });

            // Sanctum tokens を作っている場合の掃除（あっても害なし）
            if (method_exists($user, 'tokens')) {
                $user->tokens()->delete();
            }

            // ユーザー行を「確実に」削除し、失敗したら例外にする
            $deleted = User::whereKey($userId)->delete();
            if ($deleted !== 1) {
                throw new \RuntimeException("User delete failed (id={$userId})");
            }
        });

        // セッション破棄（API経由でセッションが無い場合もあるのでガード）
        Auth::guard('web')->logout();
        if ($request->hasSession()) {
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->noContent();
    }
}
