<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PasswordItem;
use App\Models\PasswordList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;

class PasswordItemController extends Controller
{
    public function index(Request $request, PasswordList $list)
    {
        if ($list->user_id !== $request->user()->id) {
            abort(404);
        }

        return $list->items()
            ->with(['latestEntry:id,password_item_id,title,body,created_at'])
            ->latest()
            ->get(['id','password_list_id','title','created_at','updated_at']);
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
