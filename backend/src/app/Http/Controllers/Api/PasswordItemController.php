<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordItem;
use App\Models\PasswordList;
use App\Models\PasswordEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PasswordItemController extends Controller
{
    public function index(Request $request, PasswordList $list)
    {
        if ($list->user_id !== $request->user()->id) {
            abort(404);
        }

        // items を取得（latest_entry も一緒に返す）
        $items = $list->items()
            ->with([
                // latestOfMany の JOIN で「password_item_id が曖昧」になりやすいのでテーブル名付きで select
                'latestEntry' => function ($q) {
                    $q->select(
                        'password_entries.id',
                        'password_entries.password_item_id',
                        'password_entries.title',
                        'password_entries.body',
                        'password_entries.created_at'
                    );
                },
            ])
            ->latest()
            ->get(['id', 'password_list_id', 'title', 'created_at', 'updated_at']);

        $ids = $items->pluck('id');

        // プレビュー用：古い順に entries を全部引いて、PHP側で itemごとに先頭3件にする
        $entries = PasswordEntry::query()
            ->whereIn('password_item_id', $ids)
            ->orderBy('created_at', 'asc')
            ->get(['id', 'password_item_id', 'title', 'body', 'created_at']);

        $previewMap = $entries
            ->groupBy('password_item_id')
            ->map(function ($group) {
                return $group->take(3)->values()->map(function ($e) {
                    return [
                        'id' => $e->id,
                        'title' => $e->title,
                        'body' => $e->body,
                        'created_at' => $e->created_at,
                    ];
                })->all();
            });

        return $items->map(function ($it) use ($previewMap) {
            return [
                'id' => $it->id,
                'password_list_id' => $it->password_list_id,
                'title' => $it->title,
                'created_at' => $it->created_at,
                'updated_at' => $it->updated_at,

                //  最新1件（コピーに使う）
                'latest_entry' => $it->latestEntry ? [
                    'id' => $it->latestEntry->id,
                    'password_item_id' => $it->latestEntry->password_item_id,
                    'title' => $it->latestEntry->title,
                    'body' => $it->latestEntry->body,
                    'created_at' => $it->latestEntry->created_at,
                ] : null,

                //  古い順に3件（一覧の3行表示に使う）
                'preview_entries' => $previewMap->get($it->id, []),
            ];
        });
    }

    public function store(Request $request, PasswordList $list)
    {
        if ($list->user_id !== $request->user()->id) {
            abort(404);
        }

        $data = $request->validate([
            'title'  => ['required', 'string', 'max:255'],
            'secret' => ['nullable', 'string', 'max:2000'],
        ]);

        $item = $list->items()->create([
            'title'  => $data['title'],
            'secret' => Crypt::encryptString($data['secret'] ?? ''),
        ]);

        return response()->json($item->only(['id', 'password_list_id', 'title', 'created_at', 'updated_at']), 201);
    }

    public function show(Request $request, PasswordItem $item)
    {
        $list = $item->list;

        if (!$list || $list->user_id !== $request->user()->id) {
            abort(404);
        }

        return response()->json([
            'id' => $item->id,
            'password_list_id' => $item->password_list_id,
            'title' => $item->title,
            'created_at' => $item->created_at,
            'updated_at' => $item->updated_at,
        ]);
    }

    public function update(Request $request, PasswordItem $item)
    {
        $list = $item->list;

        if (!$list || $list->user_id !== $request->user()->id) {
            abort(404);
        }

        $data = $request->validate([
            'title'  => ['sometimes', 'required', 'string', 'max:255'],
            'secret' => ['sometimes', 'required', 'string', 'max:2000'],
        ]);

        if (array_key_exists('title', $data)) {
            $item->title = $data['title'];
        }
        if (array_key_exists('secret', $data)) {
            $item->secret = Crypt::encryptString($data['secret']);
        }

        $item->save();

        return response()->json($item->only(['id', 'password_list_id', 'title', 'created_at', 'updated_at']));
    }

    public function destroy(Request $request, PasswordItem $item)
    {
        $list = $item->list;

        if (!$list || $list->user_id !== $request->user()->id) {
            abort(404);
        }

        $item->delete();

        return response()->noContent();
    }
}
