<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordEntry;
use App\Models\PasswordItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PasswordEntryController extends Controller
{
    // 一覧：詳細ページ下に積む用（最新順）
    public function index(Request $request, PasswordItem $item)
    {
        $list = $item->list;
        if (!$list || $list->user_id !== $request->user()->id) {
            abort(404);
        }

        return $item->entries()
            ->latest()
            ->get(['id', 'password_item_id', 'title', 'body', 'created_at', 'updated_at'])
            ->map(function ($e) {
                // bodyは暗号化したいならここで decrypt する設計に変えられるが、
                // 今回はまず平文でいく（フロント表示＆コピーが楽）
                return $e;
            });
    }

    // 作成：詳細ページ右下＋
    public function store(Request $request, PasswordItem $item)
    {
        $list = $item->list;
        if (!$list || $list->user_id !== $request->user()->id) {
            abort(404);
        }

        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body'  => ['required', 'string', 'max:5000'],
        ]);

        $entry = $item->entries()->create([
            'title' => $data['title'],
            'body'  => $data['body'],
        ]);

        return response()->json($entry, 201);
    }

    public function update(Request $request, PasswordEntry $entry)
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'body'  => ['required', 'string'],
        ]);

        $entry->update($data);

        return response()->json($entry);
    }

    public function destroy(Request $request, PasswordEntry $entry)
    {
        $item = PasswordItem::find($entry->password_item_id);
        $list = $item?->list;

        if (!$item || !$list || $list->user_id !== $request->user()->id) {
            abort(404);
        }

        $entry->delete();
        return response()->noContent();
    }
}
